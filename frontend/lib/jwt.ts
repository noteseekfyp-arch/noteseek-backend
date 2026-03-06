import { jwtDecode } from "jwt-decode"

export interface JWTPayload {
    sub: string
    email: string
    role: string
}

export function getRoleFromToken(token: string): string | null {
    try {
        const decoded = jwtDecode<JWTPayload>(token)
        return decoded.role
    } catch {
        return null
    }
}
