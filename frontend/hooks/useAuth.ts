import { useState } from "react"
import { loginUser, registerUser } from "@/features/auth/api"
import { AuthService } from "@/features/auth/service"
import type { User } from "@/types/user"

export function useAuth() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const login = async (email: string, password: string): Promise<User | null> => {
        try {
            setLoading(true)
            setError(null)

            const tokenData = await loginUser(email, password)
            const user = await AuthService.handleLoginSuccess(tokenData.access_token)

            return user
        } catch (err: any) {
            setError(err.message || "Failed to log in")
            return null
        } finally {
            setLoading(false)
        }
    }

    const register = async (data: any) => {
        try {
            setLoading(true)
            setError(null)
            await registerUser(data)
            return true
        } catch (err: any) {
            setError(err.message || "Failed to register")
            return false
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        AuthService.handleLogout()
    }

    return {
        login,
        register,
        logout,
        loading,
        error
    }
}
