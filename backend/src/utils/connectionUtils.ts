import { Server } from "socket.io";
import prisma from "../config/database"
import { AuthenticatedSocket } from "../middleware/socketAuth";

// update online status of user after connection is made
export const updateUserOnlineStatus = async (userId: number, isOnline: boolean) => {

    try {

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isOnline,
                lastSeen: new Date()
            }
        });
    } catch (error) {

        console.error(`Error updating user ${userId} online status to ${isOnline}:`, error);
    }
};

// send connected user's conversations
export const sendUserConversations = async (socket: AuthenticatedSocket) => {

    try {

        // find all conversations where user is eitheer user 1 or 2
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { user1Id: socket.userId },
                    { user2Id: socket.userId }
                ]
            },
            include: {
                // include both users details
                user1: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        isOnline: true
                    }
                },
                user2: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        isOnline: true
                    }
                },
                Message: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                lastMessageAt: 'desc'
            }
        });

        const formattedConversations = conversations.map(conv => {
            const otherUser = conv.user1Id === socket.userId ? conv.user2 : conv.user1;
            const lastMessage = conv.Message[0] || null;

            return {
                id: conv.id,
                otherUser: {
                    id: otherUser.id,
                    username: otherUser.username,
                    avatarUrl: otherUser.avatarUrl,
                    isOnline: otherUser.isOnline
                },
                lastMessage: lastMessage ? {
                    id: lastMessage.id,
                    content: lastMessage.content,
                    senderId: lastMessage.senderId,
                    senderUsername: lastMessage.sender.username,
                    createdAt: lastMessage.createdAt
                } : null
            };
        });

        socket.emit('conversations_list', formattedConversations)
    } catch (error) {

        console.error(`Error sending users ${socket.userId} conversations:`, error);
    }
}

// broadcast users online status
export const broadcastUserStatus = async (io: Server, socket: AuthenticatedSocket, event: 'user_online' | 'user_offline') => {

    try {

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { user1Id: socket.userId },
                    { user2Id: socket.userId }
                ]
            },
            select: {
                user1Id: true,
                user2Id: true
            }
        });

        const userIdsToNotify = new Set<number>();
        conversations.forEach(conv => {
            const otherUserId = conv.user1Id === socket.userId ? conv.user2Id : conv.user1Id;
            if (otherUserId !== socket.userId) {
                userIdsToNotify.add(otherUserId);
            }
        });

        userIdsToNotify.forEach(userId => {
            io.to(`user_${userId}`).emit(event, {
                userId: socket.userId,
                username: socket.userData?.username,
                ...(event === 'user_online' ? {
                    avatarUrl: socket.userData?.avatarUrl
                } : {})
            })
        });

    } catch (error) {
        console.error(`Error broadcasting user ${socket.id} ${event} status: `, error);
    }
}