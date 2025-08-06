import request from "supertest";
import { afterAll, beforeAll, it, expect, describe, beforeEach, afterEach } from "vitest";
import { app } from "../app.js";
import { users } from "../models/user.model.js";
import { subscribtions } from "../models/subscribtion.model.js";

//---------------------------------------------------------------------------------------------------------------------//
describe("Testing the subscribtion.", () => {
    //LOCAL HOOKS
    let accesstoken;
    let subscriberid;
    let channelid;
    beforeEach(async () => {
        await users.deleteMany({});
        // user that will subscribe.

        const subscriber = await users.create({
            username: "zainabad",
            password: "zain123",
            email: "zain@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            email: "zain@gmail.com",
            fullname: "zainabad"
        });
        subscriberid = subscriber.id;
        // channel that will be subscribed
        const userinstance = await users.create({
            username: "zain1",
            password: "zain1",
            email: "zain1@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",

            fullname: "zain1"
        });
        channelid = userinstance.id;

        const res = await request(app).post("/api/v1/users/login").send({
            username: "zainabad",
            password: "zain123"
        });
        accesstoken = res.body.data.new_accesstoken;
    });


    it("Should subscribe the user", async () => {
        const res = await request(app).post(`/api/v1/subscribers/c/${channelid}/subscribe/channel`).set("Cookie", [`accesstoken=${accesstoken}`]);



        expect(res.body.message).toBe("Subscribed successfully.");
        expect(res.body.data.subscriber).toBe(subscriberid);
        expect(res.body.data.channel).toBe(channelid);

    });
    it("Should  not unsubscribe the user(already a non subscriber.)", async () => {
        const res = await request(app).post(`/api/v1/subscribers/c/${channelid}/unsubscribe/channel`).set("Cookie", [`accesstoken=${accesstoken}`]);




        expect(res.body.message).toBe("User was not in the subscriber.");
        expect(res.body.success).toBe(false);


    });
    it("Should unsubscribe the user", async () => {
        await subscribtions.create({
            subscriber: subscriberid,
            channel: channelid
        })
        const res = await request(app).post(`/api/v1/subscribers/c/${channelid}/unsubscribe/channel`).set("Cookie", [`accesstoken=${accesstoken}`]);



        expect(res.body.message).toBe("Unsubscribed Successfully.");
        expect(res.body.data.subscriber).toBe(subscriberid);
        expect(res.body.data.channel).toBe(channelid);
        expect(res.body.success).toBe(true);

    });




    afterEach(async () => {
        await users.deleteMany({});
        await subscribtions.deleteMany({});
    })
})