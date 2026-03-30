import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    prompt: {
        type: String,
        required: true,
        trim: true
    },
    frequency: {
        type: String,
        enum: ['every_minute', 'hourly', 'daily', 'weekly'],
        required: true
    },
    cronExpression: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastRunAt: {
        type: Date,
        default: null
    },
    nextRunAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

export const taskModel = mongoose.model("Task", taskSchema);
