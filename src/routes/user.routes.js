import { Router } from "express";
import {user_register} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/register").post(upload.fields([{
    name:"avatar",
    maxCount:1
},{
    name:"coverimage",
    maxCount:1
}]),user_register)



export default router;