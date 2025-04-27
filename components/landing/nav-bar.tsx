import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export function NavBar() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <nav className="border-b h-12">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          Doorway
        </Link>
        <div className="flex items-center gap-2">
          <ModeToggle />
          {!loading && (
            <>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="default" size="sm">
                    Tableau de bord
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm">
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