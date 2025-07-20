import { Router } from "express";
import { jwt_verify } from "../middlewares/authorization.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { upload_video } from "../controllers/video.controller.js";



const router = Router();


router.route("/uploading-video").post(
    jwt_verify,
    upload.fields([{
      name:"videofile",
      maxCount:1
    },{
      name:"thumbnail",
      maxCount:1
    }]),
    upload_video);


    export default router;