import { taskModel } from "../models/task.model.js";
import { scheduleTask, unscheduleTask } from "../services/taskScheduler.service.js";

const getCronExpression = (frequency) => {
    switch (frequency) {
        case 'every_minute': return '* * * * *';
        case 'hourly': return '0 * * * *';
        case 'daily': return '0 8 * * *'; // 8 AM daily
        case 'weekly': return '0 8 * * 1'; // 8 AM every Monday
        default: return '0 8 * * *'; 
    }
}

export const createTask = async (req, res) => {
    try {
        const { title, prompt, frequency } = req.body;
        
        if (!title || !prompt || !frequency) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const cronExpression = getCronExpression(frequency);

        const task = await taskModel.create({
            user: req.user.id,
            title,
            prompt,
            frequency,
            cronExpression
        });
        
        scheduleTask(task);

        res.status(201).json({ task });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getTasks = async (req, res) => {
    try {
        const tasks = await taskModel.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ tasks });
    } catch (error) {
        console.error("Error getting tasks:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await taskModel.findOneAndDelete({ _id: id, user: req.user.id });
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        
        unscheduleTask(id);

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Server error" });
    }
}
