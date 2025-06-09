import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
    if (!socket) {
        socket = io('http://localhost:5000', {
            auth: { token }
        });
    }
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;
