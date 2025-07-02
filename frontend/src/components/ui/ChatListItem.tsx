import { useDispatch } from "react-redux";
import Avatar from "./Avatar";
import { setActiveChat, setChatLoader } from "@/store/features/chat/chatSlice";
import { UserConversations } from "@/types/socketEvents";
import { getSocket } from "@/libs/socket";

export default function ChatListItem({
    conversationInfo
}: {
   conversationInfo : UserConversations

}) {

    const { avatarUrl, isOnline, username , id : userId} = conversationInfo.otherUser;
    const lastMessage = conversationInfo.lastMessage
    const dispatch = useDispatch();

    const handleClick = () => {

        const socket = getSocket();
        
        dispatch(setActiveChat({
            currentUserRole : 'user',
            activeChat: {
                userId: parseInt(userId),
            avatarUrl,
            isOnline,
            convId: conversationInfo.id,
            username
            }
            
        }));

        socket?.emit('get_messages', { conversationId: conversationInfo.id });
        dispatch(setChatLoader(true));

    }

    return (
        <div
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background-dark)]/50 hover:bg-[#252540] transition-colors cursor-pointer group relative overflow-hidden"
            onClick={handleClick}
        >
            {/* gradient border */}
            <div className="absolute inset-0 border border-transparent group-hover:border-[#6a5acd] rounded-xl transition-all duration-200 pointer-events-none"></div>
            <Avatar
                username={username}
                src={avatarUrl}
                isOnline={isOnline}
                size="md"
                role="user"
            />

            <div className="flex-grow">
                <p className="font-medium text-white">{username}</p>
                <p className="text-sm text-gray-400 truncate">{lastMessage.content.slice(0,22)}</p>
            </div>
            <span className="text-xs text-gray-500 uppercase">
                {lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
        </div>
    )
}