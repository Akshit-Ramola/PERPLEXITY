import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { sendEmail } from "../services/mail.service.js";

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {
    const { username, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ $or: [{ email }, { username }] });
    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User already exists with this email or username",
            success: false,
            err: "User already exists"
        });
    }

    const user = await userModel.create({ username, email, password });

    const emailVerificationToken = jwt.sign({
        email: user.email,
    }, process.env.JWT_SECRET)

    await sendEmail({
        to: email,
        subject: "Welcome to Perplexity!",
        html: `<h1>Welcome to Perplexity!</h1>
        <p>Hi ${username},</p>
        <p>Thank you for registering at Perplexity. We're excited to have you on board!</p>
        <p>Click the link below to verify your email:</p>
        <p><a href="http://localhost:8000/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a></p>
        <p>Best regards,</p>    
        <p>The Perplexity Team</p>`
    })

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,

        }
    })

}

/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 * @body { email, password }
 */
export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(400).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "Invalid email or password"
        })
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            err: "User not verified"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("token", token)

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}

/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user
 * @access Private
 */
export async function getMe(req, res) {
    const userId = req.user.id;
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not fond",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}

/**
 * @route GET /api/auth/verify-email
 * @description Verify user email
 * @access Public
 * @query { token }
 */
export async function verifyEmail(req, res) {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email: decoded.email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            })
        }

        user.verified = true;
        await user.save();

        const html = `
            <h1>Email Verified Successfully</h1>
            <p>Your email has been verified successfully. You can now login to your account.</p>
            <p>Click the link below to login:</p>
            <p><a href="http://localhost:5173/login">Login</a></p>
            <p>Best regards,</p>
            <p>The Perplexity Team</p>
            `
        res.send(html);
    } catch (err) {
        return res.status(400).json({
            message: "Invalid token",
            success: false,
            err: err.message
        })
    }
}