import { async_handler } from "../utils/async_handler.js";
import { MyError } from "../utils/Api_Error.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { subscribtions } from "../models/subscribtion.model.js";
import { users } from "../models/user.model.js";
class subscribe_controller {
    constructor(subsmodel,usermodel) {
        this.subscribtion = subsmodel;
        this.users=usermodel;

    };


    subscribe = async_handler(async (req, res) => {
        // secured route.
        const channelid = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(channelid)) {
            throw new MyError(400, "not a valid mongoose ID")
        };
        if (!channelid) {
            throw new MyError(401, "Channel Id was not given.");
        }

        // checking, does the Channel even exists in DB or not.
        const channel_exists=await this.users.findById(channelid);
        if(!channel_exists){
            throw new MyError(400,"The channel you are trying to subscribe, does not exists.")
        }
        const userid = req.user.id;
        if ((new mongoose.Types.ObjectId(channelid)).equals(new mongoose.Types.ObjectId(userid))) {
            throw new MyError(403, "A user cannot subscribe itself.")
        }

        const already_subscribed = await this.subscribtion.findOne({
            subscriber: userid,
            channel: channelid
        });
        if (already_subscribed) {
            throw new MyError(401, "User is already a subscriber");
        }

        const subinstance = await this.subscribtion.create({
            subscriber: new mongoose.Types.ObjectId(userid),
            channel: new mongoose.Types.ObjectId(channelid)
        });

        if (!subinstance) {
            throw new MyError(500, "Error while saving the data into the database.")
        }

        res.status(200).json(new ApiResponse(200, subinstance, "Subscribed successfully."));

    })

    unsubscribe = async_handler(async (req, res) => {
        const userid = req.user?.id
        const channelid = req.params?.id;
        if (!channelid) {
            throw new MyError(401, "Channel id was not given.");
        };
        if (!mongoose.Types.ObjectId.isValid(channelid)) {
            throw new MyError(400, "not a valid mongoose ID")
        };

        const deleted_subscriber = await this.subscribtion.findOneAndDelete({
            subscriber: userid,
            channel: channelid
        });

        if (!deleted_subscriber) {
            throw new MyError(404, "User was not in the subscriber.")
        }

        res.status(200).json(new ApiResponse(200, deleted_subscriber, "Unsubscribed Successfully."))
    })
};

const subscribe_obj = new subscribe_controller(subscribtions,users);

export { subscribe_obj }