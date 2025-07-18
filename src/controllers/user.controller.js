import { async_handler } from "../utils/async_handler.js";
import { MyError } from "../utils/Api_Error.js";
import { users } from "../models/user.model.js";
import { cloudinary_upload } from "../utils/file_handling.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import isEmail from 'validator/lib/isEmail.js';
import mongoose from "mongoose";



const generate_refresh_and_access_token = async (user_id) => {
    try {
        const userinstance = await users.findById(user_id);
        const new_accesstoken = userinstance.GenerateAccessToken();
        const new_refreshtoken = userinstance.GenerateRefreshToken();

        return { new_accesstoken, new_refreshtoken };
    } catch (error) {
        throw new MyError(500, error);

    }

}
const user_register = async_handler(async (req, res) => {
    /* 
    step 1: take all the required data from the user, check the data model for assistance.
    step 2: check if all the data is correct(means email is valid,user_name and password are not already in the database)
    step 3: upload the data to the database and photo to the local server by multer then to the cloudinary.
    step 4: send the response that user is registered and if some error occured send the response of that error.
     
    */

    // extracting the user credential from the req.body

    const { username, email, password, fullname } = req.body;
    const dataarry = [username, email, password, fullname];
    //checking if any field is left empty by the user or if the email format is incorrect.
    for (let i = 0; i < dataarry.length; i++) {
        if (dataarry[i] === "") {
            throw new MyError(401, `${dataarry[i]} is Empty.`);

        }
        if (dataarry[i] === email) {
            if (!(email.includes("@") && email[0] != "@")) {
                throw new MyError(401, "Incorrect Email was given.");
            }
        }
    }
    //checking in the database if the credential are already in use or not 
    const emailexists = await users.exists({ email: email });
    if (emailexists) {
        throw new MyError(409, "the email given to register the user is already in use.");
    }
    const usernameexists = await users.exists({ username: username });
    if (usernameexists) {
        throw new MyError(409, "the username given to register the user is already in use.");
    }

    const passwordexists = await users.exists({ password: password });
    if (passwordexists) {
        throw new MyError(409, "the password is already in use.");
    }

    //uploading the picture data on the local server and extracting the localpath using multer file uploader.
    // const avatarlocalpath = req.files?.avatar[0].path;
    let avatarlocalpath = null;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarlocalpath = req.files.avatar[0].path;
    }
    const coverimagelocalpath = req.files?.coverimage?.[0].path;
    if (!avatarlocalpath) {
        throw new MyError(400, "Avatar is compulsory but was not given.");
    }

    // uploading to cloudinary.
    const avatarresponse = await cloudinary_upload(avatarlocalpath);

    const avatarUrl = avatarresponse.url;
    const coverimageresponse = await cloudinary_upload(coverimagelocalpath);
    let coverimageUrl = "";
    if (coverimageresponse) {
        coverimageUrl = coverimageresponse.url
    }




    if (!avatarUrl) {
        throw new MyError(400, "Avatar is compulsory but was not given.");
    }
    // uploading the data to the database.

    const user = await users.create({
        username: username.toLowerCase(),
        password,
        email,
        avatar: avatarUrl,
        coverimage: coverimageUrl,
        fullname
    })
    const user_created = await users.findById(user._id).select(
        "-password -refreshtoken"
    )

    if (!user_created) {
        throw new MyError(500, "having problems while saving the data into the database.");
    }


    return res.status(201).json(new ApiResponse(
        201, user_created, "User regitered successfully"
    ))




})

