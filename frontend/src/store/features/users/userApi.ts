import { RootState } from "@/store/store";
import { UsersApiResponse } from "@/types/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/users",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    }
})

export const userApi = createApi({
    reducerPath: "users",
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        getAllUsers: builder.query<UsersApiResponse, void>({
            query: () => ({
                url: '/',
                method: 'GET',
            })
        }),
        
        searchUsers: builder.query<UsersApiResponse, string>({
            query: (searchTerm) => ({
                url: `/search?q=${encodeURIComponent(searchTerm)}`,
                method: 'GET',
            }),
            // Fallback to frontend search if backend endpoint doesn't exist
            async queryFn(searchTerm, api, extraOptions, baseQuery) {
                try {
                    return await baseQuery(`/search?q=${encodeURIComponent(searchTerm)}`);
                } catch (error) {
                    // If search endpoint doesn't exist, fall back to getting all users
                    console.log("Search endpoint not available, using frontend search");
                    const allUsersResult = await baseQuery('/');
                    if (allUsersResult.data) {
                        const allUsers = allUsersResult.data as UsersApiResponse;
                        const filteredUsers = allUsers.users.filter(user => 
                            user.username.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        return { data: { ...allUsers, users: filteredUsers } };
                    }
                    return { error: { status: 404, data: 'Search not available' } };
                }
            }
        })
    })
});

export const { useGetAllUsersQuery, useSearchUsersQuery } = userApi;
export default userApi.reducer;