import request from "supertest";
import { afterAll, beforeAll, it, expect, describe, beforeEach } from "vitest";
import { app } from "../app.js";
import { users } from "../models/user.model.js";
import { subscribtions } from "../models/subscribtion.model.js";



describe("Testing the subscribtion controller.", () => {
    //LOCAL HOOKS
    let accesstoken;
    let subscriberid;
    let channelid;

    beforeAll(async () => {


        // user that will subscribe.

        const subscriber = await users.create({
            username: "zain4",
            password: "zain4",
            email: "zain4@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            email: "zain4@gmail.com",
            fullname: "zainabad4"
        });
        // console.log(subscriber)
        subscriberid = subscriber.id;
        // channel that will be subscribed
        const userinstance = await users.create({
            username: "zain5",
            password: "zain5",
            email: "zain5@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",

            fullname: "zain5"
        });
        channelid = userinstance.id;

        const res = await request(app).post("/api/v1/users/login").send({
            username: "zain4",
            password: "zain4"
        });
        //    console.log(res.body)
        accesstoken = res.body.data.new_accesstoken;
        //  console.log(accesstoken)
    });
    beforeEach(async () => {
        await subscribtions.findOneAndDelete({
            channel: channelid,
            subscriber:subscriberid
        })
    })


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
    it("Should unsubscribe the channel", async () => {
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


    it("should not subscribe the channel (invalid mongoose id)", async () => {
        const res = await request(app).post(`/api/v1/subscribers/c/6874e79b48f880c2b9218/subscribe/channel`).set("Cookie", [`accesstoken=${accesstoken}`]);





        expect(res.body.message).toBe("not a valid mongoose ID");



    })

    it("should not subscribe the channel (channel does not exists in db.)", async () => {
        const res = await request(app).post(`/api/v1/subscribers/c/6874e79b48f880c2b9211d84/subscribe/channel`).set("Cookie", [`accesstoken=${accesstoken}`]);

        expect(res.body.message).toBe("The channel you are trying to subscribe, does not exists.");



    });

    it("should not subscribe the channel (already a subscriber)", async () => {
        await subscribtions.create({
            subscriber: subscriberid,
            channel: channelid
        })
        const res = await request(app).post(`/api/v1/subscribers/c/${channelid}/subscribe/channel`).set("Cookie", [`accesstoken=${accesstoken}`]);


        expect(res.body.message).toBe("User is already a subscriber");


    });

    it("should not subscribe the channel (Channel subscribing itself)", async () => {

        const res = await request(app).post(`/api/v1/subscribers/c/${subscriberid}/subscribe/channel`).set("Cookie", [`accesstoken=${accesstoken}`]);

        expect(res.body.message).toBe("A user cannot subscribe itself.");

    });



    it("Should  not unsubscribe the user(invalid channel id was given)", async () => {
        const res = await request(app).post(`/api/v1/subscribers/c/${channelid}1/unsubscribe/channel`).set("Cookie", [`accesstoken=${accesstoken}`]);


        expect(res.body.message).toBe("not a valid mongoose ID");
        expect(res.body.success).toBe(false);


    });




    afterAll(async () => {
        await users.findOneAndDelete({
            username: "zain4"
        });
        await users.findOneAndDelete({
            username: "zain5"
        });
        await subscribtions.findOneAndDelete({
            channel: channelid,
            subscriber:subscriberid
        })
    })
});
