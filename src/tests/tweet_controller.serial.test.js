import request from "supertest";
import { afterAll, beforeAll, it, expect, describe, beforeEach } from "vitest";
import { app } from "../app.js";
import { users } from "../models/user.model.js";
import { tweets } from "../models/tweet.model.js";

//---------------------------------------------------------sending files----------------------------------------------
import path from "path";
import { fileURLToPath } from "url";
import { subscribtions } from "../models/subscribtion.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filepath = path.join(__dirname, "zain.jpg");

//--------------------------------------------------------------------------------------------------------------------





describe("Testing the tweet controller", () => {

    let accesstoken2;
    let userid;
    beforeEach(async () => {
        await tweets.findOneAndDelete({
            tweet_content: "Testing tweet functionality in tweet testing file."
        })
    })
    beforeAll(async () => {
        await users.findOneAndDelete({
            username: "zaintweet"
        });

        // user that will tweet

        const user = await users.create({
            username: "zaintweet",
            password: "zaintweet",
            email: "zaintweet@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            email: "zaintweet@gmail.com",
            fullname: "zainabadtweet"
        });
        userid = user.id;
        const res = await request(app).post("/api/v1/users/login").send({
            username: "zaintweet",
            password: "zaintweet"
        });

        accesstoken2 = res.body.data.new_accesstoken;
    });


    it("should successfully make a tweet.", async () => {
        const res = await request(app).post("/api/v1/tweets/maketweet").set("Cookie", [`accesstoken=${accesstoken2}`]).send({
            tweet_content: "Testing tweet functionality in tweet testing file."
        });


        expect(res.body.message).toBe("Tweet was saved in the database.")
    });

    it("should not make a tweet.(no content was given.)", async () => {
        const res = await request(app).post("/api/v1/tweets/maketweet").set("Cookie", [`accesstoken=${accesstoken2}`]).send({
            tweet_content: ""
        });


        expect(res.body.message).toBe("tweet content is necessary but was not given.");
    });

    it("should make a tweet.(only media was given.)", async () => {
        const res = await request(app).post("/api/v1/tweets/maketweet").set("Cookie", [`accesstoken=${accesstoken2}`])
            .attach("tweet_media", filepath);


        expect(res.body.message).toBe("Tweet was saved in the database.");
    });






    afterAll(async () => {
        await users.findOneAndDelete({
            username: "zaintweet"
        });
        await tweets.findOneAndDelete({
            tweet_content: "Testing tweet functionality in tweet testing file."
        })
    })
});


describe("Deleting a Tweet", () => {
    let accesstoken2;
    let userid;
    let userid2;
    beforeEach(async () => {
        await tweets.findOneAndDelete({
            tweet_content: "Testing the tweet controller 2."
        })
    })
    beforeAll(async () => {
        await users.findOneAndDelete({
            username: "zaintweet2"
        });
        await users.findOneAndDelete({
            username: "zaintweet3"
        });

        // user that will tweet

        const user = await users.create({
            username: "zaintweet2",
            password: "zaintweet2",
            email: "zaintweet2@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            fullname: "zainabadtweet2"
        });
        const user2 = await users.create({
            username: "zaintweet3",
            password: "zaintweet3",
            email: "zaintweet3@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            fullname: "zainabadtweet3"
        });
        userid = user.id;
        userid2 = user2.id;

        const res = await request(app).post("/api/v1/users/login").send({
            username: "zaintweet2",
            password: "zaintweet2"
        });

        accesstoken2 = res.body.data.new_accesstoken;
    });


    it("should delete a tweet", async () => {
        const twtres = await tweets.create({
            tweet_content: "Testing the tweet controller 2.",
            tweet_owner: userid
        });
        const twtid = twtres.id;


        const res = await request(app).delete(`/api/v1/tweets/c/${twtid}/delete/tweet`).set("Cookie", [`accesstoken=${accesstoken2}`]);


        expect(res.body.message).toBe("Tweet deleted successfully.");
    });


    it("should not delete a tweet(tweet doesn't exists)", async () => {

        const twtid = "687e2f5bcfc9a2a36beab0a0"

        const res = await request(app)
            .delete(`/api/v1/tweets/c/${twtid}/delete/tweet`)
            .set("Cookie", [`accesstoken=${accesstoken2}`]);


        expect(res.body.message).toBe("tweet was not found in the database");
    });


    it("should not delete a tweet (non owner trying to delete)", async () => {
        const twtres = await tweets.create({
            tweet_content: "Testing the tweet controller 2.",
            tweet_owner: userid2
        });
        const twtid = twtres.id;


        const res = await request(app).delete(`/api/v1/tweets/c/${twtid}/delete/tweet`).set("Cookie", [`accesstoken=${accesstoken2}`]);


        expect(res.body.message).toBe("Only tweet owner can delete the tweet");
    });


    afterAll(async () => {
        await users.findOneAndDelete({
            username: "zaintweet2"
        });
        await users.findOneAndDelete({
            username: "zaintweet3"
        });
        await tweets.findOneAndDelete({
            tweet_content: "Testing the tweet controller 2."
        })
    });
});



describe("Getting all tweets of a user", () => {
    let accesstoken2;
    let userid;
    beforeEach(async () => {
        await tweets.findOneAndDelete({
            tweet_content: "getalltweets1"
        })
        await tweets.findOneAndDelete({
            tweet_content: "getalltweets2"
        })
        await tweets.findOneAndDelete({
            tweet_content: "getalltweets3"
        })
        await tweets.findOneAndDelete({
            tweet_content: "getalltweets4"
        })
    })
    beforeAll(async () => {
        await users.findOneAndDelete({
            username: "zaintweet4"
        });

        // user that will tweet

        const user = await users.create({
            username: "zaintweet4",
            password: "zaintweet4",
            email: "zaintweet4@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            fullname: "zainabadtweet4"
        });

        userid = user.id;


        const res = await request(app).post("/api/v1/users/login").send({
            username: "zaintweet4",
            password: "zaintweet4"
        });

        accesstoken2 = res.body.data.new_accesstoken;
    });


    it("should get all tweets", async () => {

        await subscribtions.create({
            tweet_owner: userid,
            tweet_content: "getalltweets1"
        })
        await subscribtions.create({
            tweet_owner: userid,
            tweet_content: "getalltweets2"
        })
        await subscribtions.create({
            tweet_owner: userid,
            tweet_content: "getalltweets3"
        })
        await subscribtions.create({
            tweet_owner: userid,
            tweet_content: "getalltweets4"
        });



        const res = await request(app).get("/api/v1/tweets/c/zaintweet4/getalltweets");

        expect(res.body.message).toBe("Tweets fetched successfully.");

        expect(res.body.data.username).toBe("zaintweet4");

    });



    afterAll(async () => {
        await users.deleteOne({
            username: "zaintweet4"
        });
        await subscribtions.deleteMany({
            tweet_owner: userid
        });

    })


})