"use client"
import { IoCallOutline } from "react-icons/io5";
import Avatar from "../ui/Avatar";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { FiInfo } from "react-icons/fi";
import MessageBubble from "../ui/MessageBubble";
import { Message, MessageType, UserDisplayInfo } from '../../types/index'
import MessageInput from "../ui/MessageInput";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function ChatArea() {

    const { user: currentUser } = useSelector((state: RootState) => {
        return state.auth
    })

    // Placeholder for active chat details
    const activeChat = {
        id: 'conv1',
        name: 'John Doe',
        isOnline: true, // Placeholder for other user's online status
        avatarUrl: "https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        lastSeen: '2025-06-05T10:30:00Z',
    };

    // Placeholder for messages (some sent, some received)
    const dummyMessages: Message[] = [
        { id: 'm1', content: 'Hello there!', senderId: 'user123', sender: { id: 'user123', username: 'You', avatarUrl: null }, createdAt: '2025-06-05T09:00:00Z', conversationId: 'conv1', isRead: false, isEdited: false, messageType: 'TEXT', editedAt: null },
        { id: 'm2', content: 'Hi! How are you doing?', senderId: 'otherUser', sender: { id: 'otherUser', username: 'John Doe', avatarUrl: null }, createdAt: '2025-06-05T09:01:00Z', conversationId: 'conv1', isRead: false, isEdited: false, messageType: 'TEXT', editedAt: null },
        { id: 'm3', content: 'I am good, thanks! Just finishing up some work.', senderId: 'user123', sender: { id: 'user123', username: 'You', avatarUrl: null }, createdAt: '2025-06-05T09:02:00Z', conversationId: 'conv1', isRead: false, isEdited: false, messageType: 'TEXT', editedAt: null },
        { id: 'm4', content: 'Great to hear! Need any help?', senderId: 'otherUser', sender: { id: 'otherUser', username: 'John Doe', avatarUrl: null }, createdAt: '2025-06-05T09:03:00Z', conversationId: 'conv1', isRead: false, isEdited: false, messageType: 'TEXT', editedAt: null },
    ];


    return (
        <div className="flex flex-col flex-grow bg-[#1a1a2e]/80 backdrop-blur-md rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] border border-white/10 relative overflow-hidden">

            <div className="absolute inset-0 glass-gradient pointer-events-none"></div>

            {/* chat header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 z-10">
                <div className="flex items-center gap-3">
                    <Avatar
                        username={activeChat.name}
                        src={activeChat.avatarUrl}
                        isOnline={activeChat.isOnline}
                        size="md"
                    />
                    <div>
                        <h2 className="text-lg font-semibold text-white">{activeChat.name}</h2>
                        <p
                            className="text-sm text-gray-400"
                        >{activeChat.isOnline ? 'Online' : 'Offline'}</p>
                    </div >
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

            {/* message list area */}
            <div className="flex-grow flex flex-col overflow-y-auto p-4 z-10 gap-1">
                {dummyMessages.map(message => (
                    <MessageBubble
                        key={message.id}
                        isSentByCurrentUser={message.senderId === currentUser?.id}
                        message={message}
                        currentUserAvatar={currentUser?.avatarUrl!}
                        otherUserAvatar={activeChat.avatarUrl}
                    />
                ))}
            </div>

            {/* message input field */}
            <div className="p-4 border-t border-gray-700 z-10">
                <MessageInput
                    otherUserId={activeChat.id}
                    
                />
            </div>

        </div>
    )

}