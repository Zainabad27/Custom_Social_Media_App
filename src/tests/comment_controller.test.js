import request from "supertest";
import { afterAll, beforeAll, it, expect, describe, beforeEach } from "vitest";
import { app } from "../app.js";
import { users } from "../models/user.model.js";
import { videos } from "../models/video.model.js";
import { comments } from "../models/comment.model.js";


describe("making a comment", () => {
    let accesstoken;
    let userid;

    beforeAll(async () => {
        await users.findOneAndDelete({
            username: "zaincomment"
        });

        await videos.findOneAndDelete({
            vidtitle: "test_vid"
        });

        // user that will comment.

        const user = await users.create({
            username: "zaincomment",
            password: "zaincomment",
            email: "zaincomment@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            fullname: "zainabadcomment"
        });
        userid = user.id;

        const video = await videos.create({
            videofile: "testing file",
            thumbnail: "testing thumbnail",
            vidtitle: "test_vid",
            vidduration: 20,
            description: "testing ",
            views: 230,
            isdeleted: false,
            owner: userid
        })

        const vidid = video.id;




        const res = await request(app).post("/api/v1/users/login").send({
            username: "zaincomment",
            password: "zaincomment"
        });

        accesstoken = res.body.data.new_accesstoken;
    });


    it("should not comment on a video(no comment content was given.)", async () => {
        const res = await request(app).post("/api/v1/comments/comment/on/video")
            .set("Cookie", [`accesstoken=${accesstoken}`]).send({
                vidtitle: "test_vid",

            });

        expect(res.body.message).toBe("Comment Cannot be Empty");

    })
    it("should comment on a video", async () => {
        const res = await request(app).post("/api/v1/comments/comment/on/video")
            .set("Cookie", [`accesstoken=${accesstoken}`]).send({
                vidtitle: "test_vid",
                content: "testing the comment controller."
            });

        expect(res.body.message).toBe("Comment saved in the database succesfully.");

    })
    it("should not comment on a video(not logged in)", async () => {
        const res = await request(app).post("/api/v1/comments/comment/on/video")
            .send({
                vidtitle: "test_vid",
                content: "testing the comment controller."
            });

        expect(res.body.message).toBe("Unauthorized access, No Token.");

    })
    it("should not comment on a video(video does not exists)", async () => {
        const res = await request(app).post("/api/v1/comments/comment/on/video")
            .set("Cookie", [`accesstoken=${accesstoken}`]).send({
                vidtitle: "does not exists",
                content: "testing the comment controller."
            });

        expect(res.body.message).toBe("Video does not exists in our database.");

    });
    it("should not comment on a video(vidtitle was not given)", async () => {
        const res = await request(app).post("/api/v1/comments/comment/on/video")
            .set("Cookie", [`accesstoken=${accesstoken}`]).send({
                content: "testing the comment controller."
            });

        expect(res.body.message).toBe("video title was not sent.");

    });
    it("should not comment on a video(comment was empty)", async () => {
        const res = await request(app).post("/api/v1/comments/comment/on/video")
            .set("Cookie", [`accesstoken=${accesstoken}`]).send({
                content: "",
                vidtitle: "test_vid"
            });

        expect(res.body.message).toBe("Comment Cannot be Empty");

    });
    it("should comment on a video(comment is blank spaces)", async () => {
        const res = await request(app).post("/api/v1/comments/comment/on/video")
            .set("Cookie", [`accesstoken=${accesstoken}`]).send({
                content: " ",
                vidtitle: "test_vid"
            });

        expect(res.body.message).toBe("Comment Cannot be Empty");

    });
   

    afterAll(async () => {
        videos.findOneAndDelete({
            vidtitle: "test_vid"
        });

        users.findOneAndDelete({
            username: "zaincomment"
        });

        comments.findOneAndDelete({
            owner: userid
        })
    })



})