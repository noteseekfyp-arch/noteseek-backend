import { getCurrentUser } from "@/features/auth/api"
import { saveToken, logout } from "@/features/auth/cookies"
import type { User } from "@/types/user"

export const AuthService = {
    async handleLoginSuccess(token: string) {
        // Fetch full profile info for role mapping
        const user: User = await getCurrentUser(token)

        // Save auth state
        saveToken(token, user.role)

        return user
    },

    handleLogout() {
        logout()
    }
}
