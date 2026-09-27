import mongoose from "mongoose";
const registrationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    className: {
        type: String,
        required: true
    },
    universityRollno:{
        type:String,
        required:true,
    },
    email:{
          type:String,
        required:true
    },
    phone:{
          type:String,
        required:true
    },
    dept: {
  type: String,
  required: true
},

}, { timestamps: true });
const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;