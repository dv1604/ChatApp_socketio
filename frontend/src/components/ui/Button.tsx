import clsx from "clsx";
import React from "react";

export default function Button({
    type = "button",children, disabled
}: {
    type: "submit" | "reset" | "button",
    children: React.ReactNode,
    disabled: boolean
}) {

    const buttonStyle = clsx({
        "w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white  rounded-lg hover:from-blue-500 hover:to-purple-700  transition-all duration-200 cursor-pointer outline-none relative ": true,
        "disabled:opacity-50 disabled:cursor-not-allowed": disabled
    });

    return (

        <button
            type={type}
            disabled={disabled}
            className={buttonStyle}
        >
            {children}
        </button>
    )
}