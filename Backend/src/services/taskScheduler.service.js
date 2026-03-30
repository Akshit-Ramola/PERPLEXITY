import cron from 'node-cron';
import { taskModel } from '../models/task.model.js';
import { generateResponse } from './ai.service.js';
import chatModel from '../models/chat.model.js';
import messageModel from '../models/message.model.js';

const activeJobs = {};

export const initScheduler = async () => {
    try {
        const tasks = await taskModel.find({ isActive: true });
        console.log(`Initializing scheduler with ${tasks.length} active tasks.`);
        for (const task of tasks) {
            scheduleTask(task);
        }
    } catch (error) {
        console.error("Failed to initialize scheduler:", error);
    }
}

export const scheduleTask = (task) => {
    // Stop existing job if it exists (e.g., when updating a task)
    if (activeJobs[task._id]) {
        activeJobs[task._id].stop();
    }

    if (!task.isActive) return;

    // Create the cron job
    activeJobs[task._id] = cron.schedule(task.cronExpression, async () => {
        try {
            console.log(`[Task Scheduler] Executing: ${task.title}`);
            
            const prompt = `[Automated Background Task: ${task.title}] - ${task.prompt}`;

            const result = await generateResponse([
                { role: 'user', content: prompt }
            ]);

            // Find or create a specific chat thread for this task
            let chat = await chatModel.findOne({ user: task.user, title: `Scheduled: ${task.title}` });
            if (!chat) {
                chat = await chatModel.create({ user: task.user, title: `Scheduled: ${task.title}` });
            }

            // Save the logs/results into the chat
            await messageModel.create({ chat: chat._id, content: prompt, role: 'user' });
            await messageModel.create({ chat: chat._id, content: result, role: 'ai' });

            // Mark last run
            task.lastRunAt = new Date();
            await task.save();

            console.log(`[Task Scheduler] Completed: ${task.title}`);
        } catch (error) {
            console.error(`[Task Scheduler] Failed executing ${task.title}:`, error);
        }
    });

    console.log(`Scheduled task ${task.title} with cron ${task.cronExpression}`);
}

export const unscheduleTask = (taskId) => {
    if (activeJobs[taskId]) {
        activeJobs[taskId].stop();
        delete activeJobs[taskId];
        console.log(`Unscheduled task ${taskId}`);
    }
}
