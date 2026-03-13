export function saveToken(token: string, role: string) {
    document.cookie = `access_token=${token}; path=/`
    document.cookie = `user_role=${role}; path=/`
}

export function logout() {
    document.cookie = "access_token=; Max-Age=0; path=/"
    document.cookie = "user_role=; Max-Age=0; path=/"
}
