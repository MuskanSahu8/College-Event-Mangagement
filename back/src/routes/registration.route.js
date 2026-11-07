import { Router } from "express"
import { Auth } from "../middleware/auth.middleware.js";
import { getEventRegistrations, getMyRegistrations, registerEvent } from "../controller/registration.controller.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router =Router();
router.post("/register/:id",Auth,allowRoles("student"),registerEvent);
router.get("/my-registrations",Auth, allowRoles("student"),getMyRegistrations);
router.get("/event/:id/registrations",Auth,allowRoles("organizer"),getEventRegistrations);
export default router;