import Router from "express"
import { createFeed, getFeedback } from "../controller/feedback.controller.js";
import { Auth } from "../middleware/auth.middleware.js";
const router= Router();

router.post("/create",Auth,createFeed);
router.get("/event/:eventId",getFeedback);
export  default router;