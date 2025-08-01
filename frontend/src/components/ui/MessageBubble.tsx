"use client"
import { Message } from "@/types";
import clsx from "clsx";
import Avatar from "./Avatar";
import { useState } from "react";
import { formatMessageTime } from "@/utils/formattedTime";
import { ConversationMessages } from "@/types/socketEvents";
import { getSocket } from "@/libs/socket";

export default function MessageBubble({
    message,
    isSentByCurrentUser,
    additionalClass,
    currentUserAvatar,
    otherUserAvatar
}: {
    message: ConversationMessages,
    isSentByCurrentUser: boolean,
    additionalClass?: string,
    currentUserAvatar: string | null,
    otherUserAvatar: string | null
}) {

    const [showTimestamp, setShowTimestamp] = useState(false);
    const senderAvatar = isSentByCurrentUser ? currentUserAvatar : otherUserAvatar;
    const senderUsername = message.sender.username;
    
    // Determine if this is an AI message
    const isAiMessage = message.sender.id === "ai" || message.sender.username === "Sage AI";
    const avatarRole = isAiMessage ? "chatbot" : "user";
    const socket = getSocket();

    

    return (
        <div className={clsx(
            "flex items-end gap-2 group mb-3.5 ",
            isSentByCurrentUser ? "justify-end" : "justify-start"
        )}
        >
            {!isSentByCurrentUser && (
                <Avatar
                    username={senderUsername}
                    src={senderAvatar}
                    size="sm"
                    additionalClass='flex-shrink-0'
                    role={avatarRole}
                />
            )}

            <div className={clsx(
                "flex flex-col max-w-[70%] px-4 py-2 rounded-xl relative shadow-[2px_4px_30px_rgba(0,0,0,0.3)]",
                isSentByCurrentUser ?
                    "bg-gradient-to-r from-purple-700 to-blue-500 text-white rounded-br-none"
                    : isAiMessage ?
                        "bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-bl-none"
                        : " bg-gray-700 text-gray-100 rounded-bl-none"
            )}
           
                onMouseEnter={() => setShowTimestamp(true)}
                onMouseLeave={() => setShowTimestamp(false)}
            >
                {/* for groups */}
                {/* {!isSentByCurrentUser && message.sender.username && (
                    <span className="text-xs font-semibold text-gray-300 mb-1">
                        {senderUsername}
                    </span>
                )} */}

                <p className="text-sm">
                    {message.content}
                </p>

                {showTimestamp && (
                    <span className={clsx(
                        "absolute text-xs text-gray-400 transition-opacity duration-200 -bottom-5",
                        isSentByCurrentUser ? "right-0" : "left-0",
                        "opacity-100"
                    )}>
                        {formatMessageTime(message.createdAt)}
                    </span>
                )}

            </div>

        </div>
    )

}