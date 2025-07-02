"use client"
import { IoCallOutline } from "react-icons/io5";
import Avatar from "../ui/Avatar";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { FiInfo } from "react-icons/fi";
import MessageBubble from "../ui/MessageBubble";
import { Message, MessageType, UserDisplayInfo } from '../../types/index'
import MessageInput from "../ui/MessageInput";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/libs/socket";
import { selectAllMessages, setUserMessages, addMessage, setChatLoader, clearAIHistory, setActiveChat } from "@/store/features/chat/chatSlice";
import clsx from "clsx";

export default function ChatArea() {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { user: currentUser } = useSelector((state: RootState) => {
        return state.auth
    });

    const { activeChat, isLoadingChatData, currentUserRole } = useSelector((state: RootState) => {
        return state.chat
    });
    const dispatch = useDispatch();

    useEffect(() => {
        const socket = getSocket();

        // Load past messages only for user conversations
        socket?.on("messages_loaded", (pastMessages) => {
            if (currentUserRole === 'user') {
                dispatch(setUserMessages(pastMessages.messages));
            }
        });

        // Handle incoming private messages (for all conversations)
        socket?.on('private_message', (message) => {
            // Only add if it's for the current active conversation
            if (activeChat && message.conversationId === activeChat.convId) {
                dispatch(addMessage({
                    convId: activeChat.convId,
                    message: message
                }));
            }
        });

        socket?.on('user_typing', (typingData) => {
            console.log(typingData);
        })

        return () => {
            socket?.off("messages_loaded");
            socket?.off('private_message');
            socket?.off('user_typing');
        };
    }, [dispatch, activeChat, currentUserRole]);

    const messages = useSelector(selectAllMessages);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    return (
        <div className="h-full flex flex-col rounded-2xl">
            {/* Fixed Chat Header */}
            {activeChat && (
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-inherit sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <Avatar
                            username={activeChat.username}
                            src={activeChat.avatarUrl}
                            isOnline={activeChat.isOnline}
                            size="md"
                            role={currentUserRole}
                        />
                        <div>
                            <h2 className="text-lg font-semibold text-white">{activeChat.username}</h2>
                            <p className="text-sm text-gray-400">
                                {activeChat.isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {currentUserRole === 'chatbot' && (
                            <button 
                                className="p-2 relative rounded-full hover:bg-black/20 text-gray-400 transition-colors cursor-pointer"
                                onClick={() => {
                                    dispatch(clearAIHistory());
                                    // Clear messages from the current chat by setting active chat again
                                    dispatch(setActiveChat({
                                        currentUserRole: 'chatbot',
                                        activeChat: activeChat
                                    }));
                                }}
                                title="Clear conversation"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                        <button className="p-2 relative rounded-full hover:bg-black/20 text-gray-400 transition-colors cursor-pointer">
                            <IoCallOutline className="h-6 w-6" />
                        </button>
                        <button className="p-2 relative z-10 rounded-full hover:bg-black/20 text-gray-400 transition-colors cursor-pointer">
                            <FiInfo className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Scrollable Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingChatData ?
                    <div className="flex items-center justify-center h-full">
                        <div className="h-8 w-8 rounded-full border-2 border-gray-500 border-t-transparent animate-spin"></div>
                    </div>
                    : (
                        messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <p className={clsx(
                                    currentUserRole === "user" ? 
                                    "text-center text-lg" :
                                    "text-2xl text-shadow-[0px_10px_30px_rgba(245,158,11,0.6),_0px_5px_20px_rgba(245,158,11,0.5)]"
                                )} >{currentUserRole === "user" ? " No messages yet. Start the conversation!" : "Welcome to Sage AI. How can I help you?"}</p>
                            </div>
                        ) : (
                            <>
                                {messages.map(message => (
                                    <MessageBubble
                                        key={message.id}
                                        isSentByCurrentUser={message.sender.id === currentUser?.id}
                                        message={message}
                                        currentUserAvatar={currentUser?.avatarUrl || null}
                                        otherUserAvatar={activeChat && activeChat.avatarUrl}
                                    />
                                ))}
                                {/* Invisible div to scroll to */}
                                <div ref={messagesEndRef} />
                            </>
                        ))}
            </div>

            {/* Fixed Message Input Field */}
            {activeChat && (
                <div className="p-4 border-t border-gray-700 bg-inherit sticky bottom-0 z-20">
                    <MessageInput
                        otherUserId={activeChat.userId}
                        convId={activeChat.convId}
                    />
                </div>
            )}
        </div>
    )
}