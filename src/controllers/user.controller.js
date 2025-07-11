import {async_handler} from "../utils/async_handler.js";

const user_register=async_handler( (req,res)=>{
    res.status(200).json({
        message:"Api is working."
    })

})

export {user_register}