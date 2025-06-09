'use client'
import store, { persistor } from "@/store/store"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import LoadingSpinner from "../ui/LoadingSpinner"

export default function ReduxProvider({ children }: {
    children: React.ReactNode
}) {
    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingSpinner/>} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    )
}