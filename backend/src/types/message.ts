export type messageData = {
    id: number;
    content: string;
    messageType: string;
    sender: {
        id: number;
        username: string;
        avatarUrl: string | null;
    },
    conversationId: number;
    createdAt: string;
}


export type privateMessageData = {
    receiverId: number;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
    tempId?: string;
}

export type groupMessageData = {
    groupId: number;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
    tempId?: string;
}

export type getMessagesData = {
    conversationId: number,
    limit?: number,
    offset?: number,
}


export type typingData = {
    conversationId: number;
    isTyping: boolean;
}

export type markAsRead = {
    messageId: number;
}