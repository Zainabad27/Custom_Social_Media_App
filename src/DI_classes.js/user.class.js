
import { async_handler } from "../utils/async_handler.js";
import { users } from "../models/user.model.js";
import { MyError } from "../utils/Api_Error.js";
import { ApiResponse } from "../utils/ApiResponse.js";




class user_controller {
    constructor(user_model) {

        this.users = user_model;


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


const obj1 = new user_controller(users);


export { obj1 }
export { user_controller }
