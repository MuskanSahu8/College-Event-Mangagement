import mongoose from "mongoose";
import { Event } from "../model/events.model.js";
import Registration from "../model/registration.model.js";

const registerEvent = async (req, res) => {
  try {
    // 1. Get event ID from URL
    const { id } = req.params;

    // 2. Validate event ID before querying MongoDB
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    // 3. Get registration details from request body
    const {
      name,
      className,
      universityRollno,
      email,
      phone,
      dept,
    } = req.body;

    // 4. Validate required fields
    if (
      !name ||
      !className ||
      !universityRollno ||
      !email ||
      !phone ||
      !dept
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 5. Check whether the event exists
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // 6. Check the registration deadline
    if (!event.lastDate) {
      return res.status(400).json({
        message: "Registration deadline is not configured for this event",
      });
    }

    // Format today's date as YYYY-MM-DD using local server time
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    const lastDate = String(event.lastDate).slice(0, 10);

    // Registration is allowed on the lastDate itself
    if (today > lastDate) {
      return res.status(400).json({
        message: "Registration deadline has passed",
      });
    }

    // 7. Check whether event capacity is configured
    const capacity = Number(event.capacity);

    if (
      event.capacity === undefined ||
      event.capacity === null ||
      event.capacity === "" ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      return res.status(400).json({
        message: "Valid event capacity is not configured. Please contact the organizer.",
      });
    }
    // 8. Check whether this student has already registered
    const alreadyRegistered = await Registration.findOne({
      user: req.user._id,
      event: id,
    });

    if (alreadyRegistered) {
      return res.status(400).json({
        message: "You are already registered for this event",
      });
    }

    // 9. Count existing registrations for this event
    const registrationCount = await Registration.countDocuments({
      event: id,
    });

    // 10. Stop registration if the event is full
    if (registrationCount >= capacity) {
      return res.status(400).json({
        message: "Sorry, this event is full",
      });
    }

    // 9. Stop registration if the event is full
    if (registrationCount >= capacity) {
      return res.status(400).json({
        message: "Sorry, this event is full",
      });
    }

    // 11. Create registration
    const registration = await Registration.create({
      user: req.user._id,
      event: id,
      name,
      className,
      universityRollno,
      email,
      phone,
      dept,
    });

    return res.status(201).json({
      message: "Registered successfully",
      registration,
    });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
    })
      .populate("event", "eventName about eventdate dept")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Registrations fetched successfully",
      registrations,
    });
  } catch (error) {
    console.error("GET REGISTRATIONS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch registrations",
    });
  }
};

const getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Only the event owner can view registrations.
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to view these registrations",
      });
    }

    const registrations = await Registration.find({
      event: id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Event registrations fetched successfully",
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("GET EVENT REGISTRATIONS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch event registrations",
    });
  }
};


export { registerEvent, getMyRegistrations, getEventRegistrations };