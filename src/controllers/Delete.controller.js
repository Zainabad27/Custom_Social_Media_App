import { videos } from "../models/video.model.js";
import { likes } from "../models/like.model.js";
import { comments } from "../models/comment.model.js";
import { tweets } from "../models/tweet.model.js";
import { subscribtions } from "../models/subscribtion.model.js";
// utilities
import { async_handler } from "../utils/async_handler.js";

class delete_user {
    constructor(vidmodel, tweetmodel, commentmodel, likemodel, subsmodel) {
        this.videos = vidmodel;
        this.tweets = tweetmodel;
        this.comments = commentmodel;
        this.likes = likemodel;
        this.subscribtions = subsmodel;

    }

    change_status = async_handler(async () => {
        // in this function we simply change the status for every document that is destined to be deleted in funture(soft deleting). we do not instantly deleting the documents instead we will delete it after some time(20/30 days) until then there ids will be store in a seprate model/collection we won't do it now because wew haven't write tests yet our application can crash if we do this feature inclusion without writting tests so we'll write tests first for our application then we will add this functionality.
    })


    delete_user = async_handler(async (userid) => {
        //     const a = await this.videos.deleteMany({ owner: userid })
        //     const b = await this.tweets.deleteMany({ tweet_owner: userid })
        //     const c = await this.likes.deleteMany({ owner_of_like: userid })
        //     const d = await this.comments.deleteMany({ owner: userid })
        //     const e = await this.subscribtions.deleteMany({ channel: userid })
        //     const f = await this.subscribtions.deleteMany({ subscriber: userid })

        //     return [a, b, c, d, e, f];
    })



};



const delete_obj = new delete_user(videos, tweets, comments, likes, subscribtions);

export { delete_obj };
