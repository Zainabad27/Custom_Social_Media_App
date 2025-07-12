import { async_handler } from "../utils/async_handler.js";
import { MyError } from "../utils/Api_Error.js";
import { users } from "../models/user.model.js";
import { cloudinary_upload } from "../utils/file_handling.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const user_register = async_handler(async (req, res) => {
    /* 
    step 1: take all the required data from the user, check the data model for assistance.
    step 2: check if all the data is correct(means email is valid,user_name and password are not already in the database)
    step 3: upload the data to the database and photo to the local server by multer then to the cloudinary.
    step 4: send the response that user is registered and if some error occured send the response of that error.
     
    */

    // extracting the user credential from the req.body() 

    const {username,email,password,fullname} = req.body;
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
        throw new MyError(409, "the email given to register the user was already in use.");
    }
    const usernameexists = await users.exists({ username: username });
    if (usernameexists) {
        throw new MyError(409, "the username given to register the user was already in use.");
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
    const coverimageUrl = coverimageresponse.url



    if (!avatarUrl) {
        throw new MyError(400, "Avatar is compulsory but was not given.");
    }
    // uploading the data to the database.

    const user = await users.create({
        username: username.toLowerCase(),
        password,
        email,
        avatar: avatarUrl,
        coverimage: coverimageUrl || "",
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

export { user_register }