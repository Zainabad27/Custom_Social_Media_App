import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // fs: filesystem to remove file from your OS after uploading or incase of an error too. so that our memory can be freed.

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const fileupload = async (filepath) => {

    try {
        if (!filepath) {
            return "filePath was not given, file uploading unsuccessfull."

        }
        const cloudinary_response = await cloudinary.uploader.upload(filepath)
        console.log("File uploaded Successfully to Cloudinary at this URL: ", cloudinary_response.url);
        fs.unlinkSync(filepath);//removing file from OS
        return cloudinary_response;


    } catch (error) {
        fs.unlinkSync(filepath);
        console.log("The File did not upload...\nerror :", err);
        return null;



    }

}

export { fileupload }