"use client";

import { useAuth } from "@/lib/auth-context";
import { ReactNode } from "react";

interface RoleBasedUIProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function RoleBasedUI({ children, adminOnly = false }: RoleBasedUIProps) {
  const { user } = useAuth();
  
  if (adminOnly && user?.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}