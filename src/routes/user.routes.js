import { Router } from "express";
import {user_register} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(user_register)



export default router;