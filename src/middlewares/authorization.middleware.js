import jwt from "jsonwebtoken";
import { async_handler } from "../utils/async_handler.js";
import { MyError } from "../utils/Api_Error.js";
import { users } from "../models/user.model.js";

const jwt_verify = async_handler(async (req, _, next) => {
    try {
        const accesstoken = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "");
        // const refreshtoken = req.cookies.refreshtoken
        if (!accesstoken) {
            throw new MyError(401, "Unauthorized access. No Token.")

        }


        const userpayload = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET);
       

        const userinstance = await users.findById(userpayload.id).select("-password -refreshtoken");

        if (!userinstance) {
            throw new MyError(401, "Unauthorized Access.");
        }

        req.user = userinstance;




        next();
    } catch (error) {
        throw new MyError(401, error.message);

    }
})

export { jwt_verify }