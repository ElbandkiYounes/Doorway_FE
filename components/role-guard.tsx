"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    // Check if we have an unauthorized flag from API responses
    const isUnauthorized = localStorage.getItem('doorway_unauthorized') === 'true';
    if (isUnauthorized) {
      setUnauthorized(true);
      localStorage.removeItem('doorway_unauthorized'); // Clear the flag
      return;
    }
    
    // Wait until auth state is loaded
    if (loading) return;

    // If not authenticated, no need to check roles
    if (!isAuthenticated) return;

    // Check if user is admin when required
    if (adminOnly && !isAdmin()) {
      setUnauthorized(true);
    }
  }, [adminOnly, isAuthenticated, loading, isAdmin]);

  // While loading, return nothing to avoid flash of content
  if (loading) return null;

  // If unauthorized, show error page
  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page. This action requires administrator privileges.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => {
            setUnauthorized(false); // Reset state
            router.push(fallbackPath);
          }}
        >
          Return to Interviews
        </Button>
      </div>
    );
  }

  // Otherwise render children
  return <>{children}</>;
}