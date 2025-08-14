import { v2 as cloudinary } from "cloudinary";
import { MyError } from "./Api_Error.js";
import fs from "fs"; // fs: filesystem to remove file from your OS after uploading or incase of an error too. so that our memory can be freed.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cloudinary_upload = async (filepath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!filepath) {
            return null;

        }
        const cloudinary_response = await cloudinary.uploader.upload(filepath)
        //console.log("File uploaded Successfully to Cloudinary at this URL: ", cloudinary_response.url);

        await sleep(50)
        fs.unlinkSync(filepath);//removing file from OS
        return cloudinary_response;


    } catch (error) {
        await sleep(50)
        fs.unlinkSync(filepath);
        // console.log("The File did not upload...\nerror :", error);

        throw new MyError(500, error?.message);

    }

}    

  

export { cloudinary_upload }