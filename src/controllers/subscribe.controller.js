import { async_handler } from "../utils/async_handler.js";
import { MyError } from "../utils/Api_Error.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { subscribtions } from "../models/subscribtion.model.js";
class subscribe_controller {
    constructor(subsmodel) {
        this.subscribtion = subsmodel

    };


    subscribe = async_handler(async (req, res) => {
        // secured route.
        const channelid = req.params.id;
        const userid = req.user.id;
        if (!channelid) {
            throw new MyError(401, "Channel Id was not given.");
        }

        const subinstance = await this.subscribtion.create({
            subscriber: new mongoose.Types.ObjectId(userid),
            channel: new mongoose.Types.ObjectId(channelid)
        });

        res.status(200).json(new ApiResponse(200, subinstance, "Subscribed successfully."));

    })
};