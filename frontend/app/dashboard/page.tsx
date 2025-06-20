"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, LogOut, User, Building } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tenant, setTenant] = useState("")
  const [loading, setLoading] = useState(true)
  const [accessVerified, setAccessVerified] = useState(false)

  useEffect(() => {
    const tenantParam = searchParams.get("tenant")
    if (tenantParam) {
      setTenant(tenantParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user?.email && tenant) {
      verifyAccess()
    }
  }, [session, status, tenant])

  const verifyAccess = async () => {
    try {
      const response = await fetch("/api/check-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant }),
      })

      const data = await response.json()

      if (data.hasAccess) {
        setAccessVerified(true)
      } else {
        router.push("/login")
      }
    } catch (error) {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!accessVerified || !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Building className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                {tenant.charAt(0).toUpperCase() + tenant.slice(1)} Dashboard
              </h1>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Information</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{session.user?.name || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organization</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Tenant ID</p>
                  <Badge variant="secondary">{tenant}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Access Level</p>
                  <Badge variant="default">Authorized User</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Session Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="default">Active</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Login Method</p>
                  <p className="text-sm text-muted-foreground">Google OAuth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Welcome to your Dashboard</CardTitle>
            <CardDescription>
              You have successfully authenticated with {tenant} organization using Google OAuth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This is a multi-tenant application where each organization has its own subdomain and user access is
                controlled based on the tenant configuration.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Each organization has its own subdomain (e.g., acme.company.com)</li>
                  <li>• Users authenticate with Google OAuth</li>
                  <li>• Access is granted based on tenant</li>
                  <li>• All organizations share the same codebase but have isolated access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 p-6 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold mb-4">
              Authentication Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </h3>
                <p className="mt-1">
                  {session?.user?.email}
                </p>
              </div>
              {session?.user?.idToken && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Google ID Token
                  </h3>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <pre className="whitespace-pre-wrap break-all text-sm">
                      {session.user.idToken}
                    </pre>
                    <button
                      onClick={() => {
                        if (session.user?.idToken) {
                          navigator.clipboard.writeText(session.user.idToken)
                        }
                      }}
                      className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Copy Token
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
