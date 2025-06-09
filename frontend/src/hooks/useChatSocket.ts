import { connectSocket, disconnectSocket, getSocket } from "@/libs/socket";
import { addMessage } from "@/store/features/chat/chatSlice";
import { RootState } from "@/store/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"

export const useChatSocket = (token: string) => {
    
    const dispatch = useDispatch();
    const activeChat = useSelector((state: RootState) => {
        state.chat.activeChat
    });

    useEffect(() => {
        if (!token) return;

        connectSocket(token);

        const socket = getSocket();
        if (!socket) return;

        socket.on("private_message", (msg) => {
            dispatch(addMessage(msg));
        });

        return () => {
            socket.off("private_message");
            disconnectSocket();
        };
    }, [token, dispatch]);

}