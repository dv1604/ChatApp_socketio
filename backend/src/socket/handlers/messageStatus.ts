import { Server } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuth";
import { markAsRead, messageData, typingData } from "../types/message";
import prisma from "../../config/database";

export const handleTyping = (io: Server, socket: AuthenticatedSocket, data: typingData) => {
    
    if (!socket.userId || !socket.userData) return;

    const { conversationId, isTyping } = data;
    
    if (!conversationId) return;

    socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.userData.username,
        isTyping
    });
};

export const handleMarkAsRead = async (socket: AuthenticatedSocket, data: markAsRead) => {

    try {
        
        if (!socket.userId) {
            socket.emit('error', {
                message: 'Authentication required to mark messages'
            });
            return;
        };

        const { messageId } = data;
        
        const message = await prisma.message.findFirst({
            where: {
                id: messageId,
                OR: [
                    {
                        conversation: {
                            OR: [
                                { user1Id: socket.userId },
                                { user2Id: socket.userId }
                            ]
                        }
                    }
                ]
            }
        });

        if (!message) {
            socket.emit('error', {
                message: 'Message not found or unauthorized'
            });
            return;
        };

        await prisma.messageReadReceipt.upsert({
            where: {
                messageId_userId: { messageId, userId: socket.userId }
            },
            update: { readAt: new Date() },
            create: { messageId, userId: socket.userId }
        });

        socket.emit('message_read', {
            message, userId: socket.userId
        });

    } catch (error) {
        
        console.error('Mark as read error: ', error);
        socket.emit('error', {
            message: 'Failed to marked as read'
        });   
    }
}