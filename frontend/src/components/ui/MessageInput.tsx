"use client"
import { useState } from "react"
import Input from "./Input"
import Button from "./Button";
import clsx from "clsx";
import { resolve } from "path";

export default function MessageInput() {
    const [messageContent, setMessageContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async(e : React.FormEvent) => {
        e.preventDefault();
        if (messageContent.trim() === '') return;

        setIsLoading(true);
        console.log('Sending Message:', messageContent);
        await new Promise(resolve => setTimeout(resolve, 500));

        setMessageContent('');
        setIsLoading(false);
        console.log('Message Sent');
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