"use client"
import { RootState } from "@/store/store";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function AuthGuard({
    children
}: {
    children: React.ReactNode;
}) {

    const { isAuthenticated } = useSelector((state: RootState) => {
        return state.auth
    });
    const router = useRouter();
    const pathname = usePathname();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
       
        // redux persist rehydration timeout
        const timer = setTimeout(() => {
            setIsHydrated(true);
        }, 100);

        return () => clearTimeout(timer);

    }, []);

    useEffect(() => {

        if (isHydrated) {

            if (!isAuthenticated && pathname === '/chat') {
                router.replace('/login');
            } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
                router.replace('/chat');
            }
        }
    }, [isAuthenticated, isHydrated, pathname, router]);

    if (!isHydrated) {
        
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <>
            {children}
        </>
    )


}