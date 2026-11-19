
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";

const Auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access token is required",
                code: "TOKEN_MISSING",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        // Find the actual user in the database
        const user = await User.findById(decoded.id)
            .select("-password -refreshTokenHash");

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                code: "USER_NOT_FOUND",
            });
        }

        req.user = user;

        return next();

    } catch (error) {
        console.error("Auth Middleware Error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Access token expired",
                code: "ACCESS_TOKEN_EXPIRED",
            });
        }

        return res.status(401).json({
            message: "Invalid access token",
            code: "INVALID_ACCESS_TOKEN",
        });
    }
};

export { Auth };
