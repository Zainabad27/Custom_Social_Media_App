import { Router } from "express";
import { jwt_verify } from "../middlewares/authorization.middleware.js";
import { comment_obj } from "../controllers/comment.controller.js";

const router = Router();

// secured routes
router.route("/comment/on/video").post(jwt_verify, comment_obj.comment_on_video);
router.route("/getallcomments").get(comment_obj.get_all_comments);
router.route("/c/:id/delete/comment").delete(jwt_verify, comment_obj.delete_comment);

export default router;