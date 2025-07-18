import { Router } from "express";
import { user_register, user_login, user_logout, refresh_accesstoken, update_password, updateuserdetails } from "../controllers/user.controller.js";
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


//secured routes(user is already logged in)
router.route("/logout").post(jwt_verify, user_logout);

router.route("/refreshAccesstoken").post(refresh_accesstoken);

router.route("/update-password").patch(jwt_verify, update_password);
router.route("/update-user/details").patch(jwt_verify, upload.fields([{
    name: "avatar",
    maxCount: 1
}, {
    name: "coverimage",
    maxCount: 1
}]), updateuserdetails);




export default router;