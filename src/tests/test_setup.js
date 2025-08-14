import dotenv from 'dotenv';
import { connect_testing_db } from "../database/testing_db.js";
import mongoose from "mongoose";
import { beforeAll, afterAll } from 'vitest';
dotenv.config({
    path: "./.env"
});
//---------------GLOBAL HOOKS----------------------//

beforeAll(async () => {
    // await connect_testing_db();
    // console.log("Testing db connected.");
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
        await connect_testing_db();
    } else {
        console.log("DB already connected, skipping new connection");
    }
});

    

afterAll(async () => {
    await mongoose.connection.close();
});
