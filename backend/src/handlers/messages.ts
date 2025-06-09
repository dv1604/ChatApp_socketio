import { activeUsers } from './../utils/activeUsers';
import { Server } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuth";
import prisma from "../config/database";
import { broadcastMessage, findOrCreateConversation } from "../utils/messageUtils";
import { getMessagesData, groupMessageData, privateMessageData } from "../types/message";

export const handlePrivateMessage = async (io: Server, socket: AuthenticatedSocket, data: privateMessageData) => {

    try {

        if (!socket.userId || !socket.userData) {
            socket.emit('error', { message: 'AUthentication required to send message' });
            return;
        }

        const { receiverId, content, messageType, tempId } = data;

        if (!receiverId || !content?.trim()) {
            socket.emit('error', {
                message: 'Invalid message data : recieverId and content are required'
            });
            return;
        }

        // get username of reciever from user table
        const receiver = await prisma.user.findUnique({
            where: {
                id: receiverId
            },
            select: {
                id: true,
                username: true
            }
        });

        if (!receiver) {
            socket.emit('error', {
                message: 'Receiver not found.'
            });
            return;
        }

        const conversation = await findOrCreateConversation(socket.userId, receiverId);

        const message = await prisma.message.create({
            data: {
                senderId: socket.userId,
                content: content.trim(),
                messageType,
                conversationId: conversation.id
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });

        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() }
        });

        const messageData = {
            id: message.id,
            content: message.content,
            messageType: message.messageType,
            sender: {
                id: message.sender.id,
                username: message.sender.username,
                avatarUrl: message.sender.avatarUrl
            },
            conversationId: conversation.id,
            createdAt: message.createdAt.toISOString(),
        };

        await broadcastMessage(io, conversation.id, messageData, socket.userId);

        socket.emit('message_emit', {
            id: message.id,
            conversationId: conversation.id,
            createdAt: message.createdAt.toISOString(),
            tempId
        });

    } catch (error) {

        console.error('Private message error: ', error);
        socket.emit('error', { message: 'Failed to send message' });
    }
};

export const handleGroupMessage = async (io: Server, socket: AuthenticatedSocket, data: groupMessageData) => {

    try {
        // Ensure sender is authenticated
        if (!socket.userId || !socket.userData) {
            socket.emit('error', { message: 'Authentication required to send group message.' });
            return;
        }

        const { groupId, content, messageType = 'TEXT', tempId } = data;

        // 1. Validate input
        if (!groupId || !content?.trim()) {
            socket.emit('error', { message: 'Invalid group message data: groupId and content are required.' });
            return;
        }

        // 2. Verify sender is a member of the group
        const groupMembership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: socket.userId,
                    groupId: groupId,
                },
            },
        });

        if (!groupMembership) {
            socket.emit('error', { message: 'You are not a member of this group.' });
            return;
        }

        // 3. Create message record in the database
        const message = await prisma.message.create({
            data: {
                senderId: socket.userId,
                content: content.trim(),
                messageType,
                groupId: groupId, // Link message to the group
            },
            include: {
                sender: {
                    select: { id: true, username: true, avatarUrl: true }
                }
            }
        });

        // 4. Prepare message data for clients
        const messageData = {
            id: message.id,
            content: message.content,
            messageType: message.messageType,
            sender: {
                id: message.sender.id,
                username: message.sender.username,
                avatarUrl: message.sender.avatarUrl,
            },
            groupId: groupId,
            createdAt: message.createdAt.toISOString(),
        };

        // 5. Broadcast message to all members in the group's room, excluding the sender's own socket
        socket.to(`group_${groupId}`).emit('group_message', messageData);

        // 6. Send confirmation back to the sender
        socket.emit('message_sent', {
            id: message.id,
            groupId: groupId,
            createdAt: message.createdAt.toISOString(),
            tempId: tempId
        });

    } catch (error) {
        console.error('Error handling group message:', error);
        socket.emit('error', { message: 'Failed to send group message.' });
    }
};

// handle message history for a particular conversation
export const handleGetMessages = async (socket: AuthenticatedSocket, data: getMessagesData) => {

    try {

        if (!socket.userId) {
            socket.emit('error', {
                message: 'Authentication required to get mesages'
            });
            return;
        }

        const { conversationId, limit = 50, offset = 0 } = data;

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { user1Id: socket.userId },
                    { user2Id: socket.userId }
                ]
            }
        });

        if (!conversation) {
            socket.emit('error', {
                message: 'Conversation not found or unauthorized'
            });
            return;
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        socket.emit('messages_loaded', {
            conversationId,
            messages: messages.reverse().map(msg => ({
                id: msg.id,
                content: msg.content,
                messageType: msg.messageType,
                sender: {
                    id: msg.sender.id,
                    username: msg.sender.avatarUrl,
                    avatarUrl: msg.sender.avatarUrl
                },
                createdAt: msg.createdAt
            })),
            hasMore: messages.length === limit
        });
    } catch (error) {

        console.error('Get messages error:', error);
        socket.emit('error', { message: 'Failed to load messages.' });
    }
};