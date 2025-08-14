import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp");

    },
    filename: (req, file, cb) => {
        const name = file.originalname;
        cb(null, name);

    }
})
  
const upload = multer({ storage })
export { upload }