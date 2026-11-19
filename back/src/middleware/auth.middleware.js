import { User } from "../model/user.model.js";

import jwt from "jsonwebtoken"

const Auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access token is required",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )
        //find actual user in db;
        const user = await User.findById(decoded.id).select("-password -refreshTokenHash");
        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.log("Auth ERROR:", error.name)
        return res.status(401).json({
            message: "Access token expired",
            code: "ACCESS_TOKEN_EXPIRED",
        })
    }
    return res.status(401).json({
        message: "Invalid access token",
        code: "INVALID_ACCESS_TOKEN",
    });
}
export { Auth };