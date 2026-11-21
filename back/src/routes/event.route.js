import { Router } from "express";
import { createEvent, deleteEvent, getEvent, getEventById, updateEvent } from "../controller/event.controller.js";
import { Auth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.js";

const router =Router();
// router.post("/create",Auth,allowRoles("organizer"),(req,res,next)=>{ console.log("Reached event create route");
//     next();},upload.single("image"),createEvent);
router.post(
    "/create",
    Auth,
    allowRoles("organizer"),

    (req, res, next) => {
        console.log("Reached event create route");
        next();
    },

    upload.single("image"),

    (req, res, next) => {
        console.log("Multer received file:", !!req.file);

        if (req.file) {
            console.log("Image name:", req.file.originalname);
            console.log("Image size:", req.file.size);
            console.log("Buffer exists:", !!req.file.buffer);
        }

        next();
    },

    createEvent
);
router.get("/get",Auth,getEvent);
router.put("/update/:id",Auth,allowRoles("organizer"),upload.single("image"),updateEvent);
router.get("/get/:id",Auth,getEventById);
router.delete("/delete/:id",Auth,allowRoles("organizer"),deleteEvent)


export default router;
