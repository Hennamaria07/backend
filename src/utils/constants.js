export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "none"
}

export const EXPIRED_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now()),
    sameSite: "none"
}