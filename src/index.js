import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.PORT)
import { connect_to_db } from "./database/index.js";


import { app } from './app.js';
import { async_handler } from './utils/async_handler.js';



connect_to_db().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server has started listening at localhost:/${process.env.PORT}`)
    })

}).catch((err) => {
    console.log("Connection to database failed!!! ", err);
})

app.get("/login", async_handler((req, res, next) => {
    res.send("Hi, Welcome to the login page!!!!");
}))
app.get("/",(req, res) => {
    res.send("Hi");
})

