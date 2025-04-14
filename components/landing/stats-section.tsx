import { Card, CardContent } from "@/components/ui/card";
import { Users2, CalendarCheck, School, Briefcase } from "lucide-react";

const stats = [
  {
    label: "Entretiens Réalisés",
    value: "500+",
    icon: CalendarCheck,
    description: "Entretiens gérés avec succès"
  },
  {
    label: "Recruteurs Actifs",
    value: "50+",
    icon: Users2,
    description: "Professionnels utilisant Doorway"
  },
  {
    label: "Écoles Partenaires",
    value: "20+",
    icon: School,
    description: "Institutions collaboratrices"
  },
  {
    label: "Postes Pourvus",
    value: "200+",
    icon: Briefcase,
    description: "Recrutements réussis"
  }
];

export function StatsSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Notre Impact en Chiffres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-none bg-background">
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                <p className="font-medium mb-2">{stat.label}</p>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}