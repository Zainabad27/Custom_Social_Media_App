import { Router } from "express";
import {
    user_register,
    user_login,
    user_logout,
    refresh_accesstoken,
    update_password,
    updateuserdetails,
    getuserchannelprofile,
    getuserwatchhistory
} from "../controllers/user.controller.js";
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

router.route("/update-password").post(jwt_verify, update_password);
router.route("/update-user/details").patch(jwt_verify, upload.fields([{
    name: "avatar",
    maxCount: 1
}, {
    name: "coverimage",
    maxCount: 1
}]), updateuserdetails);

router.route("/c/:username/getuserprofile").get(jwt_verify, getuserchannelprofile);
router.route("/getwatchhistory").get(jwt_verify, getuserwatchhistory);



//checking if the DI refactor Code is working or not?
//importing the class instance.

import { obj1 } from "../DI_classes.js/user.class.js";
router.route("/login/through/classes").post(obj1.user_login.bind(obj1));




export default router;