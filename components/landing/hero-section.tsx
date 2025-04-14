import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4 py-20">
        <div className="space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Simplifiez vos <span className="text-primary">entretiens d'embauche</span><br />
            de manière efficace
          </h1>
          <p className="text-lg text-muted-foreground max-w-[600px] mx-auto mb-8">
            Doorway centralise vos processus de recrutement, de la gestion des candidats
            à l'évaluation finale, en un seul endroit accessible et organisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Accéder au tableau de bord
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg" className="gap-2">
                    Commencer maintenant
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex justify-center gap-8 pt-8">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">500+ Entretiens réalisés</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Planification simplifiée</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}