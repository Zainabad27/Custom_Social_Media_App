// import request from "supertest";
// import { afterAll, beforeAll, it, expect, describe, beforeEach, afterEach } from "vitest";
// import { app } from "../app.js";
// import { users } from "../models/user.model.js";
// import { tweets } from "../models/tweet.model.js";

// describe("Testing the tweet controller", () => {
//     let accesstoken2;
//     let userid;
//     beforeEach(async () => {
//         await tweets.deleteMany({});
//     })
//     beforeAll(async () => {
//         await users.deleteMany({});

//         // user that will tweet

//         const user = await users.create({
//             username: "zainabadtweet",
//             password: "zaintweet",
//             email: "zaintweet@gmail.com",
//             avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
//             email: "zaintweet@gmail.com",
//             fullname: "zainabadtweet"
//         });
//         userid = user.id;
//         const res = await request(app).post("/api/v1/users/login").send({
//             username: "zainabadtweet",
//             password: "zaintweet"
//         });

//         accesstoken2 = res.body.data.new_accesstoken;
//     });


//     it("should successfully make a tweet.", async () => {
//         const res = await request(app).post("/api/v1/tweets/maketweets").set("Cookie", [`accesstoken=${accesstoken2}`]).send({
//             tweet_content: "Testing tweet functionality."
//         });


//         expect(res.body.message).toBe("Tweet was saved in the database.")
//     })


//     afterAll(async () => {
//         await users.deleteMany({});
//         await tweets.deleteMany({});
//     })
// })