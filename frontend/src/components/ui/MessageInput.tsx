"use client"
import { useEffect, useState } from "react"
import Button from "./Button";
import clsx from "clsx";
import { getSocket } from "@/libs/socket";
import { v4 as uuid4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { PrivateMessageInput} from "@/types/socketEvents";
import { addMessage } from "@/store/features/chat/chatSlice";
import { ConversationMessages } from "@/types/socketEvents";
import { RootState } from "@/store/store";

export default function MessageInput({
    otherUserId , convId
}: {
        otherUserId: number;
    convId : number
}) {
    const [messageContent, setMessageContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const socket = getSocket();

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (messageContent.trim() === '') return;
        if (!otherUserId) alert("Give recieverId");

        setIsLoading(true);
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

        setMessageContent('');
        setIsLoading(false);
    }

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
                        textarea.style.height = 'auto'; // Reset height
                        textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
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