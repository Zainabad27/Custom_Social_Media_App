import mongoose from "mongoose";
const subscribtionschema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    },
}, { timestamps: true });
const subscribtions = mongoose.model("Subscribtion", subscribtionschema);



export { subscribtions };