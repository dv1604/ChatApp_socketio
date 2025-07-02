"use client"
import { connectSocket } from "@/libs/socket";
import { useLazyVerifyTokenQuery } from "@/store/features/authentication/authApi";
import { RootState } from "@/store/store";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function AuthGuard({
    children
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const pathname = usePathname();
    
    const [isHydrated, setIsHydrated] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null); // null = not checked yet
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [verifyToken, { isLoading }] = useLazyVerifyTokenQuery();

    // Public routes that don't need authentication
    const publicRoutes = ['/login', '/register', '/'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Handle Redux rehydration
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Token validation effect
    useEffect(() => {
        const tokenValidation = async (token: string) => {
            try {
                console.log("Validating token...");
                const response = await verifyToken(token).unwrap();
                
                if (response.verified) {
                    console.log("Token is valid");
                    setIsTokenValid(true);
                } else {
                    console.log("Token is invalid");
                    setIsTokenValid(false);
                    toast.error("Token is invalid or expired. Please login again");
                }
            } catch (error) {
                console.log("Error verifying token:", error);
                
                setIsTokenValid(false);
                if (error && typeof error === 'object' ) {
                    
                    // Handle different error types
                    if ('data' in error) {
                        toast.error("Your session has expired. Please login again");
                    } else if ('status' in error && error?.status === 401) {
                        toast.error("Invalid token. Please login again");
                    } else {
                        toast.error("Authentication failed. Please try again");
                    }
                }
            }
        };

        if (isHydrated && isAuthenticated && token) {
            console.log("Starting token validation...");
            tokenValidation(token);
        } else if (isHydrated && !isAuthenticated) {
            // No token to validate
            setIsTokenValid(null);
        }
    }, [isHydrated, isAuthenticated, token, verifyToken]);

    // Authorization and routing logic
    useEffect(() => {
        if (!isHydrated) return;

        console.log("Auth state:", { isAuthenticated, isTokenValid, pathname, isPublicRoute });
        if (isPublicRoute) {
            if (isAuthenticated && isTokenValid === true) {
                // Authenticated user on login/register page - redirect to chat
                console.log("Redirecting authenticated user to chat");
                router.replace('/chat');
                setIsAuthorized(false);
            } else {
                // Allow access to public routes
                console.log("Allowing access to public route");
                setIsAuthorized(true);
            }
            return;
        }

        // Case 2: Protected routes
        if (!isAuthenticated) {
            // Not authenticated - redirect to login
            console.log("Not authenticated, redirecting to login");
            router.replace('/login');
            setIsAuthorized(false);
            return;
        }

        // Case 3: Authenticated user on protected route
        if (isAuthenticated) {
            if (isTokenValid === true) {
                // Token is valid - allow access
                console.log("Token valid, allowing access");
                setIsAuthorized(true);
            } else if (isTokenValid === false) {
                // Token is invalid - redirect to login
                console.log("Token invalid, redirecting to login");
                router.replace('/login');
                setIsAuthorized(false);
            } else {
                // Token validation in progress - show loading
                console.log("Token validation in progress");
                setIsAuthorized(false);
            }
        }
    }, [isAuthenticated, isTokenValid, isHydrated, pathname, isPublicRoute, router]);

    // Show loading while hydrating, validating token, or redirecting
    if (!isHydrated || isLoading || !isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">
                    {!isHydrated ? 'Loading...' : isLoading ? 'Validating...' : 'Redirecting...'}
                </span>
            </div>
        );
    }

    return <>{children}</>;
}