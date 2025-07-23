import request from "supertest";
import { afterAll, beforeAll, it, expect, describe } from "vitest";
import { user_controller } from "../DI_classes.js/user.class.js";
import { app } from "../app.js";
import { connect_testing_db } from "../database/testing_db.js";


import dotenv from 'dotenv';
dotenv.config({
    path: "./.env"
});

beforeAll(async () => {
    await connect_testing_db();
    console.log("Testing db connected.");
});

import mongoose from "mongoose";

afterAll(async () => {
    await mongoose.connection.close();
});

describe("testing the user controller.", () => {
    //   const test_obj=new user_controller(fakemodel);

    it("should login successfully.", async () => {
        const res = await request(app).post("/api/v1/users/login/through/classes").send({
            "username": "abcd",
            "password": "12345"
        })

        expect(res.statuscode).toBe(201);
    })


})