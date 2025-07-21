import { async_handler } from "../utils/async_handler.js";
import { MyError } from "../utils/Api_Error.js";
import { tweets } from "../models/tweet.model.js";
import { users } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { cloudinary_upload } from "../utils/file_handling.js";
import mongoose from "mongoose";

const make_a_tweet = async_handler(async (req, res) => {
    // secured route.
    const { tweet_content } = req.body;
    //checking if user wants to upload any media(photos/videos).
    const have_media = req.files?.tweet_media?.length > 0;


    if (!tweet_content && !has_media) {
        throw new MyError(400, "tweet content is necessary but was not given.");
    }
    let local_path_array = [];
    let url_array = [];
    if (have_media) {
        const num_photos = req.files.tweet_media?.length;
        for (let i = 0; i < num_photos; i++) {
            local_path_array.push(req.files.tweet_media[i]?.path);
        }

        for (let i = 0; i < local_path_array.length; i++) {
            const cloudinary_response = await cloudinary_upload(local_path_array[i]);
            if (!cloudinary_response) {
                throw new MyError(500, "Problem occured while uploading the media in the database")
            }
            url_array.push(cloudinary_response.url);

        }



    }

    const id = req.user.id;

    if (!id) {
        throw new MyError(401, "Owner ID cannot be fetched.");
    }


    const tweetinstance = await tweets.create({
        tweet_content,
        tweet_owner: id,
        tweet_media: url_array
    });
    if (!tweetinstance) {
        throw new MyError(500, "Problem while Saving the tweet in the database.");
    }

    res.status(201).json(new ApiResponse(201, {}, "Tweet was saved in the database."));

});



const get_all_tweets = async_handler(async (req, res) => {
    // not secured route
    const username = req.params?.username;
    if (!username) {
        throw new MyError(401, "Username was not given in the URL");
    }

    const result = await users.aggregate([{
        $match: { username: username }
    },
    {
        $lookup: {
            from: "tweets",
            localField: "_id",
            foreignField: "tweet_owner",
            as: "all_tweets",
            pipeline: [
                {
                    $project: {
                        tweet_content: 1,
                        tweet_media: 1,
                        _id:0
                    }
                }
            ]
        },

    },
    {
        $project: {
            username: 1,
            all_tweets: 1,
            avatar: 1,
            _id:0
        }
    }
    ]);

    if (!result) {
        throw new MyError(500, "Error occured while fetching the data from database.")
    }
    const is_follower=false;
    if(req.user.id){
        

    }
    const data_to_send = result[0];

    res.status(201).json(new ApiResponse(201, data_to_send, "Tweets fetched successfully."))

})



export { make_a_tweet, get_all_tweets };