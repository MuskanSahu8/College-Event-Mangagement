import express from "express";
import {
  createCommittee,
  getCommittees,
} from "../controller/committee.controller.js";
import { Auth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const committeeRouter = express.Router();

// Only organizers can create committees
committeeRouter.post(
  "/create",
  Auth,
  allowRoles("organizer"),
  createCommittee
);

// Students and organizers can view committees
committeeRouter.get(
  "/",
  Auth,
  allowRoles("organizer", "student"),
  getCommittees
);

export default committeeRouter;