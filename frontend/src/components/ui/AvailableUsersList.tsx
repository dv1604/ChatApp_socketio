import { useGetAllUsersQuery } from "@/store/features/users/userApi";
import clsx from "clsx";
import Avatar from "./Avatar";
import { UserDisplayInfo } from "@/types";

export default function AvailableUsersList({
    additionalClass,
    onUserSelect,
    filteredUsers
}: {
    additionalClass?: string;
    onUserSelect: (user: UserDisplayInfo) => void;
    filteredUsers?: UserDisplayInfo[];
}) {

    const { data } = useGetAllUsersQuery();

    console.log(data);

    const containerStyling = clsx(
        "bg-gray-200 p-4 rounded-xl cursor-pointer hover:bg-gray-300/10 z-200",
        additionalClass
    )

    // Use filteredUsers if provided, otherwise use all users from API
    const usersList = filteredUsers || (data ? data.users : null);

    const handleMouseDown = (user: UserDisplayInfo) => {
        onUserSelect(user);
    };

    return (
        <div className={containerStyling}>
            {usersList && usersList.map((user, index) => (
                <div
                    key={index}
                    className="flex py-2 pr-0.5 pl-2 gap-3 items-center transition-colors duration-150 rounded-xl  hover:cursor-pointer hover:bg-black/10"
                    onMouseDown={() => handleMouseDown(user)}>
                    <Avatar
                        size="md"
                        username={user.username}
                        src={user.avatarUrl}
                        additionalClass="h-3 w-3"
                        role="user"
                    />
                    <span className="text-lg text-gray-300 font-semibold capitalize">{user.username}</span>
                    <div className={clsx(
                        "h-2.5 w-2.5 rounded-full",
                        {
                            "bg-gray-300 border-2 border-gray-500": !user.isOnline,
                            "bg-green-700 ": user.isOnline
                        }
                    )}></div>
                </div>
            ))}
        </div>
    )
}