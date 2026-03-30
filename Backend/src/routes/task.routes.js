import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { createTask, getTasks, deleteTask } from "../controllers/task.controller.js";

const router = Router();

router.use(authUser); // All task routes require authentication

router.post("/", createTask);
router.get("/", getTasks);
router.delete("/:id", deleteTask);

export default router;
