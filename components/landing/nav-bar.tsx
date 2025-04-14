import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export function NavBar() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Doorway
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {!loading && (
            <>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="default">
                    Tableau de bord
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline">
                    Connexion
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}