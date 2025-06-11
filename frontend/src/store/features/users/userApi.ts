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
        })
    })
});

export const { useGetAllUsersQuery } = userApi;
export default userApi.reducer;