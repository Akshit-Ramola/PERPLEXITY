import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import taskRouter from './routes/task.routes.js';
import { initScheduler } from './services/taskScheduler.service.js';
import morgan from 'morgan';
import cors from 'cors';
const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://perplexity-lime.vercel.app",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
