import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
});

export const createTaskAPI = async (data) => {
    const res = await api.post("/api/tasks", data);
    return res.data;
};

export const getTasksAPI = async () => {
    const res = await api.get("/api/tasks");
    return res.data;
};

export const deleteTaskAPI = async (id) => {
    const res = await api.delete(`/api/tasks/${id}`);
    return res.data;
};
