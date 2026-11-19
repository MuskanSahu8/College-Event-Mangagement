
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";

const Auth = async (req, res, next) => {
    try {

        // Get JWT from HTTP-only cookie
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: "Please sign in to continue",
                code: "TOKEN_MISSING",
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        // Find the actual user in the database
        const user = await User.findById(decoded.id)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        // Attach user to request
        req.user = user;

        return next();

    } catch (error) {

        console.error(
            "Auth Middleware Error:",
            error.message
        );

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session expired. Please sign in again.",
                code: "TOKEN_EXPIRED",
            });
        }

        return res.status(401).json({
            message: "Invalid authentication token",
            code: "INVALID_TOKEN",
        });
    }
};

export { Auth };
