import mongoose from "mongoose";


const commentschema = new mongoose.Schema({
    content: {
        type: String,
        required: true,

    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "video"
    }
}, { timestamps: true });

const comments = mongoose.model("Comment", commentschema);

export { comments }
 