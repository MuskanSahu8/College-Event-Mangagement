import mongoose from "mongoose";
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        min:6,
        message:"min length 6"
    },
    role:{
        type:String,
        enum:["student","organizer"],
        default:"student"

    }
},{timeStamps:true});
const User=mongoose.model("User",userSchema);
export {User};
