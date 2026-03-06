import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value
    const role = request.cookies.get("user_role")?.value

    const { pathname } = request.nextUrl

    const publicRoutes = ["/login", "/register"]

    if (publicRoutes.includes(pathname)) {
        return NextResponse.next()
    }

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // Student trying to access teacher routes
    if (pathname.startsWith("/teacher") && role !== "teacher") {
        return NextResponse.redirect(new URL("/student", request.url))
    }

    // Teacher trying to access student routes
    if (pathname.startsWith("/student") && role !== "student") {
        return NextResponse.redirect(new URL("/teacher", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/student/:path*", "/teacher/:path*"],
}
