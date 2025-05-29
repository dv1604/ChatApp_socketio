import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../config/database";

export const getUsers = async (req: Request, res: Response) => {
    
    try {
        
        const { search, limit, offset } = req.query;
        const take = parseInt(limit as string) || 20;
        const skip = parseInt(offset as string) || 0;

        const whereClause: Prisma.UserWhereInput = {};

        // whereclause if search is given
        if (search && typeof search === 'string') {
            whereClause.OR = [
                { username: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        // exclude current user from retrieve list
        if (req.userId) {
            whereClause.NOT = { id: req.userId };
        };

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                isOnline: true,
                lastSeen: true
            },
            take,
            skip,
            orderBy: { username: 'asc' }
        });

        // users count
        const totalUsers = await prisma.user.count({ where: whereClause });

        res.status(200).json({
            users,
            total: totalUsers,
            limit: take,
            offset: skip
        });
    } catch (error) {
        console.error('Error fetching users: ', error);
        res.status(500).json({ error: 'Internal server error fetching users' });
    }
};

// retrieve user details by their id
export const getUserById = async (req: Request, res: Response) => {

    try {
    
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            res.status(400).json({
                error: 'Invalid user ID format.'
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                isOnline: true,
                lastSeen: true,
                createdAt: true
            }
        });

        if (!user) {
            res.status(404).json({
                error: 'User not found'
            });
            return;
        }

        res.status(200).json(user);

    } catch (error) {
        

        console.error('Error fetching user by ID:', error);
        res.status(500).json({ error: 'Internal server error fetching user.' });       

    }
}