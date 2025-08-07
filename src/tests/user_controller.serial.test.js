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
        await users.deleteMany({});
    })

    const filepath = path.join(__dirname, "zain.jpg");
    it("should register a user", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .attach("avatar", filepath)
            .field("username", "zain3")
            .field("password", "1234567")
            .field("email", "abcd4@gmail.com")
            .field("fullname", "zainabad4")

        expect(res.status).toBe(201);


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
        await users.deleteMany({});
    })


}
)
describe("testing the user controller(Login).", () => {
    //LOCAL HOOKS
    beforeAll(async () => {
        await users.deleteMany({});
        await users.create({
            username: "zainabad",
            password: "zain123",
            email: "zain@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            email: "zain@gmail.com",
            fullname: "zainabad"
        })
    })


    it("should login the user.", async () => {

        const res = await request(app).post("/api/v1/users/login").send({
            username: "zainabad",
            password: "zain123"
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
            username: "zainabad",
            password: "dodoijdoiewj"
        });

        expect(res.body.message).toBe("Incorrect password.");
        expect(res.status).toBe(401);
    })

    afterAll(async () => {
        await users.deleteMany({});
    })
})

describe("testing the user controller(logout)", () => {
    let accesstoken;
    beforeEach(async () => {
         await users.deleteMany({});
        await users.create({
            username: "zainabad",
            password: "zain123",
            email: "zain@gmail.com",
            avatar: "http://res.cloudinary.com/zainabad27/image/upload/v1753292672/xbksaqie8af8nbiibwnp.jpg",
            email: "zain@gmail.com",
            fullname: "zainabad"
        })

        const res=await request(app).post("/api/v1/users/login").send({
            username: "zainabad",
            password: "zain123"
        });
        accesstoken=res.body.data?.new_accesstoken;
    });


    it("should update the user password", async () => {
        const res = await request(app).post("/api/v1/users/update-password")
        .set("Cookie", [`accesstoken=${accesstoken}`])
        .send({
            oldpassword: "zain123",
            newpassword: "123zain",
            confirmpassword: "123zain"
        });
        expect(res.body.message).toBe("Password Updated Succesfully.");
    })
    it("should not update the user passowrd (old is not correct).", async () => {
        const res = await request(app).post("/api/v1/users/update-password")
        .set("Cookie", [`accesstoken=${accesstoken}`])
        .send({
            oldpassword: "zain1234",
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
        await users.deleteMany({});
    })
})