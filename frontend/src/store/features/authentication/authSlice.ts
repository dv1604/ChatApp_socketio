import { User, UserDisplayInfo } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "./authApi";

interface authState {
    user: Omit<User , 'passwordHash'> | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
};

const initialState: authState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: Omit<User , 'passwordHash'>, token: string }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },

        setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },

        setAuthError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        setAuthLoadingState: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        clearCredentials: (state) => {
            const isLoading = false;
            return { ...initialState, isLoading }
        }
    },
    // extraReducers: (builder) => {

    //     builder
    //         .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
    //             authSlice.caseReducers.setCredentials(state, {
    //                 payload: { user: action.payload.user as UserDisplayInfo, token: action.payload.token },
    //                 type: 'auth/setCredentials',
    //             });
    //         })
    //         .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
    //             authSlice.caseReducers.setCredentials(state, {
    //                 payload: { user: action.payload.user as UserDisplayInfo, token: action.payload.token },
    //                 type: 'auth/setCredentials',
    //             });
    //         });
    // }
});

export const { setIsAuthenticated, setCredentials, clearCredentials, setAuthLoadingState, setAuthError } = authSlice.actions;
export default authSlice.reducer;