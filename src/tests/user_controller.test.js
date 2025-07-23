import request from "supertest";
import { it, expect, describe } from "vitest";
import { user_controller } from "../DI_classes.js/user.class.js";
import { app } from "../app.js";


const fakeuserinstance = {
    _id: "123456789",
    username: "abcd",
    email: "abcd@gmail.com",
    GenerateAccessToken: () => {
        return "accesstoken."
    },
    GenerateRefreshToken: () => {
        return "refreshtoken."
    },
    IsPasswordSame: (password="12345") => {
        if (password === "12345") return true;
        return false;
    }
}
const fakemodel = {
    findById: (id) => {
        if (id === "12345") {
            return fakeuserinstance;
        }
        else return null;

    },
    findOne: (username) => {
        if (username === "abcd") {
            return fakeuserinstance;
        }

    },
    findByIdAndUpdate: (id) => {
        if (id === "123456789") {
            return {
                select: (fields) => {
                    if(fields) return fakeuserinstance

                }
            }
        }

    }
}
// console.log("look here bro:......",app)

describe("testing the user controller.", () => {
  const test_obj=new user_controller(fakemodel);

  it("should login successfully.",async ()=>{
   const result=await request(app).post("/api/v1/users/users/login/through/classes").send({
        "username":"abcd",
        "password":"12345"
    })

    expect(result.statusCode).toBe(201);
  })


})