import { combineReducers, configureStore } from "@reduxjs/toolkit";
import chatReducer from './features/chat/chatSlice';
import authReducer from './features/authentication/authSlice';
import authApiReducer, { authApi } from './features/authentication/authApi';
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// persist configration
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth"]
}

const rootReducer = combineReducers({
    chat: chatReducer,
    auth: authReducer,
    [authApi.reducerPath] : authApiReducer
})

// wraps reduce to persist
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer, //persisted reducer instead of root to get values persisted
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }).concat(
        authApi.middleware
    )
})

// method for auto refetching of rtk query on default occasions
setupListeners(store.dispatch);

// creation of persist instance for persiste Gate
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;