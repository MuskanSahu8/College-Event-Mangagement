import Notification from "../model/notification.model.js";
import { User } from "../model/user.model.js";

// 1. Get notifications for the logged-in student
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user._id,
        })
            .populate("event", "eventName eventdate")
            .sort({ createdAt: -1 });

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false,
        });

        return res.status(200).json({
            message: "Notifications fetched successfully",
            unreadCount,
            notifications,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message,
        });
    }
};

// 2. Admin sends an announcement to all students
// 2. Organizer sends an announcement to all students
const sendAnnouncement = async (req, res) => {
    try {
        const { title, message, eventId } = req.body;

        if (!title?.trim() || !message?.trim()) {
            return res.status(400).json({
                message: "Title and message are required",
            });
        }

        // Find all students
        const students = await User.find({
            role: "student",
        }).select("_id");

        if (students.length === 0) {
            return res.status(404).json({
                message: "No students found",
            });
        }

        // Optional event association
        let event = null;

        if (eventId) {
            event = await Event.findById(eventId);

            if (!event) {
                return res.status(404).json({
                    message: "Event not found",
                });
            }

            // Only the organizer who created this event can announce it
            if (event.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    message: "You can only announce your own events",
                });
            }
        }

        const notifications = students.map((student) => ({
            recipient: student._id,
            title: title.trim(),
            message: message.trim(),
            type: "announcement",
            ...(event ? { event: event._id } : {}),
        }));

        await Notification.insertMany(notifications);

        return res.status(201).json({
            message: "Announcement sent successfully",
            recipientsCount: notifications.length,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send announcement",
            error: error.message,
        });
    }
};
// 3. Mark a notification as read
const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                recipient: req.user._id,
            },
            {
                isRead: true,
            },
            {
                new: true,
            }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            message: "Notification marked as read",
            notification,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update notification",
            error: error.message,
        });
    }
};

export {
    getNotifications,
    sendAnnouncement,
    markNotificationRead,
};