import { Request, Response } from "express";
import prisma from "../config/database";
import { GroupMemberRole } from "@prisma/client";

export const createGroup = async (req: Request, res: Response) => {
    
    try {
        
        const { name, description, isPrivate = false } = req.body;
        
        // group name is required
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            res.status(400).json({
                error: "Group name is required."
            });
        }

        if (!req.userId) {
            res.status(401).json({
                error: 'Authenticated user ID not found'
            });
            return;
        };

        // create group and make creator as OWNER
        const group = await prisma.group.create({
            data: {
                name: name.trim(),
                description,
                isPrivate,
                createById: req.userId,
                // make creator group member
                members: {
                    create: {
                        userId: req.userId,
                        role: GroupMemberRole.OWNER
                    },
                },
            },
            include: {
                members: {
                    select: {
                        userId: true,
                        role: true,
                        user: {
                            select: {
                                username: true
                            }
                        }
                    }
                },
                createdBy: {
                    select: {
                        username: true
                    }
                }
            }
        });

        res.status(201).json(group)

    } catch (error) {

        console.error('Error creating group :', error);
        res.status(500).json({
            error: 'Internal server error creating group'
        });
    }
};

// retrieve all groups that the authenticated user is member of
export const getUserGroups = async (req: Request, res: Response) => {
    
    try {

        if (!req.userId) {
            res.status(401).json({
                error: 'Authenticated user ID not found.'
            });
            return;
        }

        // get group members along with group
        // using group member model as only group table will only extract table where user is creator
        const groupMemberships = await prisma.groupMember.findMany({
            where: { id: req.userId },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        avatarUrl: true,
                        isPrivate: true,
                        createdAt: true,
                        createdBy: {
                            select: {
                                id: true,
                                username: true
                            }
                        },
                        messages: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                            include: {
                                sender: {
                                    select: {
                                        id: true,
                                        username: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                joinedAt: 'desc'
            }
        });

        // format the response
        const groups = groupMemberships.map(membership => {
            const lastMessage = membership.group.messages[0] || null;
            return {
                ...membership.group,
                lastMessage: lastMessage ? {
                    id: lastMessage.id,
                    content: lastMessage.content,
                    senderId: lastMessage.senderId,
                    senderUsername: lastMessage.sender.username,
                    createdAt: lastMessage.createdAt
                } : null,
                myRole: membership.role
            };
        });

        res.status(200).json(groups);
        
    } catch (error) {
        
        console.error('Error fetching user groups : ', error);
        res.status(500).json({
            error: 'Internal server error fetching groups'
        });
    }
};

// get particular group details
export const getGroupDetails = async (req: Request, res: Response) => {
    
    try {
    
        const groupId = parseInt(req.params.id);

        if (isNaN(groupId)) {
            res.status(400).json({
                error: 'Invalid group ID format.'
            });
            return;
        }

        if (!req.userId) {
            res.status(401).json({
                error: 'AUthenticated user ID not found'
            });
            return;
        };

        // find group and user demanding should be a member
        const group = await prisma.group.findUnique({
            where: {
                id: groupId
            },
            include: {
                members: {
                    select: {
                        userId: true,
                        role: true,
                        user: {
                            select: {
                                username : true
                            }
                        }
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 50,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                avatarUrl: true
                            }
                        }
                    }
                }
            }
        });

        if (!group) {
            res.status(404).json({
                error: 'Group not found'
            });
            return;
        }

        // check if user is member of the group
        const isMember = group.members.length > 0;
        if (!isMember) {
            res.status(403).json({
                error: 'Access denied. Not a member of this group'
            });
            return;
        };

        // after check remove member array
        const { members, ...groupWithoutMembers } = group;
        const myRole = members[0]?.role;

        res.status(200).json({ ...group, myRole })

    } catch (error) {
        
        console.error('Error fetching group details:', error);
        res.status(500).json({
            error: 'Internal server error fetching group details.'
        })
    }
};

