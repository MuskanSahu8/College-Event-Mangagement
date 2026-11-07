import Committee from "../model/committee.model.js";

// Organizer: Create a committee
const createCommittee = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate committee name
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Committee name is required",
      });
    }

    // Check if committee already exists
    const existingCommittee = await Committee.findOne({
      name: name.trim(),
    });

    if (existingCommittee) {
      return res.status(409).json({
        message: "Committee already exists",
      });
    }

    // Save committee in database
    const committee = await Committee.create({
      name: name.trim(),
      description: description?.trim() || "",
    });

    return res.status(201).json({
      message: "Committee created successfully",
      committee,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create committee",
      error: error.message,
    });
  }
};

// Students and organizers: Get active committees
const getCommittees = async (req, res) => {
  try {
    const committees = await Committee.find({
      isActive: true,
    }).sort({ name: 1 });

    return res.status(200).json({
      message: "Committees fetched successfully",
      committees,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch committees",
      error: error.message,
    });
  }
};

export { createCommittee, getCommittees };