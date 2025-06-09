import clsx from "clsx";
import React from "react";

export default function Button({
    type = "button", 
    children, 
    disabled, 
    isLoading, 
    additionalClass,
    fullWidth = true // Add this prop with default true
}: {
    type: "submit" | "reset" | "button",
    children: React.ReactNode,
    disabled: boolean,
    isLoading?: boolean,
    additionalClass?: string,
    fullWidth?: boolean // Add this to the type definition
}) {

    const buttonStyle = clsx(
        "py-3 px-4 bg-gradient-to-r from-purple-700 to-blue-500 font-semibold text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 cursor-pointer outline-none relative h-10 text-sm flex items-center justify-center",
        {
            "w-full": fullWidth, 
            "disabled:opacity-50 disabled:cursor-not-allowed": disabled,
            "cursor-wait flex items-center justify-center gap-4": isLoading
        },
        additionalClass
    );

    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            className={buttonStyle}
        >
            {isLoading && (
                <div className="h-4 w-4 bg-transparent rounded-full border-[3px] border-gray-200 border-t-[3px] border-t-gray-500 animate-spin">
                </div>
            )}
            {children}
        </button>
    )
}