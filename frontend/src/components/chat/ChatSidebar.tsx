"use client"
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import { useLogoutMutation } from "@/store/features/authentication/authApi";
import { clearCredentials } from "@/store/features/authentication/authSlice";
import { selectAllConversations, setActiveChat, setIntitalChatData, addConversation, setChatLoader, setChatbotStatus, clearAIHistory } from "@/store/features/chat/chatSlice";
import store, { RootState } from "@/store/store";
import { ApiError } from "@/types/api";
import { useRouter } from "next/navigation";
import { HiOutlineLogout } from "react-icons/hi";
import { IoMdSearch } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import ChatListItem from "../ui/ChatListItem";
import { useEffect, useState, useMemo, useRef } from "react";
import AvailableUsersList from "../ui/AvailableUsersList";
import { getSocket } from "@/libs/socket";
import { PiHeadCircuit } from "react-icons/pi";
import { UserConversations } from "@/types/socketEvents";
import { useGetAllUsersQuery } from "@/store/features/users/userApi";
import { UserDisplayInfo } from "@/types";

export default function ChatSidebar() {

    const { user: currentUser } = useSelector((state: RootState) => {
        return state.auth
    });

    const { isChatbotActive } = useSelector((state: RootState) => {
        return state.chat
    });
    const conversations = useSelector(selectAllConversations);

    const dispatch = useDispatch();
    const router = useRouter();

    const [logout, { data, error }] = useLogoutMutation();
    const [searchContent, setSearchContent] = useState<string>('');
    const [showUserDialog, setShowUserDialog] = useState<boolean>(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Get all users from database
    const { data: allUsers, isLoading: isLoadingUsers } = useGetAllUsersQuery();

    // Filter users based on search content and exclude current user
    const filteredUsers = useMemo(() => {
        if (!allUsers?.users) return [];
        
        return allUsers.users.filter(user => 
            user.id !== currentUser?.id && 
            (searchContent.trim() === '' || 
             user.username.toLowerCase().includes(searchContent.toLowerCase()))
        );
    }, [allUsers, searchContent, currentUser]);

    const handleLogout = async () => {
        try {
            const response = await logout().unwrap();
            console.log(response)
            dispatch(clearCredentials());
            router.replace('/login')
        } catch (err) {
            console.log("Logout Error:", error)
            if (err && typeof err === "object" && 'data' in err) {
                const errorData = err as ApiError;
                if (errorData.data.error) {
                    alert(errorData.data.error)
                }
            }
        }
    }

    // Handler for when user selects someone from the dialog
    const handleUserSelect = (user: UserDisplayInfo) => {
        const socket = getSocket();

        // Check if conversation already exists
        const existingConv = conversations.find(conv =>
            conv.otherUser.id === user.id
        );

        if (existingConv) {
            // If conversation exists, set it as active
            dispatch(setActiveChat({
                activeChat: {
                    userId: parseInt(existingConv.otherUser.id),
                    avatarUrl: existingConv.otherUser.avatarUrl,
                    isOnline: existingConv.otherUser.isOnline,
                    convId: existingConv.id,
                    username: existingConv.otherUser.username
                }
            }));
            socket?.emit('get_messages', { conversationId: existingConv.id });
            dispatch(setChatLoader(true));
        } else {
            // If no conversation exists, create new chat
            dispatch(setActiveChat({
                activeChat: {
                    userId: parseInt(user.id),
                    avatarUrl: user.avatarUrl,
                    isOnline: user.isOnline,
                    convId: 0, // temporary ID for new conversation
                    username: user.username
                }
            }));
            // Don't emit get_messages for new conversations since they don't exist yet
        }

        // Hide dialog and clear search
        setShowUserDialog(false);
        setSearchContent('');
    };

    // Handle search input focus
    const handleSearchFocus = () => {
        setShowUserDialog(true);
    };

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchContent(e.target.value);
    };

    // Close dialog if click outside
    useEffect(() => {
        if (!showUserDialog) return;
        function handleClickOutside(event: MouseEvent) {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                setShowUserDialog(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserDialog]);

    useEffect(() => {
        const socket = getSocket();

        if (socket) {
            // Handle conversations list
            socket?.on('conversations_list', (conversations) => {
                console.log("Users past conversations list:", conversations);
                dispatch(setIntitalChatData(conversations));
            });

            // Handle new conversation created
            socket?.on('conversation_created', (conversationData) => {
                console.log("New conversation created:", conversationData);
                dispatch(addConversation(conversationData));

                // If this conversation matches the current active chat, update the convId
                const activeChat = store.getState().chat.activeChat;
                if (activeChat && activeChat.convId === 0 &&
                    activeChat.userId === parseInt(conversationData.otherUser.id)) {
                    dispatch(setActiveChat({
                        activeChat: {
                            ...activeChat,
                           convId: conversationData.id
                        }
                    }));
                }
            });

            // Handle private messages
            socket?.on('private_message', (messageData) => {
                console.log("Received private message:", messageData);
                // The addMessage action will handle updating conversations and messages
            });
        };

        return () => {
            socket?.off("conversations_list");
            socket?.off("conversation_created");
            socket?.off("private_message");
        }

    }, [dispatch])

    return (
        <div className="flex flex-col w-1/3 max-w-xs bg-[#1a1a2e]/80 backdrop-blur-md rounded-2xl shadow-[2px_4px_30px_rgba(0,0,0,0.8)] border border-white/10 p-4 relative overflow-hidden ">
            {/* glass effect */}
            <div className="absolute inset-0 glass-gradient pointer-events-none"></div>
            {/* user profile header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-700 mb-4 z-10">
                {/* avatar and username */}
                <div className="flex items-center gap-3">
                    <Avatar
                        isOnline={currentUser?.isOnline}
                        src={currentUser?.avatarUrl}
                        username={currentUser?.username!}
                        size="md"
                        role="user"/>
                    <span className="text-lg font-semibold text-white">{currentUser?.username}</span>
                </div>
                {/* logout button */}
                <button className="p-2 relative rounded-full text-gray-400  hover:bg-black/20 transition-colors cursor-pointer "
                    onClick={handleLogout}
                >
                    <HiOutlineLogout className="h-6 w-6" />
                </button>
            </div>

            {/* search input */}
            <div className="mb-4 z-10 relative">
                <Input
                    placeholder="Search users..."
                    icon={IoMdSearch}
                    value={searchContent}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    additionalClass="bg-[var(--background-dark)]/50 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-[#42a5f5] focus:ring-[#42a5f5]/20"
                />
                {/* User Selection Dialog using AvailableUsersList */}
                {showUserDialog && (
                    <div
                        ref={dialogRef}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a2e]/95 backdrop-blur-md rounded-lg border border-gray-700 shadow-lg max-h-60 overflow-y-auto z-50"
                    >
                        {isLoadingUsers ? (
                            <div className="p-4 text-center text-gray-400">
                                <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent animate-spin mx-auto mb-2"></div>
                                Loading users...
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            <div className="py-2">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    All Users ({filteredUsers.length})
                                </div>
                                <AvailableUsersList
                                    additionalClass="bg-transparent p-0"
                                    onUserSelect={handleUserSelect}
                                    filteredUsers={filteredUsers}
                                />
                            </div>
                        ) : (
                            <div className="p-4 text-center text-gray-400">
                                {searchContent.trim() ? 'No users found' : 'No users available'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* chat list area */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                {conversations?.map(conv => {
                    return (
                        <ChatListItem
                            key={conv.id}
                            conversationInfo={conv}
                        />
                    )
                })}
                
                {conversations.length === 0 && (
                    <p className="text-gray-500 text-center mt-10">No chats yet.</p>
                )}
            </div>

            <div className="absolute bottom-2.5 right-2"
                onClick={() => {
                    // Clear AI conversation history when starting new AI chat
                    dispatch(clearAIHistory());
                    
                    dispatch(setActiveChat({
                        currentUserRole: 'chatbot',
                        activeChat: {
                            userId: 150,
                            convId: 150,
                            avatarUrl: null,
                            isOnline: true,
                            username: "Sage AI"
                        }
                    }))
                    dispatch(setChatbotStatus(true))
                }}
            >
                <button className="p-2 relative rounded-full  text-amber-500  hover:bg-yellow-500/10 transition-colors cursor-pointer z-10 ">
                    <PiHeadCircuit className="h-8 w-8 cursor-pointer bg-yellow-500/10   shadow-[0px_10px_30px_rgba(245,158,11,0.3),_0px_5px_20px_rgba(245,158,11,0.2)] rounded-full" />
                </button>
            </div>
        </div>
    )
}