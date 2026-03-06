import { jwtDecode } from "jwt-decode"

export function saveToken(token: string) {
    const decoded: any = jwtDecode(token)

    document.cookie = `access_token=${token}; path=/`
    document.cookie = `user_role=${decoded.role}; path=/`
}

export function logout() {
    document.cookie = "access_token=; Max-Age=0; path=/"
    document.cookie = "user_role=; Max-Age=0; path=/"
}
