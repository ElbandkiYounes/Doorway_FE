import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileSpreadsheet, Video } from "lucide-react";

const features = [
  {
    title: "Gestion des Candidats",
    description: "Suivez facilement les profils des candidats, leurs CV et leur progression dans le processus de recrutement.",
    icon: Users
  },
  {
    title: "Planification d'Entretiens",
    description: "Organisez et planifiez les entretiens avec un calendrier intégré et des notifications automatiques.",
    icon: Calendar
  },
  {
    title: "Évaluation Structurée",
    description: "Utilisez des questionnaires techniques et de principes prédéfinis pour une évaluation objective.",
    icon: FileSpreadsheet
  },
  {
    title: "Entretiens Vidéo",
    description: "Conduisez des entretiens à distance avec notre système de visioconférence intégré.",
    icon: Video
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Fonctionnalités Principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}