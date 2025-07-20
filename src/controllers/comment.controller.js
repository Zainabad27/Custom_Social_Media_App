import { async_handler } from "../utils/async_handler.js";
import { MyError } from "../utils/Api_Error.js";
import { videos } from "../models/video.model.js";
import { comments } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const comment_on_video = async_handler(async (req, res) => {
    // secured route.
    const { content, vidtitle } = req.body;

    if (!content) {
        throw new MyError(401, "Comment Cannot be Empty")

    }
    if (!vidtitle) {
        throw new MyError(401, "Comment's Video was not sent");
    }
    const id = req.user.id;
    if (!id) {
        throw new MyError(401, "Owner of comment was not sent");
    }

    const vidinstance = await videos.findOne({ vidtitle: vidtitle });
    if (!vidinstance) {
        throw new MyError(401, "Video does not exists in our database.")
    }

    const videoid = vidinstance.id;

    const commentinstance = await comments.create({
        content,
        owner: id,
        video: videoid,
    });



    if (!commentinstance) {
        throw new MyError(500, "Problem occured while saving the data in the database.");
    }

    res.status(201).json(
        new ApiResponse(201,
            {},
            "Comment saved in the database succesfully."));


});



export { comment_on_video }