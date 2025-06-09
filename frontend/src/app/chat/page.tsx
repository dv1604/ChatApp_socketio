import ChatArea from "@/components/chat/ChatArea";
import ChatSidebar from "@/components/chat/ChatSidebar";

export default function Chat() {

        return (

        <div className="flex h-screen w-full  p-4 gap-4">
            {/* chat sidebar */}
            <ChatSidebar />

            {/* messaging area */}
            <ChatArea />
        </div>
    )
}