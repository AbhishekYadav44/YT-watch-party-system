
import app from "./app.js";
import http from 'http';
import dotenv from 'dotenv';
import { initws } from "./ws/index.js";
dotenv.config();

const server = http.createServer(app);
initws(server);
const port = process.env.PORT || 8080
console.log(port)
server.listen(port,()=>{
    console.log(`your server is listening on port ${port}`)
})