import mongoose from "mongoose";

const tweetschema = new mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    tweet_owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    
}, { timestamps: true });


const tweets = mongoose.model("Tweet", tweetschema);

export { tweets }