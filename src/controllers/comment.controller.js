// utilities.
import { async_handler } from "../utils/async_handler.js";
import { MyError } from "../utils/Api_Error.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
// dependencies
import { comments } from "../models/comment.model.js";
import { videos } from "../models/video.model.js";

class comment_controller {
    constructor(commentmodel, videomodel) {
        this.comments = commentmodel;
        this.videos = videomodel;

    }

    comment_on_video = async_handler(async (req, res) => {
        // secured route.
        const { content, vidtitle } = req.body;

        if (!content ||content===""||content.trim()==="") {
            throw new MyError(401, "Comment Cannot be Empty")

        }
        if (!vidtitle) {
            throw new MyError(401, "video title was not sent.");
        }
        const id = req.user.id;
        if (!id) {
            throw new MyError(401, "Owner of comment was not sent");
        }

        const vidinstance = await this.videos.findOne({ vidtitle: vidtitle });
        if (!vidinstance) {
            throw new MyError(401, "Video does not exists in our database.")
        }

        const videoid = vidinstance.id;

        const commentinstance = await this.comments.create({
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


    get_all_comments = async_handler(async (req, res) => {
        // it fetches all the comments on a video by video title.
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;
        const { vidtitle } = req.body;
        const all_comments = await this.videos.aggregate([{
            $match: { vidtitle: vidtitle }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "all_comments",
                pipeline: [{
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: "likes",
                        localField: "_id",
                        foreignField: "oncomment",
                        as: "likes"
                    }

                },
                {
                    $addFields: {
                        total_likes: {
                            $size: "$likes"
                        }
                    }
                },
                {
                    $project: {
                        total_likes: 1,
                        content: 1,
                        owner: 1
                    }
                }]
            },


        },
        {
            $project: {
                vidtitle: 1,
                description: 1,
                veiws: 1,
                owner: 1,
                all_comments: 1,
                vidduration: 1,

            }
        }
        ]);
        if (!all_comments) {
            throw new MyError(501, "Error while fetching the comments from the database.");
        };

        res.status(200).json(
            new ApiResponse(200, all_comments[0], "comments fetched successfully.")
        )



    })


    edit_comment = async_handler(async (req, res) => {
        //secured route.
        const id = req.params.id;
        const { content } = req.body;

        if (!id) {
            throw new MyError(401, "Commment id was not given.");
        }
        if (!content) {
            throw new MyError(401, "no edited content was given.");
        }
        const commentinstance = await this.comments.findByIdAndUpdate(
            {
                id
            },
            {
                content: content
            },
            {
                new: true
            });


        if (!commentinstance) {
            throw new MyError(501, "Problem occured while Updating the comment in the database.");
        }

        res.status(202).json(
            new ApiResponse(202, commentinstance, "Comment edited successfully.")
        )


    });

    delete_comment = async_handler(async (req, res) => {
        //secured route.
        const comment_id = req.params.id;
        const user_id = req.user.id;
        if (!user_id) {
            throw new MyError(400, "Unauthorized access.");
        }
        // check if the comment deletion is done by the comment owner or not.

        if (!comment_id) {
            throw new MyError(401, "Comment Id was not given.")
        }

        const commentinstance = await this.comments.findById(comment_id);
        if (!commentinstance) {
            throw new MyError(501, "comment Id was found not in the database.");
        }
        if (!(commentinstance.owner.equals(new mongoose.Types.ObjectId(user_id)))) {
            throw new MyError(403, "Only comment owner is allowed to delete the comment.");
        }
        const result = await commentinstance.deleteOne();
        if (result.deletedCount === 0) {
            throw new MyError(500, "Error while deleteing the data from the database.");
        }

        res.status(200).json(new ApiResponse(200, commentinstance, "Comment deleted successfully."));


    })

};

const comment_obj = new comment_controller(comments, videos);

export { comment_obj }