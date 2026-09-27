import { Event } from "../model/events.model.js";

// CREATE EVENT
const createEvent = async (req, res) => {
  try {
    const { eventName, about, eventdate, dept } = req.body;

    // validation
    if (!eventName || !about || !eventdate) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }

    // create event
    const event = await Event.create({
      eventName,
      about,
      eventdate,
      dept,
      user: req.user._id,
    });

    return res.status(201).json({
      message: "event created successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      message: "cannot create event",
      error: error.message,
    });
  }
};


// GET ALL EVENTS
const getEvent = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "events fetched successfully",
      events,
    });
  }catch (error) {
  console.log("GET EVENTS ERROR:", error);

  return res.status(500).json({
    message: "cannot fetch events",
    error: error.message,
  });
}
};


// GET EVENT BY ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
    .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.status(200).json({
      message: "event detail fetched successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      message: "cannot fetch event",
      error: error.message,
    });
  }
};


// UPDATE EVENT
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      eventName,
      about,
      eventdate,
      dept,
    } = req.body;

    const event = await Event.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
      },
      {
        eventName,
        about,
        eventdate,
        dept,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you are not the owner",
      });
    }

    return res.status(200).json({
      message: "event updated successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      message: "update failure",
      error: error.message,
    });
  }
};


// DELETE EVENT
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you are not the owner",
      });
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      message: "event deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "delete failure",
      error: error.message,
    });
  }
};


export {
  createEvent,
  getEvent,
  getEventById,
  updateEvent,
  deleteEvent,
};