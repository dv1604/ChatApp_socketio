"use client"
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import { useLogoutMutation } from "@/store/features/authentication/authApi";
import { clearCredentials } from "@/store/features/authentication/authSlice";
import { selectAllConversations } from "@/store/features/chat/chatSlice";
import { RootState } from "@/store/store";
import { ApiError } from "@/types/api";
import { useRouter } from "next/navigation";
import { HiOutlineLogout } from "react-icons/hi";
import { IoMdAddCircle, IoMdSearch } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import ChatListItem from "../ui/ChatListItem";
import { useState } from "react";
import AvailableUsersList from "../ui/AvailableUsersList";

export default function ChatSidebar() {

    const { user: currentUser } = useSelector((state: RootState) => {
        return state.auth
    });
    const conversations = useSelector(selectAllConversations);

    const dispatch = useDispatch();
    const router = useRouter();

    const [logout, { data, error }] = useLogoutMutation();
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

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
            <div className="mb-4 z-10 relative"
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}>
                <Input
                    placeholder="Search chats or users..."
                    icon={IoMdSearch}
                    additionalClass="bg-[var(--background-dark)]/50 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-[#42a5f5] focus:ring-[#42a5f5]/20"
                />
                {showSuggestions &&
                    <AvailableUsersList
                        additionalClass="absolute z-100 w-full "
                    />}
            </div>

            {/* chat list area */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-2  ">
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

            <div className="absolute bottom-2.5 right-2">
                <button className="p-2 relative rounded-full text-gray-400  hover:bg-black/10 transition-colors cursor-pointer z-10">
                    <IoMdAddCircle className="h-10 w-10 cursor-pointer  shadow-[0px_10px_30px_rgba(0,0,0,0.3),_0px_5px_15px_rgba(0,0,0,0.2)] rounded-full" />
                </button>
            </div>

        </div>
    )
}