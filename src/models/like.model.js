import mongoose from "mongoose";

const likeschema = new mongoose.Schema({

    onvideo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "video",
        default: null
    },
    ontweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
        default: null

    },
    oncomment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null  

    },
    owner_of_like: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    }
}, { timestamps: true });


const likes = mongoose.model("Like", likeschema);

export { likes }