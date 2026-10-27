import { NextResponse, type NextRequest } from "next/server"

import { SESSION_COOKIE } from "@/features/auth/cookies"

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"]

/**
 * A quick check before rendering: visitors without a session cookie go to the login screen, keeping where they were
 * headed. The real session check happens on the server in `requireSession`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  if (isPublic || request.cookies.has(SESSION_COOKIE)) return NextResponse.next()

  const login = new URL("/login", request.url)
  if (pathname !== "/") login.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(login)
}

export const config = {
  // Skip Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image|images/|favicon.ico).*)"],
}
