import { Router } from "express";
import { tweet_obj } from "../controllers/tweet.controller.js";
import { jwt_verify } from "../middlewares/authorization.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();


router.route("/maketweet").post(jwt_verify, upload.fields([{
    name: "tweet_media",
    maxCount: 4  // maximum 4 photos can be uploaded in a single tweet.
}]), tweet_obj.make_a_tweet);

router.route("/c/:username/getalltweets").get(tweet_obj.get_all_tweets);

export default router;