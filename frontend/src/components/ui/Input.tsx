import { IconType } from "react-icons";

export default function Input({
    label, type, placeholder, icon: Icon
}: {
    label: string,
    type: string,
    placeholder: string,
    icon?: IconType
}) {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {Icon && <Icon className="w-5 h-5 text-gray-400" />}
                </div>
                <input 
                    type={type}
                    className="block w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm transition-all duration-200 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={placeholder}
                />
            </div>
        </div>
    )
}