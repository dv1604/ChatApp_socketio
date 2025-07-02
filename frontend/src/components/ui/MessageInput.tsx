"use client"
import { useState } from "react"
import Button from "./Button";
import clsx from "clsx";
import { getSocket } from "@/libs/socket";
import { v4 as uuid4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { PrivateMessageInput, ConversationMessages } from "@/types/socketEvents";
import { addMessage, addToAIHistory, clearAIHistory } from "@/store/features/chat/chatSlice";
import { RootState } from "@/store/store";
import ollama from "ollama/browser";
import { store } from "@/store/store";

export default function MessageInput({
    otherUserId, convId
}: {
    otherUserId: number;
    convId: number;
}) {
    const [messageContent, setMessageContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const { currentUserRole, activeChat, aiConversationHistory } = useSelector((state: RootState) => state.chat);
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const socket = getSocket();

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (messageContent.trim() === '') return;

        setIsLoading(true);

        try {
            if (currentUserRole === 'chatbot') {
                // Create user message for AI chat
                const userMessage: ConversationMessages = {
                    id: Date.now() + Math.random(),
                    content: messageContent,
                    messageType: "TEXT",
                    sender: {
                        id: currentUser?.id || "user",
                        username: currentUser?.username || "You",
                        avatarUrl: currentUser?.avatarUrl || null
                    },
                    createdAt: new Date().toISOString()
                };

                // Add user message to AI conversation history
                dispatch(addToAIHistory({ role: 'user', content: messageContent }));

                // Dispatch user message to store
                dispatch(addMessage({
                    convId: activeChat?.convId || 150,
                    message: userMessage
                }));

                // Get the current conversation history from Redux store (including the just-added message)
                const currentState = store.getState();
                const currentHistory = currentState.chat.aiConversationHistory;
                console.log("Sending to AI:", currentHistory);

                // Get AI response with full conversation history
                const response = await ollama.chat({
                    model: "llama3.2:1b",
                    messages: currentHistory
                });

                console.log("chatBot Response:", response);

                // Check if response has content
                if (response && response.message && response.message.content) {
                    // Add AI response to conversation history
                    dispatch(addToAIHistory({ role: 'assistant', content: response.message.content }));

                    // Create AI message
                    const aiMessage: ConversationMessages = {
                        id: Date.now() + Math.random() + 1,
                        content: response.message.content,
                        messageType: "TEXT",
                        sender: {
                            id: "ai",
                            username: "Sage AI",
                            avatarUrl: null
                        },
                        createdAt: new Date().toISOString()
                    };

                    // Dispatch AI response to store
                    dispatch(addMessage({
                        convId: activeChat?.convId || 150,
                        message: aiMessage
                    }));
                } else {
                    console.error("Empty AI response:", response);
                    // Handle empty response
                    const errorMessage: ConversationMessages = {
                        id: Date.now() + Math.random() + 1,
                        content: "Sorry, I couldn't generate a response. Please try again.",
                        messageType: "TEXT",
                        sender: {
                            id: "ai",
                            username: "Sage AI",
                            avatarUrl: null
                        },
                        createdAt: new Date().toISOString()
                    };

                    dispatch(addMessage({
                        convId: activeChat?.convId || 150,
                        message: errorMessage
                    }));
                }

            } else if (currentUserRole === 'user') {
                if (!otherUserId) {
                    alert("Give receiverId");
                    return;
                }

                console.log('Sending Message:', messageContent);

                const tempId = uuid4();
                const message: PrivateMessageInput = {
                    receiverId: otherUserId,
                    content: messageContent,
                    messageType: "TEXT",
                    tempId
                }
                socket?.emit("private_message", message);
                console.log("Sent Message to ", otherUserId);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            
            // Handle error with user-friendly message
            if (currentUserRole === 'chatbot') {
                const errorMessage: ConversationMessages = {
                    id: Date.now() + Math.random() + 1,
                    content: "Sorry, I encountered an error. Please try again.",
                    messageType: "TEXT",
                    sender: {
                        id: "ai",
                        username: "Sage AI",
                        avatarUrl: null
                    },
                    createdAt: new Date().toISOString()
                };

                dispatch(addMessage({
                    convId: activeChat?.convId || 150,
                    message: errorMessage
                }));
            }
        } finally {
            setIsLoading(false);
            setMessageContent('');
        }
    };

    return (
        <form onSubmit={handleSendMessage} className="flex w-full gap-2 items-center ">
            <div className="flex-1 ">
                <textarea
                    disabled={isLoading}
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    autoComplete="off"
                    name="search"
                    className={clsx("block rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 bg-background-dark/50 text-gray-100 placeholder-gray-400 border-gray-700 min-h-[1rem] resize-none disabled:bg-gray-700/30 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-700 bg-[var(--background-dark)]/50 focus:border-[#42a5f5] focus:ring-[#42a5f5]/20 w-full"
                    )}
                    onInput={(e) => {
                        const textarea = e.target as HTMLTextAreaElement;
                        textarea.style.height = 'auto';
                        textarea.style.height = `${textarea.scrollHeight}px`;
                        socket?.emit("typing", {
                            convId : convId,
                            isTyping : true,
                        })
                    }}
                />
            </div>
            <Button
                type="submit"
                disabled={isLoading || messageContent.trim() === ''}
                isLoading={isLoading}
                fullWidth={false}
                additionalClass="shrink-0 w-1/8 max-w-xs"
            >
                Send
            </Button>
        </form>
    )
}