import { Steps } from "lucide-react";

const steps = [
  {
    title: "Créez votre compte",
    description: "Configurez votre profil professionnel"
  },
  {
    title: "Ajoutez des candidats",
    description: "Importez les profils et CV"
  },
  {
    title: "Planifiez",
    description: "Organisez vos sessions d'entretien"
  },
  {
    title: "Évaluez",
    description: "Utilisez nos grilles d'évaluation"
  }
];

export function HowItWorks() {
  return (
    <section className="h-full flex items-center bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Comment ça marche ?</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-muted-foreground/20" />
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="font-medium text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}