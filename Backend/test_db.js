import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "./src/constants.js";

dotenv.config();

console.log("Testing Connection with URI:", `${process.env.MONGODB_URI}/${DB_NAME}`);

mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    .then(() => {
        console.log("SUCCESS");
        process.exit(0);
    })
    .catch((err) => {
        console.error("FAIL", err.message);
        process.exit(1);
    });
