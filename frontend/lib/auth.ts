import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import tenantData from "@/data/tenants.json"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      return true // Allow sign in, we'll check tenant access in jwt callback
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

export function checkTenantAccess(email: string, tenant: string): boolean {
  const tenants = tenantData.tenants as Record<string, { name: string; users: string[] }>

  if (!tenants[tenant]) {
    return false
  }

  return tenants[tenant].users.includes(email)
}

export function getTenantInfo(tenant: string) {
  const tenants = tenantData.tenants as Record<string, { name: string; users: string[] }>
  return tenants[tenant] || null
}
