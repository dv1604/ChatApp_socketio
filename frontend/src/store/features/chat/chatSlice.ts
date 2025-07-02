import { RootState } from "@/store/store";
import { ActiveChatUser, ChatItem, Conversation, Group, Message, TypingUser, UserDisplayInfo } from "@/types";
import { ConversationMessages, MessageLoaded, UserConversations } from "@/types/socketEvents";
import { createSlice, EntityId, PayloadAction } from "@reduxjs/toolkit";
import { createEntityAdapter } from "@reduxjs/toolkit";

const messagesAdapter = createEntityAdapter<ConversationMessages, number>({
    selectId: (message: ConversationMessages) => message.id,
    sortComparer: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
});

const conversationAdapter = createEntityAdapter<UserConversations, number>({
    selectId: (conversation: UserConversations) => conversation.id,
    sortComparer: (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
});

// const groupsAdapter = createEntityAdapter<Group>({
//     sortComparer: (a, b) => {
//         // sort by last message but if no last message then by createdAt
//         const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();

//         const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();

//         return bTime - aTime;
//     }
// });

// intial state
interface chatState {
    messages: ReturnType<typeof messagesAdapter.getInitialState>;

    conversations: ReturnType<typeof conversationAdapter.getInitialState>;

    // groups: ReturnType<typeof groupsAdapter.getInitialState>;

    activeChat: ActiveChatUser | null;
    // onlineusers object with their id and details
    onlineUsers: Record<string, UserDisplayInfo>;
    // typingusers object with chatId and users typing in that chat
    // typingUsers: Record<string, TypingUser[]>;
    // chat loading flag
    isLoadingChatData: boolean;
    // flag for message sending status
    isSendingMessage: boolean;
    // flag that chat has more messages that can be loaded
    hasMoreMessages: boolean;
    // flag to indicate if chatbot is active
    isChatbotActive: boolean;
    // current user role in the chat , 'user' or 'chatbot'
    currentUserRole : 'user'|'chatbot';
    // AI conversation history for context
    aiConversationHistory: Array<{role: 'user' | 'assistant', content: string}>;
};

const initialState: chatState = {
    messages: messagesAdapter.getInitialState(),
    conversations: conversationAdapter.getInitialState(),
    // groups: groupsAdapter.getInitialState(),
    activeChat: null,
    onlineUsers: {},
    // typingUsers: {},
    isLoadingChatData: true,
    isSendingMessage: false,
    hasMoreMessages: true,
    isChatbotActive: false,
    currentUserRole : 'user',
    aiConversationHistory: []
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setActiveChat: (state, action: PayloadAction<{currentUserRole ?: 'user' | 'chatbot', activeChat :ActiveChatUser | null}>) => {
            state.activeChat = action.payload.activeChat;
            // when we change chat we need to clear hasMoreMessages as well as empty messages array
            messagesAdapter.removeAll(state.messages);
            state.hasMoreMessages = true;
            state.currentUserRole = action.payload.currentUserRole || 'user';
            
            // For AI chat, set loading to false immediately since there are no messages to load
            if (action.payload.currentUserRole === 'chatbot') {
                state.isLoadingChatData = false;
            }
        },

        // In your chat slice, update the addMessage reducer
        addMessage: (state, action: PayloadAction<{ convId: number, message: ConversationMessages }>) => {
            // Add message to current chat if it matches
            if (state.activeChat && action.payload.convId === state.activeChat.convId) {
                messagesAdapter.addOne(state.messages, action.payload.message);
            }

            // Update conversation in the list if it exists and it's not an AI message
            const existingConv = state.conversations.entities[action.payload.convId];
            if (existingConv && action.payload.message.sender.id !== "ai") {
                conversationAdapter.updateOne(state.conversations, {
                    id: action.payload.convId,
                    changes: {
                        lastMessage: {
                            id: action.payload.message.id,
                            content: action.payload.message.content,
                            createdAt: action.payload.message.createdAt,
                            senderId: parseInt(action.payload.message.sender.id),
                            senderUsername: action.payload.message.sender.username
                        }
                    }
                });
            }
        },

        updateMessage: (state, action: PayloadAction<{
            id: number, changes: Partial<ConversationMessages>
        }>) => {
            messagesAdapter.updateOne(state.messages, action.payload)
        },

        addMessages: (state, action: PayloadAction<{
            messages: Message[], hasMore: boolean
        }>) => {
            messagesAdapter.addMany(state.messages, action.payload.messages);
            state.hasMoreMessages = action.payload.hasMore
        },
        
        setOnlineUsers: (state, action: PayloadAction<UserDisplayInfo[]>) => {
            state.onlineUsers = action.payload.reduce((acc, user) => {
                acc[user.id] = { ...user, isOnline: true }
                return acc;
            }, {} as Record<string, UserDisplayInfo>);
        },

        setUserMessages: (state, action: PayloadAction<ConversationMessages>) => {
            messagesAdapter.setAll(state.messages, action.payload);
            state.isLoadingChatData = false;
        },

        setIntitalChatData: (state, action: PayloadAction<{
            conversations: UserConversations[]
        }>) => {
            conversationAdapter.setAll(state.conversations, action.payload);
            state.isLoadingChatData = false;
        },

        addConversation: (state, action: PayloadAction<UserConversations>) => {
            conversationAdapter.addOne(state.conversations, action.payload);
        },

        setChatLoader: (state, action: PayloadAction<boolean>) => {
            state.isLoadingChatData = action.payload;
        },

        setChatbotStatus: (state, action: PayloadAction<boolean>) => {
            state.isChatbotActive = action.payload;
        },

        // AI conversation history management
        addToAIHistory: (state, action: PayloadAction<{role: 'user' | 'assistant', content: string}>) => {
            state.aiConversationHistory.push(action.payload);
        },

        clearAIHistory: (state) => {
            state.aiConversationHistory = [];
        },

        resetChatState: () => initialState,
    }
})

export const { addConversation, resetChatState, addMessages, setActiveChat, setIntitalChatData, setOnlineUsers, updateMessage, setUserMessages, addMessage , setChatLoader , setChatbotStatus, addToAIHistory, clearAIHistory} = chatSlice.actions;

export const { selectById: selectConversationById, selectAll: selectAllConversations } = conversationAdapter.getSelectors((state: RootState) => state.chat.conversations);

export const { selectAll: selectAllMessages } = messagesAdapter.getSelectors((state: RootState) => state.chat.messages);

export default chatSlice.reducer;
