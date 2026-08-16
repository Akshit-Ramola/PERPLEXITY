import { io } from "socket.io-client";

export const initializeSocketConnection = () => {
    const socket = io(import.meta.env.VITE_API_URL || "https://perplexity-1-b74b.onrender.com", {
        withCredentials: true,
    })

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server")
    })

    return socket;
}