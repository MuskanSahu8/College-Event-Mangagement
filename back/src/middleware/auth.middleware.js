import { User } from "../model/user.model.js";

import jwt from "jsonwebtoken"

const Auth =async(req,res,next)=>{
    try{
        const token=req.cookies?.token;
        console.log("TOKEN",token);

        if(!token){
             return res.status(401).json({
                message: error.message
            })
        }
        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY
        )
        //find actual user in db;
        const user =await User.findById(decoded.id).select("-password");
         if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }
        req.user=user;
        next();
         console.log(user)
    }
    catch (error) {
        console.log("JWT ERROR:", error.name)
        return res.status(401).json({
            message: "invalid or expired token"
        })
    }
}
export {Auth};