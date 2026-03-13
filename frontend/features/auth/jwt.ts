import { jwtDecode } from "jwt-decode"
import type { JWTPayload } from "@/types/user"

export function getRoleFromToken(token: string): string | null {
    try {
        const decoded = jwtDecode<JWTPayload>(token)
        return decoded.role
    } catch {
        return null
    }
}
