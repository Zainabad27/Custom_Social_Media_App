import { Router } from "express";
import { dashboard_obj } from "../controllers/dashboard.controller.js";
import { jwt_verify } from "../middlewares/authorization.middleware.js";

const router = Router()

router.route("/get/stats").get(jwt_verify, dashboard_obj.get_stats);

router.route("/get/all/videos").get(jwt_verify, dashboard_obj.all_videos);


export default router;