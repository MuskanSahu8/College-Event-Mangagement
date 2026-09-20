import Router from "express"
import { signin, signup } from "../controller/user.controller.js"
const routes=Router();
routes.post("/signup",signup);
routes.post("/signin",signin);
export default routes;