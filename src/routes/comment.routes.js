import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { jwt_verify } from "../middlewares/authorization.middleware.js";
import { comment_obj } from "../controllers/comment.controller.js";

const router = Router();


router.route("/comment/on/video").post(jwt_verify, comment_obj.comment_on_video);

export default router;