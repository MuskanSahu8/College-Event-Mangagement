import { Feedback } from "../model/feedback.model.js";

const createFeed = async (req, res) => {
    try {
        //fetch
        const {event, rating, comment} = req.body;
        //validate
        if (!event || !rating || !comment) {
            return res.status(400).json({
                message: "All fields are required",
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
export { createFeed,getFeedback }