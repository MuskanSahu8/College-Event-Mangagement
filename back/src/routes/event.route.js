import { Router } from "express";
import { createEvent, deleteEvent, getEvent, getEventById, updateEvent } from "../controller/event.controller.js";
import { Auth } from "../middleware/auth.middleware.js";
const router =Router();
router.post("/create",Auth,createEvent);
router.get("/get",Auth,getEvent);
router.put("/update/:id",Auth,updateEvent);
router.get("/get/:id",Auth,getEventById);
router.delete("/delete/:id",Auth,deleteEvent)


export default router;