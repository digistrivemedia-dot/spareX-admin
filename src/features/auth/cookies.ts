/** Cookie names shared by the session helpers and `proxy.ts`. */
export const SESSION_COOKIE = "sparex_session"
export const TWO_STEP_COOKIE = "sparex_two_step"

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12
export const TWO_STEP_MAX_AGE_SECONDS = 60 * 10

export const secureCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const
