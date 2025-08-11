import mongoose from "mongoose";
import { TESTING_DB_NAME } from "../constants.js";


const connect_testing_db = async () => {

    try {
        const conn = await mongoose.connect(`${process.env.DATABASE_URL}/${TESTING_DB_NAME}`)
        console.log("Connected to testing db.", conn.connection.host)
    } catch (error) {
        console.log("testing database connection failed.", error);
        process.exit(1);
    }

}


export { connect_testing_db }