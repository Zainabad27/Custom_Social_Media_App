import { Router } from "express";
import { make_a_tweet } from "../controllers/tweet.controller.js";
import { jwt_verify } from "../middlewares/authorization.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();


router.route("/maketweet").post(jwt_verify, upload.fields([{
    name: "tweet_media",
    maxCount: 4  // maximum 4 photos can be uploaded in a single tweet.
}]), make_a_tweet);



export default router;