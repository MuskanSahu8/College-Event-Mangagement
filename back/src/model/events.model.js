import mongoose from "mongoose";
const eventSchema =mongoose.Schema({
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
    dept:{
        type:String
    },
     createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

},
    {timestamps:true});
const Event =mongoose.model("Event",eventSchema);
export {Event}