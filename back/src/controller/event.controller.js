import { Event } from "../model/events.model.js";

const createEvent =async(req,res)=>{
   try {
     //fetch
     const {collegeName,eventName,about,eventdate} =req.body;
     //validate
     if(!collegeName || !eventName|| !about|| !eventdate){
         return res.status(400).json({
            message:"all fields are required"
         })
     }
     //create object
     const events= await Event.create({
        collegeName,
        eventName,
        about,
        eventdate,
         user: req.user._id
     })
     res.status(200).json({
        message:"event created successfully",
        data:{
         collegeName:events.collegeName,
        eventName:events.eventName,
        about:events.about,
        eventdate:events.eventdate,
        
        }
     })
     
   } catch (error) {
    res.status(500).json({
        message:"cannot create event",
       error: error.message,
    })
   }
}

const getEvent = async(req,res)=>{
    try{
        const events= await Event.find({
            user:req.user._id,
        })
        res.status(200).json({
            message:"events fetched successfully",
            events
        })

    }catch(error){
        res.status(500).json({
        message:"cannot fetch event",
       error: error.message,
    })
    }
}
const getEventById = async(req,res)=>{
    try{
        const events= await Event.findById( {
            _id:req.params.id,
            user:req.user._id,

        })
         if (!events) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        res.status(200).json({
            message:"events fetched successfully",
            events
        })

    }catch(error){
          res.status(500).json({
        message:"cannot fetch event",
       error: error.message,
    })
    }
}
const  updateEvent =async(req,res)=>{
    try{
        //fethch
        const {collegeName,eventName,about,eventdate}= req.body;
// validate
        const event =await Event.findOneAndUpdate({
            _id:req.params.id,
            user:req.user._id
        },{
        collegeName,eventName,about,eventdate},
        {
            new:true
        }
    )
    if(!event){
         res.status(500).json({
            message:"update failure",
         })
    }
    res.status(200).json({
        message:"updated successful",
        event:collegeName,eventName,about,eventdate

    })
    }catch(error){
        res.status(500).json({
            message:"update failure"
        })
    }
}
const deleteEvent = async(req,res)=>{
    try{
        await Event.findByIdAndDelete({
            _id:req.params.id,
            user:req.user._id,
        })
        res.status(200).json({
            message:"delted successfully",
        })
    }catch(error){
        res.status(500).json({
            message:error.message
        })

    }
}
export {createEvent,getEvent, updateEvent, getEventById,deleteEvent};