const user_login = async_handler(async (req, res) => {
    /*
    first we have to check in the cookies if the user is already logged in or not by checking refresh token
    if yes, we still have to genrate a refresh token and give it to the user so that his timing in refresh token is reset.
    if not, then :
    take the credentials from the user like username and password
    decode the password in the database and check it by the password given by user while loging in (use model method ispasswordsame).
    Generate an access token give it to user in cookies + generate a refresh token and give it to cookies and also save it in the database.
    if user is logged in we have let user in the account.
    */
    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new MyError(401, "Atlest one of username or email is required to login.");
    }
    if (!password) {
        throw new MyError(401, "Password was not given.");
    }

    const userinstance = await users.findOne({
        $or: [{ email: email }, { username: username }]
    });
    //console.log("user:instance: ",userinstance);

    if (!userinstance) {
        throw new MyError(401, "User does not exists");
    }
    const passcorrect = await userinstance.IsPasswordSame(password);
    if (!passcorrect) {
        throw new MyError(401, "Incorrect password.");
    }

    const { new_accesstoken, new_refreshtoken } = await generate_refresh_and_access_token(userinstance._id);

    // now we have generated both refresh and access token now we have to save refresh token into this userinstance

    const updateduserinstance = await users.findByIdAndUpdate(userinstance._id, {
        refreshtoken: new_refreshtoken
    }, {
        new: true,
        runValidators: false
    }).select("-password -refreshtoken");
    // const userdata_to_send_response={
    //     username:updateduserinstance.username,
    //     id:updateduserinstance._id,
    //     avatar:updateduserinstance.avatar,
    //     coverimage:updateduserinstance.coverimage,
    //     email:updateduserinstance.email,
    //     fullname:updateduserinstance.fullname,
    //     watchhistory:updateduserinstance.watchhistory,

    // }

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(201).cookie("accesstoken", new_accesstoken, options).cookie("refreshtoken", new_refreshtoken, options).json(
        new ApiResponse(201,
            {
                user: updateduserinstance, new_accesstoken, new_refreshtoken
            },
            "user logged in succefully.")
    )

})
const user_logout = async_handler(async (req, res) => {
    const { id } = req.user;

    await users.findByIdAndUpdate(
        id,
        {
            $set: { refreshtoken: null }
        }
        , {
            new: true,
            runValidators: false
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }


    res.status(200).clearCookie("accesstoken", options).clearCookie("refreshtoken", options).json(
        new ApiResponse(200, {}, "User logged out.")
    )





})
const refresh_accesstoken = async_handler(async (req, res) => {
    const incoming_refreshtoken = req.cookie.refreshtoken || req.body.refreshtoken;

    if (!incoming_refreshtoken) {
        throw new MyError(401, "Unauthorized request");
    }
    try {
        const decodedtoken = jwt.verify(incoming_refreshtoken, process.env.REFRESH_TOKEN_SECRET);

        const userinstance = await users.findById(decodedtoken.id);
        if (!userinstance) {
            throw new MyError(401, "refresh token is not if this user. Unauthorized Access.");
        }
        const databasetoken = userinstance.refreshtoken
        if (incoming_refreshtoken !== databasetoken) {
            throw new MyError(401, "Refresh Token Did Not Match,Unauthorized Access")
        }

        const { new_accesstoken, new_refreshtoken } = await generate_refresh_and_access_token(userinstance.id);
        const userdata_for_response = await users.findByIdAndUpdate(userinstance.id, {
            $set: { refreshtoken: new_refreshtoken }
        }, {
            new: true,
            runValidators: false
        }).select("-password -refreshtoken");


        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(201).cookie("accesstoken", new_accesstoken, options).cookie("refreshtoken", new_refreshtoken, options).json(new ApiResponse(201, {
            new_accesstoken, userdata_for_response, refreshtoken: new_refreshtoken
        }, "Access token refreshed Successfully."));

    } catch (error) {
        throw new MyError(401, error?.message);

    }
})

const update_password = async_handler(async (req, res) => {
    const { oldpassword, newpassword, confirmpassword } = req.body;
    if (newpassword !== confirmpassword) {
        throw new MyError(401, "new password and confirm password does not match.");
    }
    const { id } = req.user;
    const userinstance = await users.findById(id);
    const correctpassword = await userinstance.IsPasswordSame(oldpassword)
    if (!correctpassword) {
        throw new MyError(400, "Incorrect Old password.");
    }
    userinstance.password = newpassword;
    await userinstance.save({
        validateBeforeSave: false
    });

    res.status(201).json(new ApiResponse(201, {}, "Password Updated Succesfully."));



})

const updateuserdetails = async_handler(async (req, res) => {

    const { email, username, fullname } = req.body;

    if (!(email || username || fullname || req.files['avatar'] || req.files['coverimage'])) {
        throw new MyError(400, "No field was provided for Updation process.")
    }
    // extracting the userinstance from database.
    const { id } = req.user;
    const userinstance = await users.findById(id);
    // updating email.
    if (email) {
        //checking for valid email.
        const validemail = isEmail(email);
        if (!validemail) {
            throw new MyError(400, "Invalid email was given for update.");
        }
        //checking if the email exists for a different user or not?
        const emailpresent = await users.findOne({ email: email });
        if (emailpresent) {
            throw new MyError(400, "Can't update email, the email given is already in use by another user.");
        }
        userinstance.email = email;
        await userinstance.save({
            validateBeforeSave: false
        })

    }
    // updating username
    if (username) {
        const usernamepresent = await users.findOne({
            username: username
        })
        if (usernamepresent) {
            throw new MyError(400, "Username already in use by another user,can't update.")
        }
        userinstance.username = username;
        await userinstance.save({
            validateBeforeSave: false
        })
    }
    // updating fullname 
    if (fullname) {

        userinstance.fullname = fullname;
        await userinstance.save({
            validateBeforeSave: false
        })
    }
    let avatarlocalpath = null;

    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarlocalpath = req.files.avatar[0].path;
    }
    if (avatarlocalpath) {

        const avatarresponse = await cloudinary_upload(avatarlocalpath);
        const avatarurl = avatarresponse.url;
        if (!avatarurl) {
            throw new MyError(500, "Problem while Uploading the file on cloudinary.")
        }

        userinstance.avatar = avatarurl;
        await userinstance.save({
            validateBeforeSave: false
        })

    }
    let coverimagelocalpath = null;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverimagelocalpath = req.files.coverimage[0].path;
    }
    if (coverimagelocalpath) {
        const coverimageresponse = await cloudinary_upload(coverimagelocalpath);
        const coverimageUrl = coverimageresponse.url;
        if (!coverimageUrl) {
            throw new MyError(500, "problem while uploading the coverimage on cloudinary.")
        }

        userinstance.coverimage = coverimageUrl;
        await userinstance.save({
            validateBeforeSave: false
        });

    }


    res.status(201).json(
        new ApiResponse(201, {}, "User details updated succesfully.")
    )

})


