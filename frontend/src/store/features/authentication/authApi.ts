import { RootState } from "@/store/store";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearCredentials } from "./authSlice";
import { UserDisplayInfo } from "@/types";

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/auth',
    prepareHeaders: (headers, { getState }) => {
        // access token from redux store
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    }
});

// wrapper to handle baseQuery for 401 unauthorized status
const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        console.warn('AUthentication error : Token expired or invalid . Logging out...');

        api.dispatch(clearCredentials());
    }
    return result;
}


export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Auth"],
    endpoints: (builder) => ({
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (registerData) => ({
                url: '/register',
                method: 'POST',
                body: registerData
            }),
            invalidatesTags: ["Auth"]
        }),

        //login API 
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (loginData) => ({
                url: '/login',
                method: 'POST',
                body: loginData
            }),
            invalidatesTags: ["Auth"]
        }),

        // logout API
        logout: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/logout',
                method: 'PATCH'
            })
        }),

        // get logged in users details
        getCurrentUser: builder.query<UserDisplayInfo, void>({
            query: () => ({
                url: '/me',
                method: 'GET'
            })
        }),

        verifyToken: builder.query<{ verified: boolean }, string>({
            query: (token) => {

                const params = new URLSearchParams();

                if (token) params.append('token', token);

                return {
                    url: `/verify?${params.toString()}`,
                    method: 'GET'
                }
            },
            providesTags: ["Auth"]
        })
    })
})

export const { useLoginMutation, useLogoutMutation, useRegisterMutation, useGetCurrentUserQuery, useLazyVerifyTokenQuery } = authApi;

export default authApi.reducer;