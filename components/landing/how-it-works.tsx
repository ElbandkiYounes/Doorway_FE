import { Steps } from "lucide-react";

const steps = [
  {
    title: "Créez votre compte",
    description: "Inscrivez-vous en tant que recruteur et configurez votre profil professionnel."
  },
  {
    title: "Ajoutez des candidats",
    description: "Importez les profils des candidats avec leurs CV et informations pertinentes."
  },
  {
    title: "Planifiez les entretiens",
    description: "Organisez des sessions d'entretien en fonction des disponibilités de chacun."
  },
  {
    title: "Évaluez objectivement",
    description: "Utilisez nos grilles d'évaluation standardisées pour une décision éclairée."
  }
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Comment ça marche ?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Un processus simple et efficace pour gérer vos recrutements de A à Z
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-muted-foreground/20" />
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}