import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get("host") || ""
  
  console.log("🔍 Middleware Debug:")
  console.log("  - Full hostname:", hostname)
  console.log("  - Request URL:", request.url)
  console.log("  - Request pathname:", url.pathname)

  // Extract subdomain (tenant)
  const subdomain = hostname.split(".")[0]
  console.log("  - Extracted subdomain:", subdomain)

  // Skip middleware if already has tenant param
  if (url.searchParams.has("tenant")) {
    console.log("  ✅ Tenant param already exists, skipping middleware")
    return NextResponse.next()
  }

  // For localhost development, check for subdomains like acme.localhost
  if (hostname.includes("localhost") || hostname.includes(".test")) {
    console.log("  🏠 Processing localhost/test request")
    
    // Only process if there's a subdomain (not just "localhost")
    if (subdomain && subdomain !== "localhost" && !subdomain.includes("localhost") && subdomain !== "test") {
      console.log("  ✅ Valid subdomain found, adding tenant:", subdomain)
      url.searchParams.set("tenant", subdomain)
      console.log("  📝 Redirecting to URL:", url.toString())
      return NextResponse.redirect(url)
    } else {
      console.log("  ❌ No valid subdomain found or is base localhost")
      return NextResponse.next()
    }
  }

  // Add tenant to URL params for production domains
  if (subdomain && subdomain !== "www") {
    console.log("  🌐 Production domain - adding tenant:", subdomain)
    url.searchParams.set("tenant", subdomain)
    console.log("  📝 Redirecting to URL:", url.toString())
    return NextResponse.redirect(url)
  }

  console.log("  ⏭️ No tenant processing needed")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
