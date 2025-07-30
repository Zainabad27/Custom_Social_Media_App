import { async_handler } from "../utils/async_handler.js"
import { MyError } from "../utils/Api_Error.js"
import { ApiResponse } from "../utils/ApiResponse.js"


import { users } from "../models/user.model.js";
import { videos } from "../models/video.model.js";
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

            }
        ]); // pipeline ends here.

        if (stats.length === 0) {
            throw new MyError(400, "Some Error occured while fetching the data from DB.")
        }
        // calculate the total views on the videos
        let total_views = 0;
        let total_subscribers;
        let total_subscribed_channels;
        const vidarry = stats[0].total_vids;
        for(let i=0;i<vidarry.length;i++){
            total_views+=parseInt(vidarry[i].views)
        }
        total_subscribed_channels=(stats[0].Channels_subscribed).length;
        total_subscribers=(stats[0].subscribers).length;
        // console.log( total_subscribed_channels=(stats[0].Channels_subscribed).length);

        res.status(200).json(new ApiResponse(200, stats[0], "Stats fetched successfully."))



    })


};


const dashboard_obj = new dashboard(users);

export { dashboard_obj };