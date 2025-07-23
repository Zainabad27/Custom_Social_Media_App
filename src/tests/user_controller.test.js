import request from "supertest";
import { afterAll, beforeAll, it, expect, describe } from "vitest";
import { app } from "../app.js";
import { connect_testing_db } from "../database/testing_db.js";
import mongoose from "mongoose";

// setup to upload a file
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({
    path: "./.env"
});

beforeAll(async () => {
    await connect_testing_db();
    console.log("Testing db connected.");
});



afterAll(async () => {
    await mongoose.connection.close();
});

describe("testing the user controller.", () => {
    const filepath = path.join(__dirname, "zain.jpg");
    it("should register a user", async () => {
        const res =await request(app)
        .post("/api/v1/users/register/through/classes")
        .attach("avatar",filepath)
        .field("username","zain2")
        .field("password","123456")
        .field("email","abcd2@gmail.com")
        .field("fullname","zainabad2")

        expect(res.status).toBe(201);

    
    })

    it("should login successfully.", async () => {
        const res = await request(app).post("/api/v1/users/login/through/classes").send({
            "username": "zain",
            "password": "12345"
        })

        expect(res.status).toBe(201);
    })


})