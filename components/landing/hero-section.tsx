import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative h-full flex items-center justify-center">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="text-center px-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
            Simplifiez vos <span className="text-primary">entretiens d'embauche</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-[600px] mx-auto">
            Doorway centralise vos processus de recrutement en un seul endroit accessible et organisé.
          </p>
          <div className="flex justify-center items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Accéder au tableau de bord
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Commencer maintenant
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}