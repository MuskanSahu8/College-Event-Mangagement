import "dotenv/config";
import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.route.js"
import eventRouter from "./routes/event.route.js"
import registerRouter from "./routes/registration.route.js";
import feedbackRouter  from "./routes/feedback.route.js";
import communityRouter from "./routes/community.route.js";
import notificationRouter from "./routes/notification.route.js";
import committeeRouter from "./routes/committee.route.js";




const PORT =process.env.PORT;

const app= express();
//middleware
app.use(cors({
    origin:["http://localhost:5173",
    "https://college-event-mangagement-sigma.vercel.app"],
    credentials:true
}));
app.use(cookieParser())
app.use(express.json());

//routes
app.use("/api/user",userRouter);
app.use("/api/event",eventRouter);
app.use("/api/register",registerRouter);
app.use("/api/feedback",feedbackRouter);
app.use("/community",communityRouter);
app.use("/api/notification",notificationRouter);
app.use("/api/committee", committeeRouter);


app.use("/uploads", express.static("uploads"));
app.get("/",(req,res)=>{
    res.send("backend is running");
})

export default app;
