// utilities
import { async_handler } from "../utils/async_handler.js";
import { MyError } from "../utils/Api_Error.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";


// dependencies
import { likes } from "../models/like.model.js"
import { comments } from "../models/comment.model.js";
import { videos } from "../models/video.model.js";
import { tweets } from "../models/tweet.model.js";

class like_controller {
    // secured route.

    constructor(like_model, vid_model, tweet_model, comment_model) {
        this.likes = like_model;
        this.comments = comment_model;
        this.tweets = tweet_model;
        this.videos = vid_model;

    }

    like_video = async_handler(async (req, res) => {
        const vid_id = req.params.id;
        const user_id = req.user?.id;
        if (!user_id) {
            throw new MyError(403, "For liking a video user should be logged in.");
        }
        if (!(mongoose.Types.ObjectId.isValid(vid_id))) {
            throw new MyError(401, "Invalid video Id given.");
        }
        const vidinstance = await this.videos.findById(vid_id);
        if (!vidinstance) {
            throw new MyError(404, "Video does not exists in the database.")
        }
        // checking if the owner has already liked the vidoe or not.
        const is_already_liked = await this.likes.aggregate([
            {
                $match: {
                    onvideo: new mongoose.Types.ObjectId(vid_id)
                }
            },
            {
                $match: {
                    owner_of_like: new mongoose.Types.ObjectId(user_id)
                }
            },
            {
                $project: {
                    _id: 0,
                    owner_of_like: 1
                }
            }
        ]);
        if (is_already_liked.length > 0) {
            throw new MyError(403, "this video is already liked by this user.")
        }
        const likeinstance = await this.likes.create({
            owner_of_like: user_id,
            onvideo: vid_id,

        });

        if (!likeinstance) {
            throw new MyError(500, "Error occured in the database while saving the like docuemnt.");
        }

        res.status(200).json(new ApiResponse(200, likeinstance, "video liked successfully."));


    });
    like_tweet = async_handler(async (req, res) => {
        const tweet_id = req.params.id;
        const user_id = req.user?.id;
        if (!user_id) {
            throw new MyError(403, "For liking a video user should be logged in.");
        }
        if (!(mongoose.Types.ObjectId.isValid(tweet_id))) {
            throw new MyError(401, "Invalid Tweet Id given.");
        }
        const tweetinstance = await this.tweets.findById(tweet_id);
        if (!tweetinstance) {
            throw new MyError(404, "This tweet does not exists in the database.")
        }
        const is_already_liked = await this.likes.aggregate([
            {
                $match: {
                    ontweet: new mongoose.Types.ObjectId(tweet_id)
                }
            },
            {
                $match: {
                    owner_of_like: new mongoose.Types.ObjectId(user_id)
                }
            },
            {
                $project: {
                    owner_of_like: 1
                }
            }
        ]);
        if (is_already_liked?.length > 0) {
            throw new MyError(403, "this tweet is already liked by this user.")
        }
        const likeinstance = await this.likes.create({
            owner_of_like: user_id,
            ontweet: tweet_id,

        });

        if (!likeinstance) {
            throw new MyError(500, "Error occured in the database while saving the like document.");
        }
        const twt = likeinstance.ontweet;
        const likeid = likeinstance.id;
        const owner = likeinstance.owner_of_like;

        res.status(200).json(new ApiResponse(200, { twt, likeid, owner }, "tweet liked successfully."));


    });
    like_comment = async_handler(async (req, res) => {
        const comment_id = req.params.id;
        const user_id = req.user?.id;
        if (!user_id) {
            throw new MyError(403, "For liking a video user should be logged in.");
        }
       if (!(mongoose.Types.ObjectId.isValid(comment_id))) {
            throw new MyError(401, "Invalid comment Id given.");
        }
        const commentinstance = await this.comments.findById(comment_id);
        if (!commentinstance) {
            throw new MyError(404, "this comment does not exists in the database.")
        }
        const is_already_liked = await this.likes.aggregate([
            {
                $match: {
                    oncomment: new mongoose.Types.ObjectId(comment_id)
                }
            },
            {
                $match: {
                    owner_of_like: new mongoose.Types.ObjectId(user_id)
                }
            },
            {
                $project: {
                    owner_of_like: 1
                }
            }
        ]);
        if (is_already_liked?.length > 0) {
            throw new MyError(403, "this comment is already liked by this user.")
        }
        const likeinstance = await this.likes.create({
            owner_of_like: user_id,
            oncomment: comment_id,

        });

        if (!likeinstance) {
            throw new MyError(500, "Error occured in the database while saving the like docuemnt.");
        }

        res.status(200).json(new ApiResponse(200, likeinstance, "comment liked successfully."));


    });

    remove_vid_like = async_handler(async (req, res) => {
        // secured route.
        const user_id = req.user?.id;
        const vid_id = req.params?.id;
        if (!vid_id) {
            throw new MyError(401, "Video Id was not given.");
        }
        if (!user_id) {
            throw new MyError(403, "Can't remove like, unauthorized access.");
        }

        const likeid = await this.likes.aggregate([{
            $match: {
                onvideo: new mongoose.Types.ObjectId(vid_id)
            }
        },
        {
            $match: {
                owner_of_like: new mongoose.Types.ObjectId(user_id)
            }
        },
        {
            $project: {
                _id: 1
            }


        }
        ]);

        if (!likeid) {
            throw new MyError(501, "User Like Was not found on the video")
        }

        const like_id = likeid[0]._id

        const result = await this.likes.findByIdAndDelete(like_id);

        if (!result || result?.deletedCount === 0) {
            throw new MyError(500, "error while deleting the like from the databse")
        }

        res.status(500, {}, "Like deleted succesfully.")



    })



};


const like_obj = new like_controller(likes, videos, tweets, comments);

export { like_obj };


