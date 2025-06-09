import { isFulfilled, isPending, isRejected, Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import { toast, Id } from "react-toastify";
import { ApiError } from "@/types/api";

const pendingToasts: Record<string, Id> = {};

export const rtkMiddleware: Middleware = (store: MiddlewareAPI<AppDispatch>) => (next) => (action) => {

    if (isPending(action)) {
        const toastId = toast.loading('Loading...');
        console.log(toastId,action);
        pendingToasts[action.type] = toastId;
    };

    if (isFulfilled(action)) {
        // string manipulation for searching type
        const pendingActionType = action.type.replace('/fulfilled', '/pending');
        console.log(action,pendingActionType);
        const toastId = pendingToasts[pendingActionType];
        console.log(toastId)

        if (toastId) {
            toast.update(toastId, {
                render: 'Succes!!',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });

            delete pendingToasts[pendingActionType];
        }
    }

    if (isRejected(action)) {

        const pendingActionType = action.type.replace('/rejected', '/pending');
        console.log(action);
        const toastId = pendingToasts[pendingActionType];
        const Error = action.payload as ApiError;

        if (toastId) {
            toast.update(toastId, {
                render: Error.data.error,
                type: "error",
                isLoading: false,
                autoClose: 3000
            });

            delete pendingToasts[pendingActionType];
        }

    }

    return next(action);
}