import { Router } from "express";
import { jwt_verify } from "../middlewares/authorization.middleware.js";
import { like_obj } from "../controllers/like.controller.js";

const router = Router();

router.route("/c/:id/like/video").post(jwt_verify, like_obj.like_video);
router.route("/c/:id/like/tweet").post(jwt_verify, like_obj.like_tweet);
router.route("/c/:id/like/comment").post(jwt_verify, like_obj.like_comment);



export default router;