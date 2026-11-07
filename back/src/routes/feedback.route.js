import Router from "express"
import { createFeed, deleteFeedback, getFeedback, getMyFeedback, updateFeedback } from "../controller/feedback.controller.js";
import { Auth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
const router= Router();

router.post("/create",Auth,allowRoles("student"),createFeed);
router.get("/event/:eventId",getFeedback);
router.put("/:feedbackId" ,Auth ,updateFeedback);
router.delete("/:feedbackId",Auth,deleteFeedback);
router.get("/my-feedback", Auth, getMyFeedback);
export  default router;