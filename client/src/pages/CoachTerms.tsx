import { Link } from "wouter";
import { ArrowLeft, FileText, DollarSign, Shield, Clock, AlertTriangle, CheckCircle, Building2, Users, Megaphone, Wrench, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoachTerms() {
  const lastUpdated = "29 janvier 2026";
  const termsVersion = "v2026.01.29";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/coach/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour au tableau de bord
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span className="font-semibold text-slate-800 dark:text-white">Termes et Conditions</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <img 
                loading="lazy" src="/rusinga-logo.png" 
                alt="Rusinga International Consulting Ltd." 
                className="w-12 h-12 rounded-lg bg-white p-1"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-2xl font-bold">Termes et Conditions pour les Coachs</h1>
                <p className="text-teal-100 text-sm">Contrat de Partenariat Coach</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 mt-4">
              <p className="font-semibold">Rusinga International Consulting Ltd.</p>
              <p className="text-teal-100 text-sm">Commercialement connue sous le nom de « RusingÂcademy »</p>
              <p className="text-teal-200 text-xs mt-2">Plateforme de Coaching Linguistique pour Fonctionnaires Canadiens</p>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-teal-200">
              <span>Dernière mise à jour : {lastUpdated}</span>
              <span>Version : {termsVersion}</span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                1. Introduction et Définitions
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                Les présentes conditions générales (« Conditions ») régissent votre utilisation de la plateforme 
                de coaching linguistique en tant que coach certifié. En acceptant ces conditions, vous reconnaissez avoir 
                lu, compris et accepté l'ensemble des termes ci-dessous.
              </p>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>« La Société »</strong> désigne Rusinga International Consulting Ltd., société canadienne, 
                commercialement connue sous le nom de « RusingÂcademy ».</p>
                <p><strong>« La Plateforme »</strong> désigne l'ensemble des services technologiques et applications 
                web opérés par la Société pour la mise en relation de coachs et d'apprenants.</p>
                <p><strong>« Le Coach »</strong> désigne tout professionnel certifié ayant accepté les présentes 
                conditions pour offrir des services de coaching via la Plateforme.</p>
              </div>
            </section>

            {/* Commission Structure - HIGHLIGHTED */}
            <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                2. Structure de Commission et Frais Administratifs
              </h2>
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-amber-300 dark:border-amber-600">
                  <p className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                    Commission Administrative : <span className="text-amber-600 text-2xl">30%</span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    Pour chaque paiement reçu via la Plateforme, des frais administratifs de <strong>trente pour cent (30%)</strong> 
                    seront automatiquement prélevés. Le Coach recevra les <strong>soixante-dix pour cent (70%)</strong> restants 
                    directement sur son compte Stripe Connect.
                  </p>
                </div>

                {/* Detailed breakdown of what the 30% covers */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-600">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-center">
                    Affectation des Frais Administratifs (30%)
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 text-center">
                    La commission de 30% est affectée à l'administration générale de votre compte coach, incluant :
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Logistique & Infrastructure</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Hébergement sécurisé, serveurs, bases de données, système de vidéoconférence, calendrier de réservation
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Entretien & Maintenance</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Mises à jour de sécurité, corrections de bugs, améliorations continues, support technique 24/7
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Formations & Développement</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Webinaires pour coachs, ressources pédagogiques, certifications, accès aux outils IA d'accompagnement
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Megaphone className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Marketing & Visibilité</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Publicité, SEO, réseaux sociaux, partenariats gouvernementaux, acquisition de nouveaux apprenants
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Support Client</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Service à la clientèle, gestion des litiges, médiation, assistance aux apprenants et coachs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Conformité & Sécurité</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Protection des données, conformité LPRPDE, assurances, vérifications des antécédents
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Exemple de calcul</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Session à 100$ CAD</li>
                      <li>• Frais administratifs : 30$ (30%)</li>
                      <li>• <strong>Revenu coach : 70$ (70%)</strong></li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Avantages inclus</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>✓ Aucun frais d'inscription</li>
                      <li>✓ Aucun frais mensuel fixe</li>
                      <li>✓ Paiement uniquement sur revenus générés</li>
                      <li>✓ Accès complet à tous les outils</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                3. Modalités de Paiement
              </h2>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <p>
                  <strong>3.1 Compte Stripe Connect :</strong> Chaque Coach doit créer et maintenir un compte Stripe Connect 
                  valide pour recevoir ses paiements. La Société n'est pas responsable des retards causés par des 
                  informations bancaires incorrectes ou incomplètes.
                </p>
                <p>
                  <strong>3.2 Délai de versement :</strong> Les paiements sont versés automatiquement sur votre compte 
                  bancaire selon le calendrier de Stripe (généralement 2-7 jours ouvrables après la transaction).
                </p>
                <p>
                  <strong>3.3 Devise :</strong> Tous les paiements sont effectués en dollars canadiens (CAD), sauf 
                  indication contraire convenue par écrit.
                </p>
                <p>
                  <strong>3.4 Taxes :</strong> Le Coach est seul responsable de la déclaration et du paiement de 
                  toutes les taxes applicables sur ses revenus de coaching, incluant la TPS/TVH et les impôts sur le revenu.
                </p>
                <p>
                  <strong>3.5 Statut d'entrepreneur indépendant :</strong> Le Coach exerce ses activités en tant 
                  qu'entrepreneur indépendant et non en tant qu'employé de la Société. Aucune relation d'emploi 
                  n'est créée par les présentes Conditions.
                </p>
              </div>
            </section>

            {/* Obligations */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                4. Obligations du Coach
              </h2>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <p>
                  <strong>4.1 Qualité de service :</strong> Le Coach s'engage à fournir des services de coaching 
                  de haute qualité, conformes aux standards professionnels de l'industrie du coaching linguistique.
                </p>
                <p>
                  <strong>4.2 Disponibilité :</strong> Le Coach doit maintenir son calendrier de disponibilité à jour 
                  et honorer toutes les sessions réservées, sauf cas de force majeure dûment justifié.
                </p>
                <p>
                  <strong>4.3 Confidentialité :</strong> Le Coach s'engage à maintenir la confidentialité des 
                  informations personnelles des apprenants et à ne pas les utiliser à des fins non autorisées.
                </p>
                <p>
                  <strong>4.4 Professionnalisme :</strong> Le Coach doit maintenir une conduite professionnelle 
                  en tout temps et représenter positivement la Plateforme et la Société.
                </p>
                <p>
                  <strong>4.5 Exclusivité des paiements :</strong> Tous les paiements pour les sessions organisées 
                  via la Plateforme doivent transiter par le système de paiement intégré. Il est strictement 
                  interdit de solliciter des paiements directs des apprenants rencontrés via la Plateforme.
                </p>
                <p>
                  <strong>4.6 Vérification d'identité :</strong> Le Coach consent à fournir les documents 
                  d'identification requis et à se soumettre aux vérifications d'antécédents nécessaires.
                </p>
              </div>
            </section>

            {/* Cancellation Policy */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-teal-600" />
                5. Politique d'Annulation
              </h2>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <p>
                  <strong>5.1 Annulation par le Coach :</strong> En cas d'annulation par le Coach moins de 24 heures 
                  avant la session, l'apprenant sera intégralement remboursé et le Coach pourra faire l'objet de 
                  pénalités pouvant aller jusqu'à la suspension temporaire du compte.
                </p>
                <p>
                  <strong>5.2 Annulation par l'apprenant :</strong> Les annulations par l'apprenant sont soumises 
                  à la politique d'annulation de la Plateforme. Le Coach recevra sa part (70%) si l'annulation 
                  intervient moins de 24 heures avant la session.
                </p>
                <p>
                  <strong>5.3 No-show :</strong> En cas d'absence non justifiée de l'apprenant, le Coach recevra 
                  l'intégralité de sa part (70%) de la session.
                </p>
                <p>
                  <strong>5.4 Force majeure :</strong> Les annulations dues à des circonstances exceptionnelles 
                  (urgence médicale, catastrophe naturelle, etc.) seront traitées au cas par cas.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                6. Résiliation
              </h2>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <p>
                  <strong>6.1 Résiliation volontaire :</strong> Le Coach peut mettre fin à son partenariat avec 
                  la Société à tout moment avec un préavis écrit de 30 jours. Toutes les sessions réservées pendant 
                  cette période doivent être honorées.
                </p>
                <p>
                  <strong>6.2 Résiliation pour cause :</strong> La Société se réserve le droit de résilier 
                  immédiatement le partenariat en cas de violation des présentes Conditions, de comportement 
                  inapproprié, de fraude, ou de plaintes répétées des apprenants.
                </p>
                <p>
                  <strong>6.3 Effets de la résiliation :</strong> À la résiliation, le Coach recevra tous les 
                  paiements dus pour les sessions complétées. L'accès à la Plateforme sera révoqué dans les 
                  48 heures suivant la date effective de résiliation.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                7. Propriété Intellectuelle
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Le Coach conserve tous les droits sur son contenu original. Cependant, en utilisant la Plateforme, 
                le Coach accorde à Rusinga International Consulting Ltd. une licence non exclusive, mondiale et 
                libre de redevances pour utiliser son nom, sa photo et sa biographie à des fins de marketing 
                et de promotion de la Plateforme.
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                8. Modifications des Conditions
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                La Société se réserve le droit de modifier ces Conditions à tout moment. Les Coachs seront 
                notifiés de tout changement significatif par courriel au moins 30 jours avant l'entrée en vigueur 
                des nouvelles conditions. L'utilisation continue de la Plateforme après cette période constitue 
                une acceptation des nouvelles conditions.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                9. Droit Applicable et Juridiction
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                Les présentes Conditions sont régies par les lois de la province de l'Ontario et les lois 
                fédérales du Canada applicables. Tout litige découlant des présentes Conditions sera soumis 
                à la compétence exclusive des tribunaux de la province de l'Ontario, Canada.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                10. Contact
              </h2>
              <div className="text-slate-700 dark:text-slate-300 space-y-2">
                <p>Pour toute question concernant ces Conditions, veuillez contacter :</p>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <p className="font-semibold">Rusinga International Consulting Ltd.</p>
                  <p className="text-sm">Commercialement connue sous le nom de « RusingÂcademy »</p>
                  <p className="mt-2">
                    Courriel :{" "}
                    <a href="mailto:coaches@rusingacademy.ca" className="text-teal-600 hover:underline">
                      coaches@rusingacademy.ca
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Acceptance Summary */}
            <section className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                Résumé des Points Clés
              </h2>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                  <span>Frais administratifs de <strong>30%</strong> prélevés sur chaque paiement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                  <span>Les 30% couvrent : logistique, entretien, formations, marketing et support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                  <span>Vous recevez <strong>70%</strong> de chaque session directement sur votre compte Stripe</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                  <span>Paiements automatiques via Stripe Connect (2-7 jours ouvrables)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                  <span>Statut d'entrepreneur indépendant - vous êtes responsable de vos obligations fiscales</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                  <span>Tous les paiements doivent passer par la Plateforme</span>
                </li>
              </ul>
            </section>

            {/* Legal Notice */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p>© {new Date().getFullYear()} Rusinga International Consulting Ltd. Tous droits réservés.</p>
              <p className="mt-1">Document version {termsVersion}</p>
            </div>

            {/* Back Button */}
            <div className="pt-6">
              <Link href="/coach/dashboard">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  Retour au Tableau de Bord
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
