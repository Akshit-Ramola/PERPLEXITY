import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import { app } from "./src/app.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";

dotenv.config({
    path: './.env'
});
const httpServer = http.createServer(app);

initSocket(httpServer);

connectDB()
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });

httpServer.listen(process.env.PORT || 3000, () => {
    console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
});
