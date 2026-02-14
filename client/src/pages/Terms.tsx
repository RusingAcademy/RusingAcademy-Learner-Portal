import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Terms() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Terms of Service",
      lastUpdated: "Last updated: January 7, 2026",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content: `By accessing or using Lingueefy ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. Lingueefy is operated by Rusinga International Consulting Ltd., commercially known as RusingAcademy.`,
        },
        {
          title: "2. Description of Service",
          content: `Lingueefy is an online marketplace connecting language learners with coaches specializing in Second Language Evaluation (SLE) preparation for Canadian federal public servants. The Platform also provides AI-powered practice tools ("SLE AI Companion").`,
        },
        {
          title: "3. User Accounts",
          content: `You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information during registration.`,
        },
        {
          title: "4. Learner Terms",
          content: `As a learner, you agree to: (a) pay for booked sessions according to the coach's stated rates; (b) provide at least 24 hours notice for cancellations to receive a full refund; (c) treat coaches with respect and professionalism; (d) not share account access with others.`,
        },
        {
          title: "5. Coach Terms",
          content: `As a coach, you agree to: (a) provide accurate information about your qualifications and experience; (b) honor all booked sessions or provide adequate notice for cancellations; (c) maintain professional conduct with all learners; (d) comply with the Platform's commission structure; (e) not solicit learners to conduct sessions outside the Platform.`,
        },
        {
          title: "6. Commission and Payments",
          content: `Lingueefy charges coaches a commission on paid sessions as outlined in our Pricing page. Trial sessions are commission-free. Payments are processed through Stripe. Coaches receive payouts weekly to their connected bank accounts. Learners are charged at the time of booking.`,
        },
        {
          title: "7. Cancellation and Refunds",
          content: `Learners may cancel sessions up to 24 hours before the scheduled time for a full refund. Cancellations within 24 hours are subject to the coach's cancellation policy. Coaches who cancel sessions may be subject to penalties or account suspension.`,
        },
        {
          title: "8. SLE AI Companion",
          content: `SLE AI Companion is provided as a supplementary practice tool. While we strive for accuracy, AI-generated content should not be considered official SLE exam preparation material. Results from AI placement tests are estimates and do not guarantee actual SLE exam results.`,
        },
        {
          title: "9. Intellectual Property",
          content: `All content on the Platform, including text, graphics, logos, and software, is the property of Rusinga International Consulting Ltd. (commercially known as RusingAcademy) or its licensors. You may not reproduce, distribute, or create derivative works without express permission.`,
        },
        {
          title: "10. Limitation of Liability",
          content: `Lingueefy is not responsible for: (a) the quality of coaching provided by individual coaches; (b) SLE exam results; (c) any disputes between learners and coaches; (d) technical issues beyond our reasonable control. Our liability is limited to the amount you paid for services in the preceding 12 months.`,
        },
        {
          title: "11. Termination",
          content: `We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent, abusive, or illegal activity. You may close your account at any time by contacting support.`,
        },
        {
          title: "12. Changes to Terms",
          content: `We may update these Terms of Service from time to time. We will notify users of significant changes via email or Platform notification. Continued use after changes constitutes acceptance of the new terms.`,
        },
        {
          title: "13. Governing Law",
          content: `These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes shall be resolved in the courts of Ontario.`,
        },
        {
          title: "14. Contact",
          content: `For questions about these Terms, please contact us at admin@rusingacademy.ca or through our Contact page.`,
        },
      ],
    },
    fr: {
      title: "Conditions d'utilisation",
      lastUpdated: "Dernière mise à jour : 7 janvier 2026",
      sections: [
        {
          title: "1. Acceptation des conditions",
          content: `En accédant ou en utilisant Lingueefy (« la Plateforme »), vous acceptez d'être lié par ces Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme. Lingueefy est exploité par Rusinga International Consulting Ltd., commercialement connue sous le nom de RusingAcademy.`,
        },
        {
          title: "2. Description du service",
          content: `Lingueefy est un marché en ligne reliant les apprenants de langues avec des coachs spécialisés dans la préparation à l'Évaluation de langue seconde (ELS) pour les fonctionnaires fédéraux canadiens. La Plateforme fournit également des outils de pratique alimentés par l'IA (« SLE AI Companion IA »).`,
        },
        {
          title: "3. Comptes utilisateurs",
          content: `Vous devez créer un compte pour accéder à certaines fonctionnalités. Vous êtes responsable de maintenir la confidentialité de vos identifiants de compte et de toutes les activités sous votre compte. Vous devez fournir des informations exactes et complètes lors de l'inscription.`,
        },
        {
          title: "4. Conditions pour les apprenants",
          content: `En tant qu'apprenant, vous acceptez de : (a) payer les sessions réservées selon les tarifs indiqués par le coach ; (b) fournir un préavis d'au moins 24 heures pour les annulations afin de recevoir un remboursement complet ; (c) traiter les coachs avec respect et professionnalisme ; (d) ne pas partager l'accès à votre compte avec d'autres.`,
        },
        {
          title: "5. Conditions pour les coachs",
          content: `En tant que coach, vous acceptez de : (a) fournir des informations exactes sur vos qualifications et votre expérience ; (b) honorer toutes les sessions réservées ou fournir un préavis adéquat pour les annulations ; (c) maintenir une conduite professionnelle avec tous les apprenants ; (d) respecter la structure de commission de la Plateforme ; (e) ne pas solliciter les apprenants pour des sessions en dehors de la Plateforme.`,
        },
        {
          title: "6. Commission et paiements",
          content: `Lingueefy facture aux coachs une commission sur les sessions payantes comme indiqué sur notre page Tarification. Les sessions d'essai sont sans commission. Les paiements sont traités via Stripe. Les coachs reçoivent des versements hebdomadaires sur leurs comptes bancaires connectés. Les apprenants sont facturés au moment de la réservation.`,
        },
        {
          title: "7. Annulation et remboursements",
          content: `Les apprenants peuvent annuler des sessions jusqu'à 24 heures avant l'heure prévue pour un remboursement complet. Les annulations dans les 24 heures sont soumises à la politique d'annulation du coach. Les coachs qui annulent des sessions peuvent être soumis à des pénalités ou à la suspension de leur compte.`,
        },
        {
          title: "8. SLE AI Companion IA",
          content: `SLE AI Companion IA est fourni comme outil de pratique supplémentaire. Bien que nous nous efforcions d'être précis, le contenu généré par l'IA ne doit pas être considéré comme du matériel officiel de préparation à l'examen ELS. Les résultats des tests de classement IA sont des estimations et ne garantissent pas les résultats réels de l'examen ELS.`,
        },
        {
          title: "9. Propriété intellectuelle",
          content: `Tout le contenu de la Plateforme, y compris les textes, graphiques, logos et logiciels, est la propriété de Rusinga International Consulting Ltd. (commercialement connue sous le nom de RusingAcademy) ou de ses concédants de licence. Vous ne pouvez pas reproduire, distribuer ou créer des œuvres dérivées sans autorisation expresse.`,
        },
        {
          title: "10. Limitation de responsabilité",
          content: `Lingueefy n'est pas responsable de : (a) la qualité du coaching fourni par les coachs individuels ; (b) les résultats des examens ELS ; (c) tout litige entre apprenants et coachs ; (d) les problèmes techniques hors de notre contrôle raisonnable. Notre responsabilité est limitée au montant que vous avez payé pour les services au cours des 12 mois précédents.`,
        },
        {
          title: "11. Résiliation",
          content: `Nous nous réservons le droit de suspendre ou de résilier les comptes qui violent ces conditions ou qui s'engagent dans des activités frauduleuses, abusives ou illégales. Vous pouvez fermer votre compte à tout moment en contactant le support.`,
        },
        {
          title: "12. Modifications des conditions",
          content: `Nous pouvons mettre à jour ces Conditions d'utilisation de temps à autre. Nous informerons les utilisateurs des changements importants par courriel ou notification sur la Plateforme. L'utilisation continue après les changements constitue l'acceptation des nouvelles conditions.`,
        },
        {
          title: "13. Droit applicable",
          content: `Ces Conditions sont régies par les lois de la province de l'Ontario et les lois fédérales du Canada qui y sont applicables. Tout litige sera résolu devant les tribunaux de l'Ontario.`,
        },
        {
          title: "14. Contact",
          content: `Pour toute question concernant ces Conditions, veuillez nous contacter à admin@rusingacademy.ca ou via notre page Contact.`,
        },
      ],
    },
  };

  const c = content[language];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main id="main-content" className="flex-1 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{c.title}</h1>
            <p className="text-muted-foreground mb-8">{c.lastUpdated}</p>

            <div className="prose prose-gray max-w-none">
              {c.sections.map((section, i) => (
                <div key={i} className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
