"use client"

import { useEffect, useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import tenantData from "@/data/tenants.json"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tenant, setTenant] = useState("")
  const [tenantInfo, setTenantInfo] = useState<{ name: string; users: string[] } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    console.log("🔐 Login Page Debug:")
    console.log("  - Search params:", Object.fromEntries(searchParams.entries()))
    
    // Get tenant from URL params (set by middleware)
    const tenantParam = searchParams.get("tenant")
    console.log("  - Tenant param from searchParams.get('tenant'):", tenantParam)
    
    if (tenantParam) {
      setTenant(tenantParam)
      const info = (tenantData.tenants as Record<string, { name: string; users: string[] }>)[tenantParam]
      setTenantInfo(info || null)
      console.log("  - Tenant info found:", info)
    } else {
      console.log("  - No tenant param found")
    }

    setIsInitialized(true)
    
    // Check if user is already authenticated
    checkExistingSession()
  }, [searchParams])

  const checkExistingSession = async () => {
    const session = await getSession()
    if (session?.user?.email && tenant) {
      await handlePostAuth(session.user.email)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!tenant) {
      setError("Invalid subdomain. Please access via your organization's subdomain.")
      return
    }

    if (!tenantInfo) {
      setError("Organization not found. Please check your subdomain.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/dashboard",
      })

      if (result?.error) {
        setError("Failed to sign in with Google")
      } else if (result?.ok) {
        // Wait a moment for session to be established
        setTimeout(async () => {
          const session = await getSession()
          if (session?.user?.email) {
            await handlePostAuth(session.user.email)
          }
        }, 1000)
      }
    } catch (err) {
      setError("An error occurred during sign in")
    } finally {
      setLoading(false)
    }
  }

  const handlePostAuth = async (email: string) => {
    try {
      const response = await fetch("/api/check-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant }),
      })

      const data = await response.json()

      if (data.hasAccess) {
        router.push("/dashboard")
      } else {
        setError(`Access denied. Your email (${email}) is not authorized for ${tenantInfo?.name || tenant}.`)
      }
    } catch (err) {
      setError("Failed to verify access")
    }
  }

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex justify-center items-center p-8">
            <div>Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error only after initialization is complete
  if (!tenant) {
    console.log("  ❌ No tenant found after initialization - showing invalid access")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Access</CardTitle>
            <CardDescription>
              Please access this login page via your organization's subdomain (e.g., yourorg.company.com)
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  console.log("  ✅ Tenant found after initialization, showing login form")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {tenantInfo ? `Welcome to ${tenantInfo.name}` : "Organization Login"}
          </CardTitle>
          <CardDescription>Sign in with your Google account to access your organization's dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Organization:</strong> {tenant}
            </p>
            {tenantInfo && (
              <div className="text-xs text-muted-foreground">
                <p>
                  <strong>Authorized users:</strong>
                </p>
                <ul className="list-disc list-inside mt-1">
                  {tenantInfo.users.map((user, index) => (
                    <li key={index}>{user}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Button onClick={handleGoogleSignIn} disabled={loading || !tenantInfo} className="w-full" size="lg">
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Only authorized users can access this organization's resources
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
