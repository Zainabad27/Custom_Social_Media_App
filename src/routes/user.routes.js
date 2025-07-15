import { Router } from "express";
import { user_register, user_login, user_logout,refreshaccesstoken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { jwt_verify } from "../middlewares/authorization.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([{
    name: "avatar",
    maxCount: 1
}, {
    name: "coverimage",
    maxCount: 1
}]), user_register);


router.route("/login").post(user_login);


//secured routes
router.route("/logout").post(jwt_verify, user_logout);

router.route("/refreshAccesstoken").post(refreshaccesstoken);




export default router;