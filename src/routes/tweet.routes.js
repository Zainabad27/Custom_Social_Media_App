import { Router } from "express";
import { tweet_obj } from "../controllers/tweet.controller.js";
import { jwt_verify } from "../middlewares/authorization.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();
router.route("/c/:username/getalltweets").get(tweet_obj.get_all_tweets);

// secured tweet.
router.route("/maketweet").post(jwt_verify, upload.fields([{
    name: "tweet_media",
    maxCount: 4  // maximum 4 photos can be uploaded in a single tweet.
}]), tweet_obj.make_a_tweet);

router.route("/c/:id/delete/tweet").delete(jwt_verify,tweet_obj.delete_tweet);



export default router;