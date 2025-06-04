import Input from "@/components/ui/Input";
import Link from "next/link";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { MdAlternateEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";

export default function Login() {
    return (
        <>
            <div className='min-h-screen flex justify-center items-center bg-gradient-to-br from-[var(--background-dark)] to-[var(--primary-dark)]/80 px-4'>
                <div className="max-w-ms w-[60%] relative flex flex-col items-center justify-center">
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-10 mb-3">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-transform ease-out duration-300 hover:scale-105">
                            <IoChatbubbleEllipsesOutline
                                className="text-white w-12 h-12" />
                        </div>
                    </div>

                    {/* login form card*/}
                    <div className="bg-[#1a1a2e]/80 backdrop-blur-md rounded-2xl shadow-[0 4px 30px rgba(0, 0, 0, 0.4)] p-8 md:p-10 border border-white/30 relative overflow-hidden w-1/2">
                        <div className="absolute inset-0 glass-gradient"></div>
                        <h1 className="text-4xl font-bold text-white text-center mb-2 nt-8">Welcome Back</h1>
                        <p className="text-gray-400 text-center mb-8">Sign in to continue chatting</p>

                        <form className="space-y-6">
                            <Input
                                label="email"
                                type="email"
                                placeholder="Enter you email address"
                                icon={MdAlternateEmail}
                            />

                            <Input
                                label="password"
                                type="password"
                                placeholder="Enter your password"
                                icon={TbLockPassword}
                            />

                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white  rounded-lg hover:from-blue-500 hover:to-purple-700  transition-all duration-200 cursor-pointer outline-none relative "
                            >
                                Sign In
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400">
                                Don&apos;t have an account?{' '}
                                <Link 
                                    href="/signup" 
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