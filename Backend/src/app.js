import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import taskRouter from './routes/task.routes.js';
import { initScheduler } from './services/taskScheduler.service.js';
import morgan from 'morgan';
import cors from 'cors';
const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Health Check
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

// route declaration
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);
app.use("/api/tasks", taskRouter);

// Start the background jobs
initScheduler();

export { app };
