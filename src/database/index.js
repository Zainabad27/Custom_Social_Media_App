import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

async function connect_to_db(){
    try {
        const conn=await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
        console.log(`(main DB) Connection to database successfull!! ,Database HOST: ${conn.connection.host}.`)
        
    } catch (error) {
        console.log("Connection to Database Failed... ",error);
        process.exit(1)
        
    }
}

export {connect_to_db};