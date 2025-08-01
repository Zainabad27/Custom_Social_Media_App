import { async_handler } from "../utils/async_handler.js"
import { MyError } from "../utils/Api_Error.js"
import { ApiResponse } from "../utils/ApiResponse.js"


import { users } from "../models/user.model.js";
import mongoose from "mongoose";


class dashboard {
    constructor(usermodel) {
        this.users = usermodel;

    }

    get_stats = async_handler(async (req, res) => {
        // secured route.
        const userid = req.user?.id;
        if (!userid) {
            throw new MyError(403, "Unauthorized Access");
        };
        /*
        user stats includes
        account created at,
        total likes,total comments,total vids,total subscribers, totals channel subscribed;
        */

        const stats = await this.users.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userid)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "total_vids",
                    pipeline: [
                        {
                            $project: {
                                views: 1,
                                vidduration: 1,
                                thumbnail: 1,
                                vidtitle: 1,
                                owner: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "owner_of_like",
                    as: "liked_vids",
                    pipeline: [
                        {
                            $match: {
                                onvideo: { /*$exists: true,*/ $ne: null }
                            }
                        },
                        {
                            $project: {
                                onvideo: 1
                            }
                        }
                    ]

                }

            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "owner_of_like",
                    as: "liked_tweets",
                    pipeline: [
                        {
                            $match: {
                                ontweet: { /*$exists: true,*/ $ne: null }
                            }
                        },
                        {
                            $project: {
                                ontweet: 1
                            }
                        }
                    ]

                }

            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "owner_of_like",
                    as: "liked_comments",
                    pipeline: [
                        {
                            $match: {
                                oncomment: { /*$exists: true,*/ $ne: null }
                            }
                        },
                        {
                            $project: {
                                oncomment: 1
                            }
                        }
                    ]

                }
            },
            {
                $lookup: {
                    from: "subscribtions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "Channels_subscribed",
                    pipeline: [
                        {
                            $project: {
                                channel: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "subscribtions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                    pipeline: [
                        {
                            $project: {
                                subscriber: 1
                            }
                        }
                    ]
                }

            },
            {
                $addFields: {
                    T_comment_liked: {
                        $size: "$liked_comments"
                    },
                    T_vid_liked: {
                        $size: "$liked_vids"
                    },
                    T_twt_liked: {
                        $size: "$liked_tweets"
                    },
                    followers: {
                        $size: "$subscribers"
                    },
                    following: {
                        $size: "$Channels_subscribed"
                    }
                }
            },
            {
                $project: {
                    T_comment_liked: 1,
                    T_vid_liked: 1,
                    T_twt_liked: 1,
                    followers: 1,
                    following: 1,
                    total_vids: 1
                }
            }
        ]); // pipeline ends here.

        if (stats.length === 0) {
            throw new MyError(400, "Some Error occured while fetching the data from DB.")
        }
        // calculate the total views on the videos
        let total_views = 0;
        const vidarry = stats[0].total_vids;
        if (!vidarry) {
            throw new MyError(500, "Error ocuured while fetching the data from DB.")
        }
        for (let i = 0; i < vidarry.length; i++) {
            total_views += parseInt(vidarry[i].views)
        }
        // total_subscribed_channels = (stats[0].Channels_subscribed).length;
        // total_subscribers = (stats[0].subscribers).length;
        // // console.log( total_subscribed_channels=(stats[0].Channels_subscribed).length);
        // stats[0].total_channel_count = total_subscribed_channels;
        // stats[0].total_subscriber_count = total_subscribers;
        stats[0].total_views_on_channel = total_views;

        delete stats[0].total_vids;

        res.status(200).json(new ApiResponse(200, stats[0], "Stats fetched successfully."))



    });


    all_videos = async_handler(async (req, res) => {
        const userid = req.user?.id;

        const allvids = await this.users.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userid)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "total_vids",
                    pipeline: [
                        {
                            $project: {
                                views: 1,
                                vidduration: 1,
                                thumbnail: 1,
                                vidtitle: 1,
                                owner: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    username: 1,
                    avatar: 1,
                    email: 1,
                    total_vids: 1
                }
            }
        ]); // pipeline ends here.

        res.status(200).json(new ApiResponse(200, allvids, "All videos fetched successfully."))
    })


    total_likes_on_user = async_handler(async (req, res) => {
        // secured route 
        // this function fetches the total likes of the user on his uploaded videos,tweets,comments;
        const userid = new mongoose.Types.ObjectId(req.user.id);
        console.log(userid);
        const total_likes = await this.users.aggregate([
            {
                $match: userid
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "likes_on_videos",
                    pipeline: [
                        {
                            $lookup: {
                                from: "likes",
                                localField: "_id",
                                foreignField: "onvideo",
                                as: "Tlikes"
                            }
                        },
                        {
                            $addFields: {
                                no_likes: { $size: "$Tlikes" }
                            }
                        },
                        {
                            $project: {
                                no_likes: 1,
                                _id: 0
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    likes_on_videos: 1,
                    _id: 0
                }
            }
        ]);

        if (total_likes.length === 0) {
            throw new MyError(401, "user does not exists in the DB");
        }
        if (total_likes[0].likes_on_videos.length === 0) {
            throw new MyError(401, "User has not uploaded any video.")
        };


        let likearry = total_likes[0].likes_on_videos;
        let likes_count = 0;
        for (let i = 0; i < likearry.length; i++) {
            likes_count += parseInt(likearry[i]);
        };



        res.status(200).json(new ApiResponse(200, likes_count, "Like count fetched."))


    })


}; // class ends here


const dashboard_obj = new dashboard(users);

export { dashboard_obj };