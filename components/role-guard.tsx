"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RoleGuardProps = {
  adminOnly: boolean;
  children: React.ReactNode;
  fallbackPath?: string;
};

export function RoleGuard({ 
  adminOnly, 
  children, 
  fallbackPath = "/dashboard/interviews" 
}: RoleGuardProps) {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until auth state is loaded
    if (loading) return;

    // If not authenticated, no need to check roles
    if (!isAuthenticated) return;

    // Check if user is admin when required
    if (adminOnly && !isAdmin()) {
      router.push(fallbackPath);
    }
  }, [adminOnly, isAuthenticated, loading, fallbackPath, router]);

  // While loading, return nothing to avoid flash of content
  if (loading) return null;

  // If adminOnly is true, check if user is admin
  if (adminOnly && !isAdmin()) {
    return null;
  }

  // Otherwise render children
  return <>{children}</>;
}