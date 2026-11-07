import { Router } from "express";
import { createEvent, deleteEvent, getEvent, getEventById, updateEvent } from "../controller/event.controller.js";
import { Auth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.js";

const router =Router();
router.post("/create",Auth,allowRoles("organizer"),(req,res,next)=>{ console.log("Reached event create route");
    next();},upload.single("image"),createEvent);
router.get("/get",Auth,getEvent);
router.put("/update/:id",Auth,allowRoles("organizer"),upload.single("image"),updateEvent);
router.get("/get/:id",Auth,getEventById);
router.delete("/delete/:id",Auth,allowRoles("organizer"),deleteEvent)


export default router;