import { Socket } from "socket.io";
import { JWTPayload, verifyToken } from "../../utils/authUtils";
import prisma from "../../config/database";

// include custom properties for the socket object
export interface AuthenticatedSocket extends Socket{
    userId?: number;
    userData?: {
        id: number;
        username: string;
        email: string;
        avatarUrl: string | null;
        isOnline: boolean;
    };
}

export const authenticateSocket = async (socket : AuthenticatedSocket , next : (err? : Error) => void) => {
    try {

        // retrieve the token from the socket handshake
        const token = socket.handshake.auth.token;

        if (typeof token !== 'string' || !token) {
            return next(new Error('Authentication error : NO token provided or invalid format'));
        }

        // verify the token and get decoded payload
        const decoded: JWTPayload = verifyToken(token);

        // get user data from the database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                email: true,
                isOnline: true
            }
        });

        if (!user) {
            return next(new Error('Authentication error : User not found.'));
        }

        // attach user data to the socket object
        socket.userId = user.id;
        socket.userData = user;

        next()

    } catch (error) {
        
        console.error('Socket authentication error : ', error);
        const errorMessage = error instanceof Error && error.message
        next(new Error(errorMessage || 'Authentication Error : Invalid token'));        

    }
}