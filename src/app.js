import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


app.use(cors({
    origin: process.env.our_origin,
    credentials: false
}))


app.use(express.json({
    limit: "16kb",
}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

//routers import

import user_router from "./routes/user.routes.js"; 

app.use("/api/v1/users",user_router)
//   http://localhost:3000/api/v1/users/register







export { app }