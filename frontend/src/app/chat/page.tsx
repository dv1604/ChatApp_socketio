"use client"
import ChatArea from "@/components/chat/ChatArea";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { connectSocket, getSocket } from "@/libs/socket";
import { setIntitalChatData } from "@/store/features/chat/chatSlice";
import { RootState } from "@/store/store";
import clsx from "clsx";
import { useEffect } from "react";
import { BsChatDotsFill } from "react-icons/bs";
import { IoChatbubbleEllipses, IoChatbubbleEllipsesOutline, IoChatbubbles } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";

export default function Chat() {

    const { token } = useSelector((state: RootState) => {
        return state.auth
    });

    const { activeChat } = useSelector((state: RootState) => {
        return state.chat
    });

    const dispatch = useDispatch();

    useEffect(() => {

        if (token) {
            connectSocket(token);

            const currentSocket = getSocket();

            currentSocket?.on('connect', () => {
                console.log('Connected to socket ID', currentSocket.id);
            });

            currentSocket?.on('conversations_list', (conversations) => {
                console.log("Users past conversations list:", conversations);
                dispatch(setIntitalChatData(conversations));
            })

        }

    }, [token])

    return (

        <div className="flex h-screen w-full  p-4 gap-4">
            {/* chat sidebar */}
            <ChatSidebar />

            <div className={clsx(" bg-[#1a1a2e]/80 backdrop-blur-md rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] flex-grow ",
                { "flex justify-center items-center text-3xl": !activeChat }
            )
            }>

                <div className="absolute inset-0 glass-gradient pointer-events-none rounded-2xl"></div>

                {/* messaging area */}
                {activeChat ? <ChatArea />
                    : (
                        <div className="flex flex-col items-center gap-3 ">
                            <BsChatDotsFill
                                className="text-gray-400 h-24 w-24 " />
                            <p className="text-gray-400 flex  inset-0 ">Start Chatting...</p>
                        </div>
                    )}
            </div>
        </div>
    )
}