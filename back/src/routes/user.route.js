import Router from "express"
import { getMe, logout, refreshAccessToken, signin, signup } from "../controller/user.controller.js"
import { Auth } from "../middleware/auth.middleware.js";
const routes=Router();
routes.post("/signup",signup);
routes.post("/signin",signin);
routes.post("/refresh",refreshAccessToken);
routes.get("/profile",Auth, getMe);
routes.post("/logout",logout);
export default routes;