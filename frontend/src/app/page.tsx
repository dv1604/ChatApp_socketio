'use client'
import { RootState } from "@/store/store"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5"
import { useSelector } from "react-redux"

export default function Home() {

    const { isAuthenticated } = useSelector((state: RootState) => {
        return state.auth
    });

    const router = useRouter();
    const [route,setRoute] = useState('/');

    useEffect(() => {

        if (isAuthenticated) {
            setRoute('/chat')
        } else {
            setRoute('/login')
        }

    }, [isAuthenticated])


    return (
        <div className="flex justify-center items-center min-h-screen">
            <div
                className="rounded-full flex justify-center items-center shadow-[0px_10px_30px_rgba(0,0,0,0.3),_0px_5px_15px_rgba(0,0,0,0.2)] w-36 h-36 bg-gradient-to-r from-purple-700 to-blue-500 transition-transform hover:scale-110 ease-in-out duration-300
                hover:cursor-pointer "

                onClick={() => router.replace(route)}
            >
                <IoChatbubbleEllipsesOutline className="text-gray-100 h-24 w-24 " />
            </div>
        </div>
    )
}