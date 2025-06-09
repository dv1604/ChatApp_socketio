import { RootState } from "@/store/store";
import { NextRequest, NextResponse } from "next/server";
import { useSelector } from "react-redux";

export function middleware(req: NextRequest) {

    const { isAuthenticated } = useSelector((state: RootState) => {
        return state.auth
    });

    console.log(isAuthenticated)


    if (!isAuthenticated) {

        return NextResponse.redirect(new URL('/login', req.url));

    } else if (isAuthenticated) {

        return NextResponse.redirect(new URL('/chat', req.url));
    };

    return NextResponse.next();
};

export const config = {
    matcher: ["/chat", '/login', '/register']
}