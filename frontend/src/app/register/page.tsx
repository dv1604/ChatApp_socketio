'use client'
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { RootState } from "@/store/store";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { MdAlternateEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { ApiError } from "@/types/api";
import { FiUser } from "react-icons/fi";
import { useRegisterMutation } from "@/store/features/authentication/authApi";
import { setCredentials } from "@/store/features/authentication/authSlice";
import { useRouter } from "next/navigation";

export default function Register() {

    const { isLoading } = useSelector((state: RootState) => {
        return state.auth
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [apiError, setApiError] = useState('');
    const [register, { data, error }] = useRegisterMutation();
    const dispatch = useDispatch();
    const router = useRouter();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value)
        } else if (name === 'username') {
            setUsername(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError('');

        try {

            const response = await register({ email, password,username }).unwrap();
            console.log('Register Response: ', response);
            dispatch(setCredentials({ user: response.user, token: response.token }));
            router.replace('/chat')

        } catch (err) {
            console.log('Register Error : ', err);

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
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-10 mb-3">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-700 to-blue-500 rounded-full transition-transform ease-out duration-300 hover:scale-105 shadow-[0px_10px_30px_rgba(0,0,0,0.3),_0px_5px_15px_rgba(0,0,0,0.2)]">
                            <IoChatbubbleEllipsesOutline
                                className="text-white w-12 h-12" />
                        </div>
                    </div>

                    {/* login form card*/}
                    <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-2xl shadow-[0 4px 30px rgba(0, 0, 0, 0.4)] mt-7 p-8 md:p-10 border border-white/30 relative overflow-hidden lg:w-1/2 md:w-[80%]">
                        <div className="absolute inset-0 glass-gradient"></div>
                        <h1 className="text-3xl capitalize font-bold text-white text-center mb-2 nt-8">Create your account</h1>
                        <p className="text-gray-400 text-center mb-8">Sign up to start chatting in real-time</p>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input
                                label="username"
                                type="text"
                                name="username"
                                placeholder="Enter you username"
                                disabled={false}
                                icon={FiUser}
                                value={username}
                                onChange={(handleChange)}
                            />

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
                                Sign Up
                            </Button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="font-medium text-blue-400 hover:underline transition-all duration-200 cursor-pointer relative"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}