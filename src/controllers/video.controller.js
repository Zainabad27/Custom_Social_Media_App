// utilities.
import { async_handler } from "../utils/async_handler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { MyError } from "../utils/Api_Error.js";
import mongoose from "mongoose";
//dependencies.
import { videos } from "../models/video.model.js";
import { users } from "../models/user.model.js";
import { cloudinary_upload } from "../utils/file_handling.js";



class video_controller {
    constructor(videomodel, usermodel, cloudinary) {
        this.videos = videomodel;
        this.users = usermodel;
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


    click_on_video = async_handler(async (req, res) => {
        const vid_id = req.params.id;
        const userid = req.user?.id;
        // send back the video data and also increase the view count.


        // if user clicks on his own video no increment in the views only clicking on someone else video will increase the video views.

        const vidinstance = await this.videos.findOneAndUpdate(
            {
                _id: vid_id,
            },
            [
                {
                    $set: {
                        views: {
                            $cond: {
                                if: { $ne: ["$owner", new mongoose.Types.ObjectId(userid)] },
                                then: { $add: ["$views", 1] },
                                else: "$views"
                            }
                        }
                    }
                }
            ]);
        if (!vidinstance) {
            throw new MyError(500, "Video does not exists in the Database.");
        };

        const data_to_send = await this.videos.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(vid_id)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "Uploader",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                avatar: 1,
                                email: 1,
                                _id: 0
                            }
                        }
                    ]
                }
            }
        ]);

        if (data_to_send.length === 0) {
            throw new MyError(500, "Error while fetching the Data");
        }

        // I have to add this video id into the user watch history too.
        const userinstance = await this.users.findOneAndUpdate(
            {
                _id: userid
            },
            {
                $push: {
                    watchhistory: vid_id
                }
            },
            {
                new: true
            }
        )





        res.status(200).json(new ApiResponse(200, data_to_send[0], "Video fetched successfully."));




    });

    update_video = async_handler(async (req, res) => {
        // secured route
        // update video details like description, title etc.

        /*
       1: I have to check if the user is the owner of the video, cuz only owner can edit vid details
       2: I have to check which details are updated so that only those detail i would update in the database.

       */
        const userid = req.user?.id;
        const vidid = req.params?.id;
        const description = req.body?.description;
        const vidtitle = req.body?.vidtitle;
        // if video title or description is given an empty string no updation in the database occurrs.
        let arry = [description, vidtitle];
        let name = ["description", "video title"]
        for (let i = 0; i < arry.length; i++) {
            if (arry[i] === "") {

                throw new MyError(400, `${name[i]} is Empty. It is Required!`)

            }
        }
        const thumbnail = req.file

        let thumbnail_url = undefined;
        if (thumbnail) {
            const local_path = thumbnail.path;
            const cloudinary_response = await this.cloudinary_upload(local_path);

            if (!cloudinary_response) {
                throw new MyError(500, "Some error occured in cloudinary while updating the thumbnail");
            }
            console.log("see this", cloudinary_response)

            thumbnail_url = cloudinary_response.url;
        }


        // console.log(thumbnail_url)
        const vidinstance = await this.videos.findOneAndUpdate({
            _id: vidid,
            owner: userid
        },
            [
                {
                    $set: {
                        description: {
                            $cond: {
                                if: { $ne: [description, undefined || null] },
                                then: description,
                                else: "$description"
                            }
                        }
                    }
                },
                {
                    $set: {
                        vidtitle: {
                            $cond: {
                                if: { $ne: [vidtitle, undefined || null] },
                                then: vidtitle,
                                else: "$vidtitle"
                            }
                        }
                    }
                },
                {
                    $set: {
                        thumbnail: {
                            $cond: {
                                if: { $ne: [thumbnail_url, undefined || null] },
                                then: thumbnail_url,
                                else: "$thumbnail"
                            }
                        }
                    }
                }
            ],
            { returnDocument: "after" });

        if (!vidinstance) {
            throw new MyError(400, "Only owner can update the video details.");
        }

        res.status(200).json(new ApiResponse(200,
            {
                vidinstance
            },
            "details updated successfully."
        ));


    })


    delete_video = async_handler(async (req, res) => {
        const vidid = req.params?.id;
        if (!vidid) {
            throw new MyError(400, "Video id was not given");
        }

        const userid = req.user.id;

        const vidinstance = await this.videos.findOneAndDelete({
            _id: vidid,
            owner: userid
        });

        if (!vidinstance) {
            throw new MyError(400, "Video was not found in the database.")
        };

        vidinstance.isdeleted=true

        res.status(200).json(new ApiResponse(200, vidinstance, "Video deleted successfully."));

    })


};

const video_obj = new video_controller(videos, users, cloudinary_upload);

export { video_obj }

