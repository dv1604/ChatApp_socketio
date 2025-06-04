import { Conversation, Group, Message, MessageType, User, UserBasicInfo, UserDisplayInfo } from ".";

// define events emitted to the server by socket.io
export interface SocketEvents {
    private_message: (data: {
        receiverId: string;
        content: string;
        messageType?: MessageType;
        tempId: string;
    }) => void;
    // group_message: (data: {
    //     groupId: string;
    //     content: string;
    //     messageType?: MessageType;
    //     tempId: string;
    // }) => void;
    get_messages: (data: {
        conversationId?: string;
        groupId?: string;
        limit: number;
        offset: number;
    }) => void;
    // typing: (data: {
    //     chatId: string;
    //     isTyping: boolean;
    // }) => void;
    // mark_as_read: (data: {
    //     messageId: string;
    // }) => void;
}

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