import { Router } from "express";
import { obj1 } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { jwt_verify } from "../middlewares/authorization.middleware.js";


const router = Router();

router.route("/register").post(upload.fields([{
    name: "avatar",
    maxCount: 1
}, {
    name: "coverimage",
    maxCount: 1
}]), obj1.user_register)


router.route("/login").post(obj1.user_login);


// secured routes(user is already logged in)
router.route("/logout").post(jwt_verify, obj1.user_logout);

router.route("/refreshAccesstoken").post(obj1.refresh_accesstoken);

router.route("/update-password").post(jwt_verify, obj1.update_password);
router.route("/update-user/details").patch(jwt_verify, upload.fields([{
    name: "avatar",
    maxCount: 1
}, {
    name: "coverimage",
    maxCount: 1
}]), obj1.updateuserdetails);
   
router.route("/c/:username/getuserprofile").get(jwt_verify, obj1.getuserchannelprofile);
router.route("/getwatchhistory").get(jwt_verify, obj1.getuserwatchhistory);

router.route("/clear/watchhistory").post(jwt_verify, obj1.clear_watch_history);






export default router;