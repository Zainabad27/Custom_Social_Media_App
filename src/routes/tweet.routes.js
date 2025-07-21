import { Router } from "express";
import { make_a_tweet, get_all_tweets } from "../controllers/tweet.controller.js";
import { jwt_verify } from "../middlewares/authorization.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();


router.route("/maketweet").post(jwt_verify, upload.fields([{
    name: "tweet_media",
    maxCount: 4  // maximum 4 photos can be uploaded in a single tweet.
}]), make_a_tweet);

router.route("/c/:username/getalltweets").get(get_all_tweets);

export default router;