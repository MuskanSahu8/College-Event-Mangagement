import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../model/user.model.js";

// Cookie configuration
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
};

const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000;
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

// Generate tokens
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

// Hash refresh token before saving it
const hashToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

// Signup
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!["student", "organizer"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: normalizedEmail,
            role,
            password: hashedPass
        });

        return res.status(201).json({
            message: "Signup successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Signup failed"
        });
    }
};

// Signin

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const matchPass = await bcrypt.compare(
            password,
            user.password
        );

        if (!matchPass) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save hashed refresh token
        user.refreshTokenHash = hashToken(refreshToken);
        await user.save();

        // Set access token cookie
        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: ACCESS_TOKEN_EXPIRY
        });

        // Set refresh token cookie
        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: REFRESH_TOKEN_EXPIRY
        });

        return res.status(200).json({
            message: "Signin successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Signin Controller Error:", error);

        return res.status(500).json({
            message: "Signin failed"
        });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            try {
                const decoded = jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET
                );

                const user = await User.findById(decoded.id);

                if (
                    user &&
                    user.refreshTokenHash === hashToken(refreshToken)
                ) {
                    user.refreshTokenHash = null;
                    await user.save();
                }
            } catch {
                // Continue clearing cookies even if the token is expired
            }
        }

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Logout failed"
        });
    }
};

// Get logged-in user
const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            message: "User fetched successfully",
            user: req.user
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export {
    signup,
    signin,
    refreshAccessToken,
    logout,
    getMe
};