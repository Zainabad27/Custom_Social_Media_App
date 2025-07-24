
import { async_handler } from "../utils/async_handler.js";
import { users } from "../models/user.model.js";
import { MyError } from "../utils/Api_Error.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { cloudinary_upload } from "../utils/file_handling.js";




class user_controller {
    constructor(user_model, cloudinary) {

        this.users = user_model;
        this.cloudinary_upload = cloudinary;


        // this.user_login = async_handler(this.user_login.bind(this));

    }


    generate_refresh_and_access_token = async (user_id) => {
        try {
            const userinstance = await this.users.findById(user_id);
            const new_accesstoken = userinstance.GenerateAccessToken();
            const new_refreshtoken = userinstance.GenerateRefreshToken();

            return { new_accesstoken, new_refreshtoken };
        } catch (error) {
            throw new MyError(500, error);

        }

    }

    user_register = async_handler(async (req, res) => {

        const { username, email, password, fullname } = req.body;
        const dataarry = [username, email, password, fullname];
        const dataarry2 = ["username", "email", "password", "fullname"];
        //checking if any field is left empty by the user or if the email format is incorrect.
        for (let i = 0; i < dataarry.length; i++) {
            if (dataarry[i] === "" || !dataarry[i]) {
                throw new MyError(401, `${dataarry2[i]} is Empty.`);

            }
            if (dataarry[i] === email) {
                if (!(email.includes("@") && email[0] != "@")) {
                    throw new MyError(401, "Incorrect Email was given.");
                }
            }
        }
        //checking in the database if the credential are already in use or not 
        const emailexists = await this.users.exists({ email: email });
        if (emailexists) {
            throw new MyError(409, "the email given to register the user is already in use.");
        }
        const usernameexists = await this.users.exists({ username: username });
        if (usernameexists) {
            throw new MyError(409, "the username given to register the user is already in use.");
        }

        const passwordexists = await this.users.exists({ password: password });
        if (passwordexists) {
            throw new MyError(409, "the password is already in use.");
        }

        //uploading the picture data on the local server and extracting the localpath using multer file uploader.
        // const avatarlocalpath = req.files?.avatar[0].path;
        let avatarlocalpath = null;
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarlocalpath = req.files.avatar[0].path;
        }
        // console.log("See bro what it has: ",req.files)
        // console.log("And what it doesn't ahve: ",req.file)
        const coverimagelocalpath = req.files?.coverimage?.[0].path;
        if (!avatarlocalpath) {
            throw new MyError(400, "Avatar is compulsory but was not given.");
        }

        // uploading to cloudinary.
        const avatarresponse = await this.cloudinary_upload(avatarlocalpath);

        const avatarUrl = avatarresponse.url;
        const coverimageresponse = await this.cloudinary_upload(coverimagelocalpath);
        let coverimageUrl = "";
        if (coverimageresponse) {
            coverimageUrl = coverimageresponse.url
        }




        if (!avatarUrl) {
            throw new MyError(400, "Avatar is compulsory but was not given.");
        }
        // uploading the data to the database.

        const user = await this.users.create({
            username: username.toLowerCase(),
            password,
            email,
            avatar: avatarUrl,
            coverimage: coverimageUrl,
            fullname
        })
        const user_created = await this.users.findById(user._id).select(
            "-password -refreshtoken"
        )

        if (!user_created) {
            throw new MyError(500, "having problems while saving the data into the database.");
        }


        return res.status(201).json(new ApiResponse(
            201, user_created, "User regitered successfully"
        ))




    })




    user_login = async_handler(async (req, res) => {

        const { username, email, password } = req.body;

        if (!(username || email)) {
            throw new MyError(401, "Atlest one of username or email is required to login.");
        }
        if (!password) {
            throw new MyError(401, "Password was not given.");
        }

        const userinstance = await this.users.findOne({
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

        const { new_accesstoken, new_refreshtoken } = await this.generate_refresh_and_access_token(userinstance._id);

        // now we have generated both refresh and access token now we have to save refresh token into this userinstance

        const updateduserinstance = await this.users.findByIdAndUpdate(userinstance._id, {
            refreshtoken: new_refreshtoken
        }, {
            new: true,
            runValidators: false
        }).select("-password -refreshtoken");


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
};


const obj1 = new user_controller(users, cloudinary_upload);


export { obj1 }
export { user_controller }
