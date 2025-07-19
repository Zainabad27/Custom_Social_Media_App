import { async_handler } from "../utils/async_handler.js";
import { videos } from "../models/video.model.js";
import { MyError } from "../utils/Api_Error.js";
import { cloudinary_upload } from "../utils/file_handling.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const uploadvideo = async_handler(async (req, res) => {
    const { videofile, thumbnail } = req.files;
    const { vidtitle, description } = req.body;
    const { id } = req.user?.id;
    if (!id) {
        throw new MyError(400, "User is not logged in.")
    }

    let arr = [videofile, thumbnail, vidtitle, description];
    for (let element in arr) {
        if (!element || element === "") {
            throw new MyError(401, `${element} is not given.`);
        } _
    }

    const video_localpath = req.files?.videofile[0]?.path;
    if (!video_localpath) {
        throw new MyError(400, "local path of video file cannot be fetched.");
    }
    const videoresponse = await cloudinary_upload(video_localpath);
    if (!videoresponse) {
        throw new MyError(500, "Problem occured while uploading the video on cloudinary.")
    }
    const thumbnail_localpath = req.files?.thumbnail[0]?.path;
    if (!thumbnail_localpath) {
        throw new MyError(400, "local path of thubnail file cannot be fetched.");
    }
    const thumbnailresponse = await cloudinary_upload(thumbnail_localpath);
    if (!thumbnailresponse) {
        throw new MyError(500, "Problem occured while uploading the thumbnail on cloudinary.")
    }

    const vidurl=videoresponse.url;
    const thumbnailurl=thumbnailresponse.url;

    



    // now we ahve all the data, now we'll upload it in the database to video model. with the user ID as refrence who is logged in.






})


export { uploadvideo }