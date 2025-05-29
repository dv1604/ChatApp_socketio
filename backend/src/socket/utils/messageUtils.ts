import { Server } from "socket.io";
import prisma from "../../config/database";
import { messageData } from "../types/message";

export const findOrCreateConversation = async (user1Id: number, user2Id: number) => {
    const [smallerId, largerId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

    let conversation = await prisma.conversation.findFirst({
        where: {
            user1Id: smallerId,
            user2Id: largerId
        }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                user1Id: smallerId,
                user2Id: largerId
            }
        });
    }
    return conversation;
}

// broadcast a meassage to all participants
export const broadcastMessage = async (io: Server, conversationId: number, message: messageData, senderId: number) => {
    try {
        
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            select: {
                user1Id: true,
                user2Id: true
            }
        });

        if (!conversation) return;

        const userIds = [conversation.user1Id, conversation.user2Id].filter(id => id !== senderId);
        userIds.forEach(userId => {
            io.to(`user_${userId}`).emit('private_message', message);
        });
    } catch (error) {
        console.error(`Error broadcasting message to conversation ${conversationId}:`,error);
        
    }
}