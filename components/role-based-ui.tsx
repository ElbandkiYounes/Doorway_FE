"use client"

import { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { Role } from "@/lib/api-service"

interface RoleBasedUIProps {
  roles: Role[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleBasedUI({ roles, children, fallback }: RoleBasedUIProps) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return fallback || null
  }

  return children
}