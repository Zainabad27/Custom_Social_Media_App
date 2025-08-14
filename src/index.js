import dotenv from 'dotenv';
dotenv.config({
    path: "./.env"
});


    
import { connect_to_db } from "./database/index.js";


import { app } from './app.js';



connect_to_db().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server has started listening at localhost:/${process.env.PORT}`)
    })

}).catch((err) => {
    console.log("Connection to database failed!!! ", err);
})



