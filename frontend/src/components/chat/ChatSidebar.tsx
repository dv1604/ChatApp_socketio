"use client"
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import { useLogoutMutation } from "@/store/features/authentication/authApi";
import { clearCredentials } from "@/store/features/authentication/authSlice";
import { RootState } from "@/store/store";
import { ApiError } from "@/types/api";
import { useRouter } from "next/navigation";
import { HiOutlineLogout } from "react-icons/hi";
import { IoMdSearch } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";

export default function ChatSidebar() {

    const { user: currentUser } = useSelector((state: RootState) => {
        return state.auth
    });
    const dispatch = useDispatch();
    const router = useRouter();

    const [logout , {data,error}] = useLogoutMutation();

    const handleLogout = async() => {

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


    const dummyChats = [
        { id: 'conv1', name: 'John Doe', lastMessage: 'Hey there!', lastMessageAt: '2025-06-04T10:00:00Z', isOnline: true, avatarUrl: "https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        { id: 'conv2', name: 'Jane Smith', lastMessage: 'How are you?', lastMessageAt: '2025-06-03T15:30:00Z', isOnline: false, avatarUrl: "https://images.unsplash.com/photo-1521566652839-697aa473761a?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        { id: 'conv3', name: 'Team Alpha', lastMessage: 'Meeting at 3 PM', lastMessageAt: '2025-06-02T09:00:00Z', isOnline: true, avatarUrl: null }, // Example of a placeholder for future groups
    ];

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
                        size="md" />
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
            <div className="mb-4 z-10">
                <Input
                    placeholder="Search chats or users..."
                    icon={IoMdSearch}
                    additionalClass="bg-[var(--background-dark)]/50 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-[#42a5f5] focus:ring-[#42a5f5]/20"
                />
            </div>

            {/* chat list area */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 z-10">
                {dummyChats.map(chat => (
                    <div
                        key={chat.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background-dark)]/50 hover:bg-[#252540] transition-colors cursor-pointer group relative overflow-hidden">
                        {/* gradient border */}
                        <div className="absolute inset-0 border border-transparent group-hover:border-[#6a5acd] rounded-xl transition-all duration-200 pointer-events-none"></div>
                        <Avatar
                            username={chat.name}
                            src={chat.avatarUrl}
                            isOnline={chat.isOnline}
                            size="md"
                        />

                        <div className="flex-grow">
                            <p className="font-medium text-white">{chat.name}</p>
                            <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                            {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                    </div>
                ))}
                {dummyChats.length === 0 && (
                    <p className="text-gray-500 text-center mt-10">No chats yet.</p>
                )}
            </div>

        </div>
    )
}