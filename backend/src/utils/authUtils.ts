// authentication utilities
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from 'bcryptjs'; 
import dotenv from 'dotenv';

dotenv.config();

// Types for better TypeScript support
export interface JWTPayload {
  userId: number;
  email?: string;
}

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS!) || 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION  = process.env.JWT_EXPIRATION as  SignOptions['expiresIn'] || '1d';

// Validate JWT_SECRET exists
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// JWT token configuration
export const generateToken = (payload :JWTPayload) => {
    
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXPIRATION });

}

export const verifyToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as JWTPayload
    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token has expired')
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid Token')
        }
        throw new Error('Token verification Error');      
    }
}

// password hashing 
export const hashPassword = async (password: string): Promise<string> => {
    
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    
};

export const comparePassword = async (password: string, hashedpassword: string): Promise<boolean> => {
    
    return await bcrypt.compare(password, hashedpassword)

};

// validation utility
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export const validatePassword = (password: string): boolean => {
    
    return password.length >= 6
    
};

export const validateUsername = (username: string): boolean => {

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};
