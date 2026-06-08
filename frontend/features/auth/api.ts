import { API_BASE_URL } from "@/config/api"

export async function loginUser(email: string, password: string) {
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)

    const res = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
    })

    if (!res.ok) {
        throw new Error("Invalid credentials")
    }

    return res.json()
}

export type RegisterPayload = {
    email: string
    password: string
    name?: string
    role: string
    university?: string
    department?: string
    semester?: string
}

export async function registerUser(data: RegisterPayload) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        throw new Error("Registration failed")
    }

    return res.json()
}

export async function getCurrentUser(token: string) {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!res.ok) {
        throw new Error("Failed to fetch user profile")
    }

    return res.json()
}
