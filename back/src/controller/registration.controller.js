import Registration from "../model/registration.model.js";

const registerEvent = async (req, res) => {
  try {
    // Get event ID from URL
    const { id } = req.params;

    // Get registration details from body
    const {
      name,
      className,
      universityRollno,
      email,
      phone,
      dept,
    } = req.body;

    // Validation
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

    // Check if already registered
    const alreadyRegistered = await Registration.findOne({
      user: req.user._id,
      event: id,
    });

    if (alreadyRegistered) {
      return res.status(400).json({
        message: "You are already registered for this event",
      });
    }

    // Create registration
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

export { registerEvent };