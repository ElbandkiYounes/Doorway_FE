import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileSpreadsheet, Video } from "lucide-react";

const features = [
  {
    title: "Gestion des Candidats",
    description: "Suivez facilement les profils et CV des candidats.",
    icon: Users
  },
  {
    title: "Planification",
    description: "Organisez les entretiens avec notifications automatiques.",
    icon: Calendar
  },
  {
    title: "Évaluation",
    description: "Utilisez des questionnaires prédéfinis pour évaluer.",
    icon: FileSpreadsheet
  },
  {
    title: "Entretiens Vidéo",
    description: "Conduisez des entretiens à distance facilement.",
    icon: Video
  }
];

export function FeaturesSection() {
  return (
    <section className="h-full flex items-center">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          Fonctionnalités Principales
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-sm">
              <CardHeader className="space-y-1 p-4">
                <feature.icon className="w-6 h-6 text-primary mb-2" />
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground p-4 pt-0">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}