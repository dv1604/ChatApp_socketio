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
import { useEffect } from "react";
import { getSocket } from "@/libs/socket";
import { selectAllMessages, setUserMessages } from "@/store/features/chat/chatSlice";

export default function ChatArea() {

    const { user: currentUser } = useSelector((state: RootState) => {
        return state.auth
    });

    const { activeChat} = useSelector((state: RootState) => {
        return state.chat
    });
    const dispatch = useDispatch();

    useEffect(() => {
        const socket = getSocket();

        socket?.on("messages_loaded", (pastMessages) => {
            dispatch(setUserMessages(pastMessages.messages));
        })

    }, []);

    const messages = useSelector(selectAllMessages);


    return (
        <div className="min-h-full  flex flex-col rounded-2xl">


            {/* chat header */}
            {activeChat && <div className="flex items-center justify-between p-4 border-b border-gray-700 z-10">
                <div className="flex items-center gap-3">
                    <Avatar
                        username={activeChat.username}
                        src={activeChat.avatarUrl}
                        isOnline={activeChat.isOnline}
                        size="md"
                    />
                    <div>
                        <h2 className="text-lg font-semibold text-white">{activeChat.username}</h2>
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
            </div>}

            {/* message list area */}
            <div className="flex-grow flex flex-col overflow-y-auto p-4 z-10 gap-3">
                {messages.map(message => (
                    <MessageBubble
                        key={message.id}
                        isSentByCurrentUser={message.sender.id === currentUser?.id}
                        message={message}
                        currentUserAvatar={currentUser?.avatarUrl!}
                        otherUserAvatar={activeChat && activeChat.avatarUrl}
                    />
                ))}
            </div>

            {/* message input field */}
            <div className="p-4 border-t border-gray-700 z-10">
                <MessageInput
                    otherUserId={activeChat!.userId}
                    convId={activeChat!.convId}
                    
                />
            </div>
        </div>
    )

}