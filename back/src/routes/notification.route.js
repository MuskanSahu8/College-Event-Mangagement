import express from "express";

import {
    getNotifications,
    sendAnnouncement,
    markNotificationRead,
} from "../controller/notification.controller.js";

import { Auth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const notificationRouter = express.Router();

// Students can view their own notifications
notificationRouter.get(
    "/",
    Auth,
    allowRoles("student"),
    getNotifications
);

// Only admins can send announcements
notificationRouter.post(
    "/announcement",
    Auth,
    allowRoles("organizer"),
    sendAnnouncement
);

// Students can mark their own notifications as read
notificationRouter.patch(
    "/:id/read",
    Auth,
    allowRoles("student"),
    markNotificationRead
);

export default notificationRouter;