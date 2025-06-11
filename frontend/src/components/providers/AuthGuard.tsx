"use client"
import { connectSocket } from "@/libs/socket";
import { RootState } from "@/store/store";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function AuthGuard({
    children
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated , token } = useSelector((state: RootState) => {
        return state.auth
    });
    const router = useRouter();
    const pathname = usePathname();
    const [isHydrated, setIsHydrated] = useState(false); // Start with false
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Redux persist rehydration timeout
        const timer = setTimeout(() => {
            setIsHydrated(true);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            // Define public routes that don't need authentication
            const publicRoutes = ['/login', '/register', '/'];
            
            if (!isAuthenticated && pathname === '/chat') {
                router.replace('/login');
                setIsAuthorized(false);
            } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
                router.replace('/chat');

                setIsAuthorized(false);
            } else if (!isAuthenticated && publicRoutes.includes(pathname)) {
                // User is on public route and not authenticated - allow
                setIsAuthorized(true);
            } else if (isAuthenticated && !publicRoutes.includes(pathname)) {
                // User is authenticated and on protected route - allow
                setIsAuthorized(true);
            } else if (!isAuthenticated && !publicRoutes.includes(pathname)) {
                // User is not authenticated and on protected route - redirect
                router.replace('/login');
                setIsAuthorized(false);
            } else {
                // Default case - allow
                setIsAuthorized(true);
            }
        }
    }, [isAuthenticated, isHydrated, pathname, router]);

    

    // Show loading while hydrating or while redirecting
    if (!isHydrated || !isAuthorized) {
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