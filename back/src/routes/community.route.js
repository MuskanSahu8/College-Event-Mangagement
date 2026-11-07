import express from "express";
import {
    createCommunity,
    getCommunities,
} from "../controller/community.controller.js";

import { Auth} from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const communityRouter = express.Router();

communityRouter.post("/create",Auth,allowRoles("admin"), createCommunity);
communityRouter.get("/get",Auth, getCommunities);

export default communityRouter;