const API_URL = "http://127.0.0.1:8000"

export async function loginUser(email: string, password: string) {
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)

    const res = await fetch(`${API_URL}/auth/jwt/login`, {
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

export async function registerUser(data: any) {
    const res = await fetch(`${API_URL}/auth/register`, {
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
