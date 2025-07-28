// utilities.
import { async_handler } from "../utils/async_handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { MyError } from "../utils/Api_Error.js";
//dependencies.
import { videos } from "../models/video.model.js";
import { cloudinary_upload } from "../utils/file_handling.js";


class video_controller {
    constructor(videomodel, cloudinary) {
        this.videos = videomodel;
        this.cloudinary_upload = cloudinary;

    }

    upload_video = async_handler(async (req, res) => {
        const { videofile, thumbnail } = req.files;
        const { vidtitle, description } = req.body;
        const id = req.user?._id;
        if (!id) {
            throw new MyError(400, "User is not logged in.")
        }

        let arr = [thumbnail, videofile, vidtitle, description];
        let a = ["thumbnail", "video", "title", "description"];
        for (let element in arr) {
            // console.log(element);
            if (!arr[element] || arr[element] === "") {
                throw new MyError(401, `${a[element]} is not given.`);
            }
        }
        const vid_title_present = await this.videos.findOne({ vidtitle: vidtitle });
        if (vid_title_present) {
            throw new MyError(401, "This video title is already taken.");
        };

        const video_localpath = req.files?.videofile[0]?.path;
        if (!video_localpath) {
            throw new MyError(400, "local path of video file cannot be fetched.");
        }
        const videoresponse = await this.cloudinary_upload(video_localpath);
        if (!videoresponse) {
            throw new MyError(500, "Problem occured while uploading the video on cloudinary.")
        }
        const thumbnail_localpath = req.files?.thumbnail[0]?.path;
        if (!thumbnail_localpath) {
            throw new MyError(400, "local path of thubnail file cannot be fetched.");
        }
        const thumbnailresponse = await this.cloudinary_upload(thumbnail_localpath);
        if (!thumbnailresponse) {
            throw new MyError(500, "Problem occured while uploading the thumbnail on cloudinary.")
        }

        const vidurl = videoresponse.url;
        const thumbnailurl = thumbnailresponse.url;
        const vidduration = videoresponse.height

        if (!vidduration) {
            throw new MyError(500, "duration of video cannot be occupied.")
        }



        const vidinstance = await this.videos.create({
            videofile: vidurl,
            thumbnail: thumbnailurl,
            description,
            vidtitle,
            views: 0,
            isdeleted: false,
            vidduration,
            owner: id

        });
        if (!vidinstance) {
            throw new MyError(500, "problem occured while saving the data into the database.");
        }


        res.status(201).json(new ApiResponse(201, vidinstance, "Video uploaded successfully."));

    });


    // getvideo;............ to be written.


};

const video_obj = new video_controller(videos, cloudinary_upload);

export { video_obj }

