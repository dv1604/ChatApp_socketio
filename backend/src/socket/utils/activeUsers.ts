import { AuthenticatedSocket } from "../middleware/socketAuth";

export interface ActiveUserEntry {
    socketId: string;
    userData: {
        id: number;
        username: string;
        avatarUrl: string | null;
    };
    joinedAt: Date;
}

export const activeUsers = new Map<number, ActiveUserEntry>();

// active user is added when a user connects & authenticates
export const addActiveUser = (socket: AuthenticatedSocket) => {

    if (socket.userId && socket.userData) {
        activeUsers.set(socket.userId, {
            socketId: socket.id,
            userData: {
                id: socket.userData.id,
                username: socket.userData.username,
                avatarUrl: socket.userData.avatarUrl,
            },
            joinedAt: new Date()
        });

        console.log(`User ${socket.userData.username} connected with socket ID (${socket.id})`);
    } else {
        console.warn('Attempted to add unauthenticated socket to activeUsers map.This should ideally not happen.');

    }
}

// user is removed when they disconnect
export const removeActiveUser = (socket: AuthenticatedSocket) => {
    if (socket.userId) {
        const wasActive = activeUsers.delete(socket.userId);
        if (wasActive) {
            console.log(`User ${socket.userData?.username || socket.userId} disconnected (${socket.id}). Total: ${activeUsers.size}`);
        } else {
            console.warn(`User ID ${socket.userId} not found in activeUsers map`);
        }
    } else {
        console.warn('Attempted to remove socket without userId from activeUsers map');

    }
}

// retrieve active user entry
export const getActiveUser = (userId: number): ActiveUserEntry | undefined => {
    return activeUsers.get(userId);
};

// retrieve list of all active users
export const getAllActiveUsers = (): Array<{ userId: number; username: string; avatarUrl: string | null; joinedAt: Date }> => {
    return Array.from(activeUsers.values()).map(user => ({
        userId: user.userData.id,
        username: user.userData.username,
        avatarUrl: user.userData.avatarUrl,
        joinedAt: user.joinedAt

    }))
};

// check if user is active
export const isUserActive = (userId: number): boolean => {
    return activeUsers.has(userId);
}