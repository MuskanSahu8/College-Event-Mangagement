
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

// Cookie configuration
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
};

// Token expiry: 1 day
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

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

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
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

        // Handle duplicate email race condition
        if (error.code === 11000) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        return res.status(500).json({
            message: "Signup failed"
        });
    }
};

// Signin
const signin = async (req, res) => {
    try {
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

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new Error("ACCESS_TOKEN_SECRET is missing");
        }

        // Generate one JWT
        const token = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );

        // Store JWT in HTTP-only cookie
        res.cookie("accessToken", token, {
            ...cookieOptions,
            maxAge: TOKEN_EXPIRY
        });

        return res.status(200).json({
            message: "Signin successful",
            user: formatUser(user)
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
        res.clearCookie("accessToken", cookieOptions);

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
        const user = await User.findById(req.user.id).select("-password");

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
    logout,
    getMe
};
