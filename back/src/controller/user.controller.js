
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

// Token expiry
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000;
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

// Check environment variables
const checkSecrets = () => {
    if (
        !process.env.ACCESS_TOKEN_SECRET ||
        !process.env.REFRESH_TOKEN_SECRET
    ) {
        throw new Error("JWT secrets are missing in environment variables");
    }
};

// Generate access token
const generateAccessToken = (user) => {
    checkSecrets();

    return jwt.sign(
        {
            id: user._id.toString(),
            email: user.email,
            role: user.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
};

// Generate refresh token
const generateRefreshToken = (user) => {
    checkSecrets();

    return jwt.sign(
        { id: user._id.toString() },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

// Hash refresh token
const hashToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

// Safe user response
const formatUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
});

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role
        });

        return res.status(201).json({
            message: "Signup successful",
            user: formatUser(user)
        });

    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Signup failed"
        });
    }
};

// Signin

const signin = async (req, res) => {
    try {
        console.log("1. Signin request received");

        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        console.log("2. Input validation successful");

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        console.log("3. User found:", !!user);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        console.log("4. Password field exists:", !!user.password);

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        console.log("5. Password matched:", isPasswordCorrect);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        console.log("6. Generating tokens");

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        console.log("7. Tokens generated");

        user.refreshTokenHash = hashToken(refreshToken);

        await user.save();

        console.log("8. User saved successfully");

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: ACCESS_TOKEN_EXPIRY
        });

        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: REFRESH_TOKEN_EXPIRY
        });

        console.log("9. Cookies configured");

        return res.status(200).json({
            message: "Signin successful",
            accessToken,
            user: formatUser(user)
        });

    } catch (error) {
        console.error("Signin Controller Error:", error);

        return res.status(500).json({
            message: "Signin failed",
            error: error.message
        });
    }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token missing"
            });
        }

        checkSecrets();

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user || !user.refreshTokenHash) {
            return res.status(401).json({
                message: "Invalid refresh session"
            });
        }

        if (user.refreshTokenHash !== hashToken(refreshToken)) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshTokenHash = hashToken(newRefreshToken);
        await user.save();

        res.cookie("accessToken", newAccessToken, {
            ...cookieOptions,
            maxAge: ACCESS_TOKEN_EXPIRY
        });

        res.cookie("refreshToken", newRefreshToken, {
            ...cookieOptions,
            maxAge: REFRESH_TOKEN_EXPIRY
        });

        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error("Refresh token error:", error);

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(401).json({
            message: "Refresh token expired or invalid"
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
            } catch (error) {
                console.error("Logout token validation:", error.message);
            }
        }

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Logout failed"
        });
    }
};

// Get logged-in user
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "-password -refreshTokenHash"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user: formatUser(user)
        });

    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Failed to fetch user"
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
