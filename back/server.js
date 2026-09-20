import app from "./src/app.js"
import dotenv from "dotenv"
import { connectDB } from "./src/db/index.js";
dotenv.config({
    path:"./.env"
});

connectDB()
    .then(()=>{app.listen(process.env.PORT,()=>{
    console.log(`running on http://localhost:${process.env.PORT}`);
})})

