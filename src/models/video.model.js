import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new mongoose.Schema({
    videofile:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    vidtitle:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    vidduration:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    views:{
        type:Number,
        required:true,
        default:0
    },
    isdeleted:{
        type:Boolean,
        required:true,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
}, { timestamps: true });
videoSchema.plugin(mongooseAggregatePaginate);

const videos = mongoose.model("video", videoSchema);

export { videos }