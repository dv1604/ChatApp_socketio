import { useGetAllUsersQuery } from "@/store/features/users/userApi";
import clsx from "clsx";
import Avatar from "./Avatar";

export default function AvailableUsersList({
    additionalClass
}: {
        additionalClass?: string;
    }) {
    
    const { data } = useGetAllUsersQuery();
    
    console.log(data);
    
    const containerStyling = clsx(
        "bg-gray-200 p-4 rounded-xl",
        additionalClass
    )

    const usersList = data ? data.users : null;

    console.log(usersList)

    return (
        <div className={containerStyling}>
            {usersList && usersList.map((user, index) => (
                <div className="flex py-2 pr-0.5 pl-2 gap-2 items-center transition-colors duration-150 rounded-xl  hover:cursor-pointer hover:bg-black/10">
                    <Avatar
                        size="md"
                        username={user.username}
                        src={user.avatarUrl}
                        additionalClass="h-3 w-3"
                    />
                    <span className="text-lg font-semibold">{user.username}</span>
                    <div className={clsx(
                        "h-2.5 w-2.5 bg-green-700 rounded-full",
                        { "bg-none border border-gray-500" : !user.isOnline}
                )}></div>
                </div>
            ))}
        </div>
    )

}