import clsx from "clsx";
import { IconType } from "react-icons";


export default function Input({
    label, type, placeholder, icon: Icon, disabled, value, onChange, name
}: {
    label: string,
    type: string,
    placeholder: string,
    icon?: IconType,
    disabled: boolean,
    value: string,
    name: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {

    const inputStyle = clsx({
        // default styling
        "block w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-200 bg-background-dark/50 text-gray-100 placeholder-gray-400 border-gray-700 pl-10": true,
        // disabled styling
        "bg-gray-700/30 text-gray-500 cursor-not-allowed border-gray-700": disabled
    });

    return (
        <div className="w-full" >
            <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {Icon && <Icon className="w-5 h-5 text-gray-400" />}
                </div>
                <input
                    type={type}
                    disabled={disabled}
                    className={inputStyle}
                    placeholder={placeholder}
                    value={value}
                    name={name}
                    onChange={onChange}
                />
            </div>
        </div>
    )
}