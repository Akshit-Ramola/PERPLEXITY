import { Router } from "express";
import { body } from "express-validator";
import { register, verifyEmail, login, getMe } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";
const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post(
    "/register", registerValidator, register);

/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 * @body { email, password }    
 */
authRouter.post(
    "/login", loginValidator, login);

/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user's details
 * @access Private
 */
authRouter.get('/get-me', authUser, getMe)

authRouter.get('/verify-email', verifyEmail);

export default authRouter;
