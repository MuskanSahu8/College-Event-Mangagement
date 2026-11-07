import { Event } from "../model/events.model.js";
import { User } from "../model/user.model.js";

import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import Notification from "../model/notification.model.js";
import Committee from "../model/committee.model.js";
import Registration from "../model/registration.model.js";

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "EMS-events" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
// CREATE EVENT

const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      about,
      eventdate,
      dept,
      lastDate,
      capacity,
      venue,
      startTime,
      endTime,
      committee
    } = req.body;

    // Validate required fields
    if (!eventName || !about || !eventdate || !lastDate || capacity === undefined || capacity === "" || !venue || !startTime || !endTime) {
      return res.status(400).json({
        message: "Please provide all required event details",
      });
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
      return res.status(400).json({
        message: "Please provide valid times in HH:mm format"
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        message: "Event end time must be after start time"
      });
    }

    // Validate capacity
    const eventCapacity = Number(capacity);

    if (!Number.isInteger(eventCapacity) || eventCapacity < 1) {
      return res.status(400).json({
        message: "Capacity must be a positive whole number",
      });
    }

    // Validate registration deadline
    const deadline = new Date(lastDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(deadline.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid registration deadline",
      });
    }

    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) {
      return res.status(400).json({
        message: "Registration deadline cannot be in the past",
      });
    }

    // Validate that registration deadline is not after the event date
    const eventDay = new Date(eventdate);

    if (Number.isNaN(eventDay.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid event date",
      });
    }

    eventDay.setHours(0, 0, 0, 0);

    if (deadline > eventDay) {
      return res.status(400).json({
        message: "Registration deadline cannot be after the event date",
      });
    }
    // Validate selected committee
    if (committee) {
      const selectedCommittee = await Committee.findOne({
        _id: committee,
        isActive: true,
      });

      if (!selectedCommittee) {
        return res.status(400).json({
          message: "Selected committee does not exist or is inactive",
        });
      }
    }
    // Upload image to Cloudinary if provided
    let imageUrl = "";

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadedImage.secure_url;
    }

    // Create event
    const event = await Event.create({
      eventName,
      about,
      eventdate,
      lastDate,
      capacity: eventCapacity,
      dept,
      committee: committee || null,
      user: req.user._id,
      image: imageUrl,
      venue,
      startTime,
      endTime,

    });
    try {
      const students = await User.find({ role: "student" }).select("_id");

      if (students.length > 0) {
        const notifications = students.map((student) => ({
          recipient: student._id,
          title: "New Event Created",
          message: `A new event "${event.eventName}" has been created on ${event.eventdate}.`,
          type: "new_event",
          event: event._id,
        }));

        await Notification.insertMany(notifications);
      }
    } catch (notificationError) {
      // Keep the event saved even if notifications fail
      console.error("Notification creation failed:", notificationError);
    }


    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Cannot create event",
      error: error.message,
    });
  }
};

// GET ALL EVENTS
const getEvent = async (req, res) => {
  try {
    // 1. Fetch all events
    const events = await Event.find()
      .populate("user", "name email")
      .populate("committee", "name description")
      .sort({ createdAt: -1 });

    // 2. Add registration statistics to each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        // Count students registered for this event
        const registrationCount = await Registration.countDocuments({
          event: event._id,
        });

        // Get event capacity
        const capacity = Number(event.capacity) || 0;

        // Calculate available seats
        const availableSeats = Math.max(
          capacity - registrationCount,
          0
        );

        // Calculate percentage of seats filled
        const seatsFilledPercentage =
          capacity > 0
            ? Math.min(
              Math.round((registrationCount / capacity) * 100),
              100
            )
            : 0;

        // Return event data with statistics
        return {
          ...event.toObject(),
          registrationCount,
          availableSeats,
          seatsFilledPercentage,
        };
      })
    );

    // 3. Send response
    return res.status(200).json({
      message: "events fetched successfully",
      events: eventsWithStats,
    });
  } catch (error) {
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
      .populate("user", "name email")
      .populate("committee", "name description");


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
      lastDate,
      dept,
      capacity
    } = req.body;

    if (capacity !== undefined && capacity !== "") {
      const eventCapacity = Number(capacity);

      if (!Number.isInteger(eventCapacity) || eventCapacity < 1) {
        return res.status(400).json({
          message: "Capacity must be a positive whole number",
        });
      }

      event.capacity = eventCapacity;
    }
    const event = await Event.findOne(
      {
        _id: id,
        user: req.user._id,
      });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you are not the owner",
      });
    }
    event.eventName = eventName;
    event.about = about;
    event.eventdate = eventdate;
    event.lastDate = lastDate;
    event.dept = dept;

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(
        req.file.buffer
      );

      event.image = uploadedImage.secure_url;
    }
    await event.save();

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

    if (req.user.role !== "organizer") {
      return res.status(403).json({
        message: "Only organizers can delete events",
      });
    }

    const event = await Event.findOne({
      _id: req.params.id,
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not the owner of this event",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    return res.status(500).json({
      message: "Failed to delete event",
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