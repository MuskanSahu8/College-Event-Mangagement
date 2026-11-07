import { Community } from "../model/community.model.js";

// Create a community
const createCommunity = async (req, res) => {
    try {
        const { name, category, description } = req.body;

        // Validate required fields
        if (!name || !category) {
            return res.status(400).json({
                message: "Community name and category are required",
            });
        }

        // Allow only the specified categories
        const allowedCategories = ["Tech", "Literary", "Other"];

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                message: "Invalid community category",
            });
        }

        // Check whether the community already exists
        const existingCommunity = await Community.findOne({
            name: name.trim(),
        });

        if (existingCommunity) {
            return res.status(409).json({
                message: "Community already exists",
            });
        }

        // Create the community
        const community = await Community.create({
            name: name.trim(),
            category,
            description,
            createdBy: req.user._id,

            // The creator is also the first organizer
            organizers: [req.user._id],
        });

        return res.status(201).json({
            message: "Community created successfully",
            community,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create community",
            error: error.message,
        });
    }
};

// Get all active communities
const getCommunities = async (req, res) => {
    try {
        const communities = await Community.find({
            isActive: true,
        })
            .populate("organizers", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Communities fetched successfully",
            communities,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch communities",
            error: error.message,
        });
    }
};

export { createCommunity, getCommunities };