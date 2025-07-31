import { Router } from "express";
import { jwt_verify } from "../middlewares/authorization.middleware.js"
import { subscribe_obj } from "../controllers/subscribe.controller.js";

const router = Router();

router.route("/subscribe/channel").post(jwt_verify,subscribe_obj.subscribe);


export default router;