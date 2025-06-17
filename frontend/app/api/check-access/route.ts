import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, checkTenantAccess } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { tenant } = await request.json()

    if (!tenant) {
      return NextResponse.json({ error: "Tenant required" }, { status: 400 })
    }

    const hasAccess = checkTenantAccess(session.user.email, tenant)

    return NextResponse.json({
      hasAccess,
      email: session.user.email,
      tenant,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
