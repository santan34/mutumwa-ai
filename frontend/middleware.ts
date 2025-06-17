import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get("host") || ""

  // Extract subdomain (tenant)
  const subdomain = hostname.split(".")[0]

  // Skip middleware for localhost and if already has tenant param
  if (hostname.includes("localhost") || url.searchParams.has("tenant")) {
    return NextResponse.next()
  }

  // Add tenant to URL params for API routes and pages
  if (subdomain && subdomain !== "www") {
    url.searchParams.set("tenant", subdomain)
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