const getuserchannelprofile = async_handler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        throw new MyError(401, "Username was not given.");
    }
    const channel = await users.aggregate([{
        $match: { username: username?.toLowerCase() }

    },
    {
        $lookup: {
            from: "subscribtions",
            localField: "id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from: "subscribtions",
            localField: "id",
            foreignField: "subscriber",
            as: "channelsubscribed"

        }

    },
    {
        $addFields: {
            subscriberscount: {
                $size: "$subscribers"
            },
            channelssubscribedcount: {
                $size: "$channelsubscribed"
            },
            follows_or_not: {
                $cond: {
                    if: { $in: [req.user?.id, "$subscribers.subscriber"] },
                    then:true,
                    else:false
                }
            }

        }


    },
    {
        $project: {
            fullname: 1,
            username: 1,
            subscriberscount: 1,
            channelssubscribedcount: 1,
            follow_or_not: 1,
            avatar: 1,
            coverimage: 1,
            follows_or_not:1


        }
    }
    ]);
    if (!channel.length) {
        throw new MyError(404, "channel does not exists.")
    }
    res.status(201).json(new ApiResponse(201, channel[0], "Profile Data fetched successfully."))

});


const getuserwatchhistory = async_handler(async (req, res) => {
    const id = new mongoose.Types.ObjectId(req.user?.id)
    const watched = await users.aggregate([
        {
            $match: {
                _id: id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchhistory",
                foreignField: "_id",
                as: "vidswatched",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullname: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])


    res.status(201).json(new ApiResponse(201, watched[0].watchhistory, `Watch history fetched of ${req.user.username}`))



})
export {
    user_register,
    user_login,
    user_logout,
    refresh_accesstoken,
    update_password,
    updateuserdetails,
    getuserchannelprofile,
    getuserwatchhistory
}