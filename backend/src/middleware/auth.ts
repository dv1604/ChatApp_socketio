import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/authUtils";
import prisma from "../config/database";
import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: { // User data that is selected from Prisma
                id: number;
                username: string;
                email: string;
                avatarUrl: string | null;
                isOnline: boolean;
                lastSeen: Date;
            } | null;

            userId?: number; // Convenience property for the user's ID
        }
    }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            res.status(401).json({ error: 'Authentication required: No token provided or invalid format' });
            return;
        }
        const token = authHeader?.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Authentication required: Token missing after "Bearer".' });
            return;
        }

        const decoded : JwtPayload = verifyToken(token as string);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                isOnline: true,
                lastSeen: true
            }
        });

        if (!user) {
            res.status(404).json({ error: 'Authentication failed: User not found or invalid token.' });
            return;
        }

        req.user = user;
        req.userId = user?.id;
        next();
        
    } catch (error) {

        console.error('Authentication Error :', error);
        res.status(401).json({ error: 'Unauthorized Access' });

    }
}