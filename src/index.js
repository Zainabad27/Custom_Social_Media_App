import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.PORT)
import { connect_to_db } from "./database/index.js";
import express from "express";

connect_to_db();

