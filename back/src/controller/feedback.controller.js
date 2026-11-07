import { Feedback } from "../model/feedback.model.js";

const createFeed = async (req, res) => {
    try {
        //fetch
        const { event, rating, comment } = req.body;
        //validate
        if (
            !event ||
            rating === undefined ||
            rating === null ||
            !comment?.trim()
        ) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        if (!Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
            });
        }
        const already = await Feedback.findOne(
            { user: req.user._id, event, }
        )
        if (already) {
            return res.status(400).json({
                message: "you already submit the feedback",
            });
        }
        const feedback = await Feedback.create({
            user: req.user._id,
            event,
            rating,
            comment
        });
        res.status(200).json({
            message: "feedback submitted successfully",
            feedback
        })
    } catch (error) {
        console.log("CREATE FEEDBACK ERROR:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
const getFeedback = async (req, res) => {
    try {
        const { eventId } = req.params;

        console.log("PARAMS:", req.params);
        console.log("EVENT ID FROM URL:", eventId);

        const feedback = await Feedback.find({
            event: eventId,
        })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        console.log("MATCHING FEEDBACK:", feedback);

        return res.status(200).json({
            message: "Feedback fetched successfully",
            feedback,
        });

    } catch (error) {
        console.log("GET FEEDBACK ERROR:", error);

        return res.status(500).json({
            message: error.message,
        });
    }
};
const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { rating, comment } = req.body;

    if (
      rating === undefined ||
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5 ||
      !comment?.trim()
    ) {
      return res.status(400).json({
        message: "Enter a valid rating and comment",
      });
    }

    const feedback = await Feedback.findOne({
      _id: feedbackId,
      user: req.user._id,
    });

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found or you are not authorized",
      });
    }

    feedback.rating = Number(rating);
    feedback.comment = comment.trim();

    await feedback.save();

    return res.status(200).json({
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    console.log("UPDATE FEEDBACK ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findOneAndDelete({
      _id: feedbackId,
      user: req.user._id,
    });

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found or you are not authorized",
      });
    }

    return res.status(200).json({
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.log("DELETE FEEDBACK ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
 const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({
      user: req.user._id,
    })
      .populate("event", "eventName eventdate dept")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "My feedback fetched successfully",
      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch my feedback",
      error: error.message,
    });
  }
};
export { createFeed, getFeedback,updateFeedback , deleteFeedback ,getMyFeedback }