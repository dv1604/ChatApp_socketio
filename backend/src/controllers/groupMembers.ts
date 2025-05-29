import { GroupMemberRole } from '@prisma/client';
import prisma from '../config/database';
import { removeActiveUser } from './../socket/utils/activeUsers';
import { Request, Response } from "express";

// add user to a group
export const addGroupMember = async (req: Request, res: Response) => {

    try {

        const groupId = parseInt(req.params.id);
        const { userId: userToAddId } = req.body;

        if (isNaN(groupId) || isNaN(userToAddId)) {
            res.status(400).json({
                error: 'Inavliad group ID or user ID format.'
            });
            return;
        }

        if (!req.userId) {
            res.status(401).json({
                error: 'Authenticated user ID not found.'
            });
            return;
        }

        // check if authenticated user has permission to add ie they are admin/owner
        const requestingUserMembership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: req.userId,
                    groupId: groupId,
                }
            },
            select: {
                role: true
            }
        });

        if (!requestingUserMembership || (requestingUserMembership.role !== GroupMemberRole.OWNER && requestingUserMembership.role !== GroupMemberRole.ADMIN)) {
            res.status(403).json({
                error: 'Access denied. Only group owners or admins can add members'
            });
            return;
        }

        // check if user exits
        const userExists = await prisma.user.findUnique({
            where: {
                id: userToAddId
            }
        });

        if (!userExists) {
            res.status(404).json({
                error: 'User to add not found.'
            });
            return;
        };

        // check if user is not a member already
        const existingMembership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userToAddId,
                    groupId: groupId
                }
            }
        })

        if (existingMembership) {
            res.status(409).json({
                error: 'User is already a member of this group'
            });
            return;
        };

        // if not exist then add new member
        const newMember = await prisma.groupMember.create({
            data: {
                groupId: groupId,
                role: GroupMemberRole.MEMBER,
                userId: userToAddId
            },
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } }
            }
        });

        res.status(201).json({
            message: 'User added to group successfully',
            member: newMember
        });

    } catch (error) {

        console.error('Error adding member to group: ', error);
        res.status(500).json({
            error: 'Internal server error adding member.'
        })
    }
};

// remove user from a group
export const removeMember = async (req: Request, res: Response) => {
    
    try {
        
        const groupId = parseInt(req.params.id);
        const userToRemoveId = parseInt(req.params.userId);

        if (isNaN(groupId) || isNaN(userToRemoveId)) {
            res.status(400).json({
                error : 'Invalid group ID or user ID format'
            });
            return;
        };

        if (!req.userId) {
            res.status(401).json({
                error: 'Authenticated userID not found.'
            });
            return;
        };

        // check if authenticated user has rights to remove user
        const requestingUserMembership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: req.userId,
                    groupId: groupId
                }
            },
            select: {
                role: true
            }
        });

        // if authenticated one is the one to remove
        const isSelfRemoval = req.userId === userToRemoveId;
        const isAuthorizationAdmin = requestingUserMembership && (requestingUserMembership.role === GroupMemberRole.ADMIN || requestingUserMembership.role === GroupMemberRole.OWNER);

        if (!isSelfRemoval && !isAuthorizationAdmin) {
            res.status(403).json({
                error: 'Access denied: You can only remove yourself or if you are admin/owner'
            });
            return;
        }

        // if they are the last admin ask them to assign admin first
        if (isSelfRemoval && requestingUserMembership?.role === GroupMemberRole.OWNER) {
            const ownerCount = await prisma.groupMember.count({
                where: {
                    groupId: groupId,
                    role: GroupMemberRole.OWNER
                }
            });
            if (ownerCount <= 1) {
                res.status(400).json({
                    error: 'Cannot remove yourself as the last owner of the group. Assign a new owner first.'
                });
                return;
            }
        }

        // remove member
        const deleteMember = await prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId: userToRemoveId,
                    groupId: groupId
                }
            }
        });

        res.status(200).json({
            message: 'User removed from the group successfully',
            member: deleteMember
        });
    } catch (error) {
        
        console.error('Error removing member from group:', error);
        res.status(500).json({
            error: 'Internal server error removing member.'
        });  
    }
}