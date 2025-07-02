"use client"
import { RootState } from "@/store/store";
import clsx from "clsx"
import { useState } from "react";
import { PiHeadCircuit } from "react-icons/pi";
import { useSelector } from "react-redux";

export default function Avatar({
    isOnline, src, alt, username, additionalClass, size, role
}: {
    src?: string | null;
    isOnline?: boolean;
    alt?: string;
    username: string;
    additionalClass?: string,
    size: 'sm' | 'md';
    role: 'user' | 'chatbot'
}) {

    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { isChatbotActive, currentUserRole } = useSelector((state: RootState) => {
        return state.chat
    });

    const handleImageError = () => {
        setImageError(true);
    };

    const handleImageLoaded = () => {
        setImageLoaded(true);
    };

    const initials = (username ?? 'User').split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');

    const getAvatarColor = (username: string) => {
        const colors = [
            'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
            'bg-orange-500', 'bg-cyan-500',
        ];
        const index = (username ?? 'U').charCodeAt(0) % colors.length;
        return colors[index];
    }

    const initialColor = getAvatarColor(username);

    const showImage = src && !imageError && imageLoaded;
    const showPlaceholder = !src || imageError || !imageLoaded;

    const sizeConfig = {
        sm: {
            container: 'h-7 w-7',
            text: 'text-xs',
            online: 'h-2.5 w-2.5',
        },
        md: {
            container: 'h-10 w-10',
            text: 'text-sm',
            online: 'h-3 w-3',
        },
    };

    // Base classes without size, then default size, then additional classes for override
    const styling = clsx(
        "relative inline-flex items-center  justify-center rounded-full flex-shrink-0",
        sizeConfig[size].container,
        additionalClass,

    )

    return (
        <div className={styling}>

            {/* main avatar image */}
            {src && role === 'user' && (
                <img src={src}
                    alt={alt || username}
                    className={clsx("h-full w-full object-cover transition-opacity duration-200 rounded-full",
                        showImage ? "opacity-100" : "opacity-0"
                    )}
                    onError={handleImageError}
                    onLoad={handleImageLoaded}
                />
            )}

            {/* show initials if no avatar is given */}
            {showPlaceholder && role === 'user' && (
                <div className={`absolute inset-0 flex items-center justify-center text-white font-medium ${initialColor} ${sizeConfig[size].text} rounded-full`}>
                    {initials}
                </div>
            )}

            {/* if chatBot then show AI icon */}
            {role === 'chatbot' && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full p-1 h-10 w-10 bg-yellow-500/10 ">
                    <PiHeadCircuit className="h-8 w-8 text-amber-500 bg-yellow-500/10 rounded-full shadow-[0px_10px_30px_rgba(245,158,11,0.3),_0px_5px_20px_rgba(245,158,11,0.2)]" />
                </div>
            )}

            {/* online status */}
            {isOnline !== undefined && (
                <div className={clsx("absolute -bottom-[0.5px] -right-[0.5px] rounded-full border-2 border-white dark:border-gray-800 h-3 w-3",
                    isOnline ? "bg-green-500" : "bg-gray-400"
                )}>
                    {isOnline && (
                        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                    )}
                </div>
            )}
        </div>
    )
}