import { Router } from "express";
import { jwt_verify } from "../middlewares/authorization.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { video_obj } from "../controllers/video.controller.js";



const router = Router();


router.route("/uploading-video").post(
  jwt_verify,
  upload.fields([{
    name: "videofile",
    maxCount: 1
  }, {
    name: "thumbnail",
    maxCount: 1
  }]),
  video_obj.upload_video);


// router.route("/getvideo").get(video_obj.getvideo);


export default router;