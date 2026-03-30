import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTaskAPI, getTasksAPI, deleteTaskAPI } from '../service/task.api';
import { setTasks, addTask, removeTask, setTaskLoading } from '../task.slice';

const CreateTask = () => {
    const dispatch = useDispatch();
    const { tasks, isLoading } = useSelector((state) => state.task);
    
    const [title, setTitle] = useState('');
    const [prompt, setPrompt] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            dispatch(setTaskLoading(true));
            try {
                const data = await getTasksAPI();
                dispatch(setTasks(data.tasks));
            } catch (error) {
                console.error("Failed to load tasks", error);
            } finally {
                dispatch(setTaskLoading(false));
            }
        };
        fetchTasks();
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !prompt.trim()) return;

        setIsSubmitting(true);
        try {
            const data = await createTaskAPI({ title, prompt, frequency });
            dispatch(addTask(data.task));
            setTitle('');
            setPrompt('');
            setFrequency('daily');
        } catch (error) {
            console.error("Failed to create task", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTaskAPI(id);
            dispatch(removeTask(id));
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto pt-10 px-6 pb-20 custom-scrollbar">
            <div className="mb-10">
                <h2 className="text-3xl font-medium mb-2 text-white/90">Scheduled Tasks</h2>
                <p className="text-[#a0a0a5] text-sm">Create background tasks that AI will run automatically. Results will appear in your Library thread.</p>
            </div>

            <div className="bg-[#1e1e20] border border-white/5 rounded-2xl p-6 mb-10 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
                <h3 className="text-xl font-medium mb-6 text-white/80 relative z-10">Create a New Task</h3>
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">Task Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Daily Tech News"
                            className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-2.5 text-[#e8e8e6] outline-none focus:border-cyan-800/50 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">AI Prompt & Instructions</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Search the web for the latest artificial intelligence news and give me a 3-paragraph summary."
                            className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-[#e8e8e6] outline-none focus:border-cyan-800/50 transition-colors h-28 resize-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">Frequency</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-2.5 text-[#e8e8e6] outline-none focus:border-cyan-800/50 transition-colors appearance-none cursor-pointer"
                        >
                            <option value="every_minute">Every Minute (Testing)</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily (8:00 AM)</option>
                            <option value="weekly">Weekly (Monday 8:00 AM)</option>
                        </select>
                    </div>
                    
                    <div className="pt-2 text-right">
                        <button
                            type="submit"
                            disabled={isSubmitting || !title || !prompt}
                            className="px-6 py-2.5 bg-cyan-700/20 text-cyan-400 border border-cyan-800/50 rounded-lg font-medium hover:bg-cyan-700/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-medium mb-6 text-white/80">Active Tasks</h3>
                {isLoading ? (
                    <div className="flex items-center justify-center p-8 text-[#8e8e93]">
                        <svg className="w-5 h-5 animate-spin mr-3 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
                        Loading your tasks...
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center p-8 border border-white/5 border-dashed rounded-2xl bg-[#1e1e20]/50 text-[#8e8e93]">
                        You haven't scheduled any tasks yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <div key={task._id} className="bg-[#1e1e20] border border-white/5 rounded-xl p-5 flex justify-between items-start group hover:border-white/10 transition-colors">
                                <div className="pr-4">
                                    <h4 className="font-medium text-[#e8e8e6] text-lg mb-1">{task.title}</h4>
                                    <p className="text-[#a0a0a5] text-sm mb-3 line-clamp-2">{task.prompt}</p>
                                    <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">
                                        <span className="bg-[#121212] px-2 py-1 rounded border border-white/5">{task.frequency.replace('_', ' ')}</span>
                                        {task.lastRunAt && (
                                            <span>Last run: {new Date(task.lastRunAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(task._id)}
                                    className="p-2 bg-[#121212] border border-white/5 text-[#8e8e93] hover:text-[#ff6b6b] hover:bg-white/5 hover:border-[#ff6b6b]/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                    title="Delete task"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateTask;
