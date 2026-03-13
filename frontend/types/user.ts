export interface User {
    id: string
    email: string
    name: string
    role: "student" | "teacher"
    university?: string
    department?: string
    semester?: string
}

export interface JWTPayload {
    sub: string
    email: string
    role: string
}
