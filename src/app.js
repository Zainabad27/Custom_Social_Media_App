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
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

//routers import

import user_router from "./routes/user.routes.js";

app.use("/api/v1/users", user_router)


import video_router from "./routes/video.routes.js";

app.use("/api/v1/videos", video_router);

import comment_router from "./routes/comment.routes.js";

app.use("/api/v1/comments", comment_router);


import tweet_router from "./routes/tweet.routes.js";

app.use("/api/v1/tweets", tweet_router);


export { app }