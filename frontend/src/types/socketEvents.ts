import { Conversation, Group, Message, MessageType, SenderInfo, User, UserBasicInfo, UserDisplayInfo } from ".";


export interface PrivateMessageInput {
    receiverId: number;
    content: string;
    messageType?: MessageType;
    tempId: string;
}

export interface UserConversations {
    id: number;
    lastMessage: {
        content: string,
        createdAt: string;
        id: number;
        senderId: number;
        senderUsername: string;
    };
    otherUser: Pick<User, 'avatarUrl' | 'id' | 'isOnline' | 'username'>;
};

export interface MessageLoaded {
    conversationId: number;
    messages: {
        id: number,
        content: string,
        messageType: MessageType,
        sender: SenderInfo,
        createdAt: string
    },
    hasMore: boolean
}

export type ConversationMessages = Pick<Message, 'content' | 'createdAt' | 'id' | 'sender' | 'messageType'>;
// define tha data received from the server
export interface SocketListeners {
    private_message: (message: Message) => void;
    // group_message: (message: Message) => void;
    message_sent: (data: { id: string; conversationId?: string; groupId?: string; createdAt: string; tempId?: string }) => void;
    messages_loaded: (data: { messages: Message[]; hasMore: boolean; conversationId?: string; groupId?: string }) => void;
    // user_typing: (data: { chatId: string; userId: string; username: string; isTyping: boolean }) => void;
    user_online: (user: UserBasicInfo & Pick<User, 'avatarUrl'>) => void;
    user_offline: (user: UserBasicInfo) => void;
    // user_online_in_group: (data: { groupId: string; userId: string; username: string; avatarUrl: string | null }) => void;
    // user_offline_in_group: (data: { groupId: string; userId: string; username: string }) => void;
    online_users: (users: UserDisplayInfo[]) => void;
    initial_chat_data: (data: {
        conversations: Conversation[];
        groups: Group[];
    }) => void;
    // message_read: (data: { messageId: string; userId: string }) => void;
    error: (data: { message: string }) => void;
}