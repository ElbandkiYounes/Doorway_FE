"use client"

import { useAuth } from "@/lib/auth-context"
import { Role } from "@/lib/api-service"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RoleGuardProps {
  roles: Role[]
  children: React.ReactNode
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || !roles.includes(user.role)) {
      router.replace("/dashboard")
    }
  }, [user, roles, router])

  if (!user || !roles.includes(user.role)) {
    return null
  }

  return children
}