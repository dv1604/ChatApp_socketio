import { Request, Response } from "express";
import { comparePassword, generateToken, hashPassword, validateEmail, validatePassword, validateUsername } from "../utils/authUtils";
import prisma from "../config/database";

export const createNewUser = async (req: Request, res: Response) => {

    try {

        const { username, email, password } = req.body;

        // validate input
        if (!validateUsername(username)) {
            res.status(400).json({
                error: 'Username must be 3-20 characters, alphanumeric'
            });
            return;
        }
        if (!validateEmail(email)) {
            res.status(400).json({
                error: "INvalid email format"
            });
            return;
        }
        if (!validatePassword(password)) {
            res.status(400).json({
                error: "Password must be at least 6 characters long"
            });
            return;
        }

        // cheeck if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username'
            res.status(400).json({
                error: `User with this ${field} already exists`
            });
            return;
        }

        // if all validation pass, create new user
        // hash password
        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                createdAt: true
            }
        });

        const token = generateToken({ userId: newUser.id, email: newUser.email });

        res.status(201).json({
            user: newUser,
            token
        })

    } catch (error) {
        console.error('Registration error', error);
        res.status(500).json({
            error: 'Internal server error during registration'
        });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                error: 'Email and password are required'
            })
            return;
        };

        // find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(404).json({
                error: 'User not found with this email'
            });
            return;
        };

        const isValidPassword = await comparePassword(password, user.passwordHash);

        if (!isValidPassword) {
            res.status(401).json({
                error: 'Invalid Password'
            });
            return;
        };

        // update user online status
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isOnline: true,
                lastSeen: new Date()
            }
        });

        // generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        // send user data without password
        const { passwordHash, ...userWithoutPassword } = user

        res.status(200).json({
            user: userWithoutPassword,
            token
        });

    } catch (error) {

        console.error('Login error :', error);
        res.status(500).json({
            error: 'Internal server error during login'
        });
    }
};

// retrieve user profile
export const getUserProfile = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({
            error: 'User not authenticated'
        });
        return;
    }
    res.status(200).json({
        user: req.user
    });
};

// logout user
export const logoutUser = async (req: Request, res: Response) => {
    try {

        if (!req.userId) {
            res.status(400).json({
                error: 'User ID not available for logout'
            });
            return;
        }

        await prisma.user.update({
            where: { id: req.userId },
            data: {
                isOnline: false,
                lastSeen: new Date()
            }
        });

        res.status(200).json({
            message: 'User Logout Successfully'
        })

    } catch (error) {

        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Internal server error during logout'
        });
    }
}

