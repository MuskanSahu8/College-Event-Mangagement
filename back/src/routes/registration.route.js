import { Router } from "express"
import { Auth } from "../middleware/auth.middleware.js";
import { registerEvent } from "../controller/registration.controller.js";
const router =Router();
router.post("/register/:id",Auth,registerEvent);

export default router;