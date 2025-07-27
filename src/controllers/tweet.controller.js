// utilities.
import { async_handler } from "../utils/async_handler.js";
import { MyError } from "../utils/Api_Error.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// dependencies.
import { tweets } from "../models/tweet.model.js";
import { users } from "../models/user.model.js";
import { cloudinary_upload } from "../utils/file_handling.js";


class tweet_controller {
    constructor(tweetmodel, usermodel, cloudinary) {
        this.tweets = tweetmodel;
        this.cloudinary_upload = cloudinary;
        this.users = usermodel;

    }


    make_a_tweet = async_handler(async (req, res) => {
        // secured route.
        const { tweet_content } = req.body;
        //checking if user wants to upload any media(photos/videos).
        const have_media = req.files?.tweet_media?.length > 0;


        if (!tweet_content && !have_media) {
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
                const cloudinary_response = await this.cloudinary_upload(local_path_array[i]);
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


        const tweetinstance = await this.tweets.create({
            tweet_content,
            tweet_owner: id,
            tweet_media: url_array
        });
        if (!tweetinstance) {
            throw new MyError(500, "Problem while Saving the tweet in the database.");
        }

        res.status(201).json(new ApiResponse(201, {}, "Tweet was saved in the database."));

    });


    get_all_tweets = async_handler(async (req, res) => {
        // not secured route
        // pagination 
        let { page = 1, limit = 4 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const username = req.params?.username;
        if (!username) {
            throw new MyError(401, "Username was not given in the URL");
        }

        const result = await this.users.aggregate([{
            $match: { username: username }
        },
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "tweet_owner",
                as: "all_tweets",
                pipeline: [{
                    $skip: skip
                }, {
                    $limit: limit
                },
                {
                    $project: {
                        tweet_content: 1,
                        tweet_media: 1,
                        _id: 0
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
                _id: 0
            }
        }
        ]);

        if (!result) {
            throw new MyError(500, "Error occured while fetching the data from database.")
        }
        // const is_follower = false;
        // if (req.user.id) {
        //     //to be written

        // }
        const data_to_send = result[0];

        res.status(201).json(new ApiResponse(201, data_to_send, "Tweets fetched successfully."));

    })

    delete_tweet = async_handler(async (req, res) => {
        // secured route.
        const tweet_id = req.params.id;
        const user_id = req.user.id;
        if (!user_id) {
            throw new MyError(401, "Unauthorized Access.");
        }
        if (!tweet_id) {
            throw new MyError(401, "Tweet id was not given for deletion process.");
        }
        const tweet_instance = await this.tweets.findById(tweet_id);
        if (!tweet_instance) {
            throw new MyError(501, "tweet was not found in the database")
        }

        if (!(tweet_instance.tweet_owner.equals(user_id))) {
            throw new MyError(403, "Only tweet owner can delete the tweet");
        }

        const result = await tweet_instance.deleteOne();

        if (result.deletedCount === 0) {
            throw new MyError(500, "Error occured while deleting the tweet from the database.");
        }

        res.status(200).json(new ApiResponse(200,{},"Tweet deleted successfully."));
    })
    


};



const tweet_obj = new tweet_controller(tweets, users, cloudinary_upload);

export { tweet_obj }



