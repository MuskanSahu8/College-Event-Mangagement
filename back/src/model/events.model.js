import mongoose from "mongoose";
const eventSchema =mongoose.Schema({
    collegeName:{
        type:String,
        trim:true,
        required:true,
    },
    eventName:{
        type:String,
        required:true,
    },
    about:{
        type:String,
        required:true,
    },
    eventdate:{
        type:String,
        required:true,
    },
     user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

},
    {timestamps:true});
const Event =mongoose.model("Event",eventSchema);
export {Event}