
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.route.js";
import eventRouter from "./routes/event.route.js";
import registerRouter from "./routes/registration.route.js";
import feedbackRouter from "./routes/feedback.route.js";
import communityRouter from "./routes/community.route.js";
import notificationRouter from "./routes/notification.route.js";
import committeeRouter from "./routes/committee.route.js";

const app = express();


// CORS configuration
app.use(cors({
    origin:"https://college-event-mangagement-gmq2t92tw-a-352e.vercel.app/",
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/user", userRouter);
app.use("/api/event", eventRouter);
app.use("/api/register", registerRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/community", communityRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/committee", committeeRouter);

// Static files
app.use("/uploads", express.static("uploads"));

// Home route
app.get("/", (req, res) => {
    res.send("Backend is running");
});

export default app;
