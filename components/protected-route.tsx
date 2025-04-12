"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, validateCurrentToken } = useAuth();
  const router = useRouter();
  const [tokenValidated, setTokenValidated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Only validate token once to prevent repeated validations
    if (isAuthenticated && !tokenValidated) {
      const checkToken = async () => {
        try {
          await validateCurrentToken();
          setTokenValidated(true);
        } catch (error) {
          console.error("Token validation error:", error);
        }
      };
      checkToken();
    }
  }, [isAuthenticated, loading, router, validateCurrentToken, tokenValidated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
