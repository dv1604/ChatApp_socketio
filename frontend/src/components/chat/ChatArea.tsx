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
import { useEffect, useRef } from "react";
import { getSocket } from "@/libs/socket";
import { selectAllMessages, setUserMessages, addMessage } from "@/store/features/chat/chatSlice";

export default function ChatArea() {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { user: currentUser } = useSelector((state: RootState) => {
        return state.auth
    });

    const { activeChat} = useSelector((state: RootState) => {
        return state.chat
    });
    const dispatch = useDispatch();

    useEffect(() => {
        const socket = getSocket();

        // Load past messages
        socket?.on("messages_loaded", (pastMessages) => {
            dispatch(setUserMessages(pastMessages.messages));
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

        return () => {
            socket?.off("messages_loaded");
            socket?.off('private_message');
        };
    }, [dispatch, activeChat]);

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
                        />
                        <div>
                            <h2 className="text-lg font-semibold text-white">{activeChat.username}</h2>
                            <p className="text-sm text-gray-400">
                                {activeChat.isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
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
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {messages.map(message => (
                            <MessageBubble
                                key={message.id}
                                isSentByCurrentUser={message.sender.id === currentUser?.id}
                                message={message}
                                currentUserAvatar={currentUser?.avatarUrl!}
                                otherUserAvatar={activeChat && activeChat.avatarUrl}
                            />
                        ))}
                        {/* Invisible div to scroll to */}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Fixed Message Input Field */}
            <div className="p-4 border-t border-gray-700 bg-inherit sticky bottom-0 z-20">
                <MessageInput
                    otherUserId={activeChat!.userId}
                    convId={activeChat!.convId}
                />
            </div>
        </div>
    )
}