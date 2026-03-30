import { createSlice } from "@reduxjs/toolkit";

const taskSlice = createSlice({
    name: 'task',
    initialState: {
        tasks: [],
        isLoading: false,
        error: null
    },
    reducers: {
        setTasks: (state, action) => {
            state.tasks = action.payload;
        },
        addTask: (state, action) => {
            state.tasks.unshift(action.payload);
        },
        removeTask: (state, action) => {
            state.tasks = state.tasks.filter(t => t._id !== action.payload);
        },
        setTaskLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setTaskError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const { setTasks, addTask, removeTask, setTaskLoading, setTaskError } = taskSlice.actions;
export default taskSlice.reducer;
