
import app from "./app.js";
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

const server = http.createServer(app);
const port = process.env.PORT || 8080
console.log(port)
server.listen(8080,()=>{
    console.log(`your server is listening on port ${port}`)
})