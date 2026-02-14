/**
 * BecomeCoachPage - Landing Page "Devenir Coach"
 * Marketing page for coach recruitment with CTA to onboarding wizard
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Users, Calendar, DollarSign, Award, ArrowRight } from "lucide-react";

const benefits = [
  { icon: DollarSign, title: "Revenus Flexibles", description: "Fixez vos tarifs et recevez des paiements directs via Stripe" },
  { icon: Calendar, title: "Horaires Libres", description: "Gérez votre disponibilité avec notre calendrier intégré" },
  { icon: Users, title: "Clientèle Qualifiée", description: "Accédez à des fonctionnaires canadiens motivés" },
  { icon: Award, title: "Reconnaissance", description: "Construisez votre réputation avec les avis et certifications" },
];

const requirements = [
  "Maîtrise du français et/ou de l'anglais (niveau C ou équivalent)",
  "Expérience en enseignement ou coaching linguistique",
  "Connaissance des examens SLE/ELS du gouvernement canadien",
  "Disponibilité minimum de 5 heures par semaine",
  "Équipement pour sessions vidéo (webcam, micro, connexion stable)",
];

export default function BecomeCoachPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C65A1E]/10 to-[#C65A1E]/10" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-amber-100 text-[#C65A1E]800 rounded-full text-sm font-medium mb-4">
              Rejoignez notre équipe de coaches
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Devenez Coach Linguistique<br />
              <span className="text-[#C65A1E]600">RusingÂcademy</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Partagez votre expertise linguistique avec des professionnels canadiens 
              et construisez une carrière flexible dans le coaching SLE.
            </p>
            <Link href="/become-a-coach">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg">
                Commencer ma candidature
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Pourquoi devenir coach RusingÂcademy?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 border-slate-100 hover:border-[#FFE4D6] transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-[#C65A1E]600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Critères de sélection
          </h2>
          <Card className="border-2 border-slate-200">
            <CardContent className="p-8">
              <ul className="space-y-4">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#A84A15] to-[#A84A15]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à transformer des carrières?
          </h2>
          <p className="text-xl text-[#C65A1E]100 mb-8">
            Rejoignez une communauté de coaches passionnés et aidez les fonctionnaires 
            canadiens à atteindre leurs objectifs linguistiques.
          </p>
          <Link href="/become-a-coach">
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
              Démarrer le processus d'inscription
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
