import request from "supertest";
import { afterAll, beforeAll, it, expect, describe, beforeEach } from "vitest";
import { app } from "../app.js";
import { users } from "../models/user.model.js";


// ----------------------------------------------setup to upload a file---------------------------------------------------//
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//---------------------------------------------------------------------------------------------------------------------//

describe("testing the user controller(register).", () => {
    //LOCAL HOOKS
    beforeEach(async () => {
        await users.findOneAndDelete({
            username: "zain1"
        });
    })

    const filepath = path.join(__dirname, "zain.jpg");
    it("should register a user", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .attach("avatar", filepath)
            .field("username", "zain1")
            .field("password", "1234567")
            .field("email", "zain1@gmail.com")
            .field("fullname", "zain1abad4")

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("user registered successfully")


    })
    it("should sent register faliure cuz avatar is not given.", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "zain3")
            .field("password", "1234567")
            .field("email", "abcd4@gmail.com")
            .field("fullname", "zainabad4")

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Avatar is compulsory but was not given.");
    });
    it("should not register a user cuz username is not given", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .attach("avatar", filepath)
            .field("password", "1234567")
            .field("email", "abcd4@gmail.com")
            .field("fullname", "zainabad4")

        expect(res.body.message).toBe("username is Empty.");


    })

    afterAll(async () => {
        await users.findOneAndDelete({
            username: "zain1"
        });
    })


}
)
describe("testing the user controller(Login).", () => {
    //LOCAL HOOKS
    beforeAll(async () => {

        await users.create({
            username: "zain2",
            password: "zain2",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            email: "zain2@gmail.com",
            fullname: "zainabad2"
        })
    })


    it("should login the user.", async () => {

        const res = await request(app).post("/api/v1/users/login").send({
            username: "zain2",
            password: "zain2"
        })

        expect(res.status).toBe(201);
        expect(res.Cookie).toEqual(res.Cookie)
    })
    it("should not login the user cuz username does ont exists in the DB.", async () => {
        const res = await request(app).post("/api/v1/users/login").send({
            username: "kdcnf",
            password: "123456"
        });    

        expect(res.body.message).toBe("User does not exists");
    });
    it("should not login cuz incorrect password", async () => {
        const res = await request(app).post("/api/v1/users/login").send({
            username: "zain2",
            password: "dodoijdoiewj"
        });

        expect(res.body.message).toBe("Incorrect password.");
        expect(res.status).toBe(401);
    })

    afterAll(async () => {
        await users.findOneAndDelete({
            username: "zain2"
        })
    })
})

describe("testing the user controller(logout)", () => {
    let accesstoken;
    beforeAll(async () => {
         await users.create({
            username: "zain3",
            password: "zain3",
            email: "zain3@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            fullname: "zainabad3"
        })

        const res = await request(app).post("/api/v1/users/login").send({
            username: "zain3",
            password: "zain3"
        });
        accesstoken = res.body.data?.new_accesstoken;
    });


    it("should update the user password", async () => {
        const res = await request(app).post("/api/v1/users/update-password")
            .set("Cookie", [`accesstoken=${accesstoken}`])
            .send({
                oldpassword: "zain3",
                newpassword: "123zain",
                confirmpassword: "123zain"
            });
        expect(res.body.message).toBe("Password Updated Succesfully.");
    })
    it("should not update the user passowrd (old is not correct).", async () => {
        const res = await request(app).post("/api/v1/users/update-password")
            .set("Cookie", [`accesstoken=${accesstoken}`])
            .send({
                oldpassword: "jwdmom",
                newpassword: "123zain",
                confirmpassword: "123zain"
            });
        expect(res.body.message).toBe("Incorrect Old password.");
    })
    it("should not update the user passowrd (old is same as new).", async () => {
        const res = await request(app).post("/api/v1/users/update-password")
            .set("Cookie", [`accesstoken=${accesstoken}`])
            .send({
                oldpassword: "123zain",
                newpassword: "123zain",
                confirmpassword: "123zain"
            });
        expect(res.body.message).toBe("No changes made in the database.(new password is same as old password)");
    });


    afterAll(async () => {
        await users.findOneAndDelete({
            username: "zain3"
        });
    })
})