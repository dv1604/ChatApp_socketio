// handles the flow after connection and authentication

import { Server } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuth";
import { addActiveUser, getAllActiveUsers, removeActiveUser } from "../utils/activeUsers";
import { broadcastUserStatus, sendUserConversations, updateUserOnlineStatus } from "../utils/connectionUtils";

export const handleConnection = (io: Server, socket: AuthenticatedSocket) => {
    // check if user is authenticated by checking socket user element added by middlware
    if (!socket.userId || !socket.userData) {
        console.warn('Attempted to handle connection for unauthenticated socket. Disconnecting..');
        socket.disconnect(true);
        return;
    }

    // add user to active users map
    addActiveUser(socket);

    // update users online status
    updateUserOnlineStatus(socket.userId, true);

    //join user to their personal room so people can send messages to this specific user
    socket.join(`user_${socket.userId}`);

    // send current user their active conversations
    sendUserConversations(socket);

    // broadcast all the users this current user's online status
    broadcastUserStatus(io, socket, 'user_online');

    // sent list of all online users
    socket.emit('online_users', getAllActiveUsers());

    console.log(`Socket connected : ${socket.id}, User: ${socket.userData.username}`);
};

// handle socket disconnection
export const handleDisconnection = (io: Server, socket: AuthenticatedSocket) => {

    if (!socket.userId || !socket.userData) {
        console.warn('Attempted to handle disconnection for unidentified socket.');
        return;
    }

    //remove user from active users map
    removeActiveUser(socket);

    // update user status to offline
    updateUserOnlineStatus(socket.userId, false);

    // broadcast user offline status to other
    broadcastUserStatus(io, socket, 'user_offline');

    console.log(`Socket disconnected: ${socket.id}, User : ${socket.userData.username}`);
}