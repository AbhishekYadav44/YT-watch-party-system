import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import mongoose from "mongoose";
dotenv.config()
const app = express();

app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.json({
        message : "yt-watch party"
    })
})

const dburl = process.env.DB_URL ?? "";
async function main() {
    await mongoose.connect(dburl);
}

main().then(()=>{
    console.log("db connected!")
}).catch((e)=>{
    console.log("err while connecting  to DB" , e)
})

export default app;