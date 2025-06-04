'use client'
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLoginMutation } from "@/store/features/authentication/authApi";
import { RootState } from "@/store/store";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { MdAlternateEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { useSelector } from "react-redux";
import { ApiError } from "@/types/api";

export default function Login() {

    const { isLoading } = useSelector((state: RootState) => {
        return state.auth
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [apiError, setApiError] = useState('');
    const [login, { data, error }] = useLoginMutation();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value)
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError('');

        try {

            const response = await login({ email, password }).unwrap();
            console.log('Login Response: ', response);

        } catch (err) {
            console.log('Login Error : ', err);

            if (err && typeof err === "object" && 'data' in err) {
                const errorData = err as ApiError;
                if (errorData?.data.error) {
                    setApiError(errorData?.data.error);
                }
            }
        }

    }


    return (
        <>
            <div className='min-h-screen flex justify-center items-center bg-gradient-to-br from-[var(--background-dark)] to-[var(--primary-dark)]/80 px-4'>
                <div className="max-w-ms w-[60%] relative flex flex-col items-center justify-center">
                    {/* chat app floating element */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-10 mb-3">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-transform ease-out duration-300 hover:scale-105 shadow-[0px_10px_30px_rgba(0,0,0,0.3),_0px_5px_15px_rgba(0,0,0,0.2)]">
                            <IoChatbubbleEllipsesOutline
                                className="text-white w-12 h-12" />
                        </div>
                    </div>

                    {/* login form card*/}
                    <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-2xl shadow-[0 4px 30px rgba(0, 0, 0, 0.4)] p-8 md:p-10 border border-white/30 relative overflow-hidden lg:w-1/2 md:w-[80%]">
                        <div className="absolute inset-0 glass-gradient"></div>
                        <h1 className="text-3xl font-bold text-white text-center mb-2 nt-8">Welcome Back</h1>
                        <p className="text-gray-400 text-center mb-8">Sign in to continue chatting</p>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input
                                label="email"
                                type="email"
                                name="email"
                                placeholder="Enter you email address"
                                disabled={false}
                                icon={MdAlternateEmail}
                                value={email}
                                onChange={(handleChange)}
                            />

                            <Input
                                label="password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                icon={TbLockPassword}
                                disabled={false}
                                value={password}
                                onChange={handleChange}
                            />

                            {apiError && (
                                <div className="rounded-lg p-4 text-sm  bg-red-900/30 border-red-700 text-red-200">
                                    <div className="flex items-center">
                                        <span>{apiError}</span>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={false} >
                                Sign In
                            </Button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href="/register"
                                    className="font-medium text-blue-400 hover:underline transition-all duration-200 cursor-pointer relative"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}