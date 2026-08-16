import { body, validationResult } from "express-validator";

export function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstErrorMessage = errors.array()[0]?.msg || "Validation failed";
        return res.status(400).json({ message: firstErrorMessage, errors: errors.array() });
    }
    next();
}

export const registerValidator = [
    body("username").trim().notEmpty().withMessage("Username is required").isLength({ min: 3, max: 30 }).withMessage("Username must be at least 3 characters long").matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    validate
];

export const loginValidator = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validate
];
