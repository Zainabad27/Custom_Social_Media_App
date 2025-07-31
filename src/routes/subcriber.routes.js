import { Router } from "express";
import { jwt_verify } from "../middlewares/authorization.middleware.js"
import { subscribe_obj } from "../controllers/subscribe.controller.js";

const router = Router();

router.route("/c/:id/subscribe/channel").post(jwt_verify,subscribe_obj.subscribe);



router.route("/c/:id/unsubscribe/channel").post(jwt_verify,subscribe_obj.unsubscribe);


export default router;//l