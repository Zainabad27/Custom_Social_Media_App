import mongoose from "mongoose";

const tweetschema = new mongoose.Schema({
    tweet_content:{
        type:String,
      
    
    },
    tweet_owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    tweet_media:[{
        //if user wants to tweet any photo or any video.
        type:String,

    }]
    
}, { timestamps: true });


const tweets = mongoose.model("Tweet", tweetschema);

export { tweets }