export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeen: string;
    createdAt: string;
    updatedAt: string;
}

// reusable usre info types
export type UserBasicInfo = Pick<User, 'id' | 'username'>;

export type SenderInfo = Pick<User, 'id' | 'avatarUrl' | 'username'>

export type UserDisplayInfo = Pick<User, 'id' | 'username' | 'avatarUrl' | 'isOnline' | 'lastSeen'>;

// authenticated user data received after login/register
export type AuthUser = Pick<User, 'id' | 'username' | 'email' | 'avatarUrl'> & {
    token: string;
};

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

export interface Message {
    id: string;
    senderId: string;
    content: string;
    messageType: MessageType;
    conversationId: string | null;
    // groupId: string | null;
    isRead: boolean;
    isEdited: boolean;
    editedAt: string | null;
    createdAt: string;
    sender: SenderInfo; //sender relation in backend
}

export interface MessageReadReceipt {
    id: string;
    messageId: string;
    userId: string;
    readAt: string;
}

export interface Conversation {
    id: string;
    user1Id: string;
    user2Id: string;
    lastMessageAt: string;
    createdAt: string;
    //user relations 
    user1: UserDisplayInfo;
    user2: UserDisplayInfo;
    otherUser?: UserDisplayInfo;
    lastMessage?: Message;
    // unreadCount?: number;
}

export type GroupMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface GroupMember {
    id: string;
    userId: string;
    groupId: string;
    role: GroupMemberRole;
    joinedAt: string;
    user: UserDisplayInfo; //user details
}

export interface Group {
    id: string;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    isPrivate: boolean;
    createById: string;
    createdAt: string;
    updatedAt: string;
    createdBy: UserBasicInfo; //details of owner
    members?: GroupMember[];
    messages?: Message[];
    lastMessage?: Message;
    lastMessageAt?: string;
    unreadCount?: number;
    myRole?: GroupMemberRole;
}

// to differ chat acc to type
export interface ChatItem {
    id: string;
    type: 'conversation';
    name: string;
    lastMessage?: Message;
    lastMessageAt?: string;
    unreadCount?: number;
    isOnline?: boolean;
    avatarUrl?: string | null;
    participants?: UserDisplayInfo[]; //list of all member's details
    otherUser?: UserDisplayInfo;
}


export interface TypingUser {
    userId: string;
    username: string;
}