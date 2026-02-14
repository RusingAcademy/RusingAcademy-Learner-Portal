import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Privacy() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: January 7, 2026",
      intro: "Rusinga International Consulting Ltd., commercially known as RusingAcademy (\"we\", \"us\", \"our\") operates Lingueefy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
      sections: [
        {
          title: "1. Information We Collect",
          content: `We collect information you provide directly, including: name, email address, profile information, payment details (processed by Stripe), session recordings (with consent), and communications with coaches or support. We also automatically collect: device information, IP address, browser type, usage data, and cookies.`,
        },
        {
          title: "2. How We Use Your Information",
          content: `We use your information to: provide and improve our services; process payments and payouts; match learners with coaches; communicate with you about your account; send marketing communications (with consent); analyze usage patterns; prevent fraud and abuse; comply with legal obligations.`,
        },
        {
          title: "3. Information Sharing",
          content: `We share information with: coaches (learner profile information for booked sessions); payment processors (Stripe) for transactions; service providers who assist our operations; law enforcement when required by law. We do not sell your personal information to third parties.`,
        },
        {
          title: "4. Data Retention",
          content: `We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for legal, accounting, or fraud prevention purposes for up to 7 years.`,
        },
        {
          title: "5. Your Rights",
          content: `You have the right to: access your personal information; correct inaccurate data; delete your account and associated data; opt out of marketing communications; request data portability; withdraw consent for optional processing. Contact us at admin@rusingacademy.ca to exercise these rights.`,
        },
        {
          title: "6. Cookies and Tracking",
          content: `We use cookies and similar technologies for: authentication and session management; remembering your preferences; analytics and performance monitoring; security purposes. You can control cookies through your browser settings, but some features may not function properly without them.`,
        },
        {
          title: "7. Data Security",
          content: `We implement appropriate technical and organizational measures to protect your information, including: encryption in transit and at rest; secure payment processing through Stripe; regular security assessments; access controls and authentication. However, no method of transmission over the Internet is 100% secure.`,
        },
        {
          title: "8. International Transfers",
          content: `Your information may be transferred to and processed in countries other than Canada, including the United States where our service providers operate. We ensure appropriate safeguards are in place for such transfers.`,
        },
        {
          title: "9. Children's Privacy",
          content: `Lingueefy is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.`,
        },
        {
          title: "10. Third-Party Services",
          content: `Our platform integrates with third-party services including Stripe (payments), video conferencing tools, and analytics providers. These services have their own privacy policies, and we encourage you to review them.`,
        },
        {
          title: "11. Changes to This Policy",
          content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. Your continued use of Lingueefy after changes constitutes acceptance of the updated policy.`,
        },
        {
          title: "12. Contact Us",
          content: `For privacy-related questions or to exercise your rights, contact our Privacy Officer at: admin@rusingacademy.ca or Rusinga International Consulting Ltd. (commercially known as RusingAcademy), Ottawa, Ontario, Canada.`,
        },
      ],
    },
    fr: {
      title: "Politique de confidentialité",
      lastUpdated: "Dernière mise à jour : 7 janvier 2026",
      intro: "Rusinga International Consulting Ltd., commercialement connue sous le nom de RusingAcademy (« nous », « notre », « nos ») exploite Lingueefy. Cette Politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre plateforme.",
      sections: [
        {
          title: "1. Informations que nous collectons",
          content: `Nous collectons les informations que vous fournissez directement, notamment : nom, adresse courriel, informations de profil, détails de paiement (traités par Stripe), enregistrements de sessions (avec consentement) et communications avec les coachs ou le support. Nous collectons également automatiquement : informations sur l'appareil, adresse IP, type de navigateur, données d'utilisation et cookies.`,
        },
        {
          title: "2. Comment nous utilisons vos informations",
          content: `Nous utilisons vos informations pour : fournir et améliorer nos services ; traiter les paiements et les versements ; jumeler les apprenants avec les coachs ; communiquer avec vous au sujet de votre compte ; envoyer des communications marketing (avec consentement) ; analyser les modèles d'utilisation ; prévenir la fraude et les abus ; respecter les obligations légales.`,
        },
        {
          title: "3. Partage d'informations",
          content: `Nous partageons des informations avec : les coachs (informations de profil des apprenants pour les sessions réservées) ; les processeurs de paiement (Stripe) pour les transactions ; les fournisseurs de services qui assistent nos opérations ; les forces de l'ordre lorsque requis par la loi. Nous ne vendons pas vos informations personnelles à des tiers.`,
        },
        {
          title: "4. Conservation des données",
          content: `Nous conservons vos informations aussi longtemps que votre compte est actif ou selon les besoins pour fournir des services. Après la suppression du compte, nous pouvons conserver certaines informations à des fins légales, comptables ou de prévention de la fraude jusqu'à 7 ans.`,
        },
        {
          title: "5. Vos droits",
          content: `Vous avez le droit de : accéder à vos informations personnelles ; corriger les données inexactes ; supprimer votre compte et les données associées ; vous désabonner des communications marketing ; demander la portabilité des données ; retirer votre consentement pour le traitement optionnel. Contactez-nous à admin@rusingacademy.ca pour exercer ces droits.`,
        },
        {
          title: "6. Cookies et suivi",
          content: `Nous utilisons des cookies et des technologies similaires pour : l'authentification et la gestion des sessions ; mémoriser vos préférences ; l'analyse et la surveillance des performances ; des fins de sécurité. Vous pouvez contrôler les cookies via les paramètres de votre navigateur, mais certaines fonctionnalités peuvent ne pas fonctionner correctement sans eux.`,
        },
        {
          title: "7. Sécurité des données",
          content: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations, notamment : le chiffrement en transit et au repos ; le traitement sécurisé des paiements via Stripe ; des évaluations de sécurité régulières ; des contrôles d'accès et l'authentification. Cependant, aucune méthode de transmission sur Internet n'est sécurisée à 100%.`,
        },
        {
          title: "8. Transferts internationaux",
          content: `Vos informations peuvent être transférées et traitées dans des pays autres que le Canada, y compris les États-Unis où opèrent nos fournisseurs de services. Nous nous assurons que des garanties appropriées sont en place pour ces transferts.`,
        },
        {
          title: "9. Confidentialité des enfants",
          content: `Lingueefy n'est pas destiné aux utilisateurs de moins de 18 ans. Nous ne collectons pas sciemment d'informations auprès d'enfants. Si vous pensez que nous avons collecté des informations d'un enfant, veuillez nous contacter immédiatement.`,
        },
        {
          title: "10. Services tiers",
          content: `Notre plateforme s'intègre à des services tiers, notamment Stripe (paiements), des outils de vidéoconférence et des fournisseurs d'analyse. Ces services ont leurs propres politiques de confidentialité, et nous vous encourageons à les consulter.`,
        },
        {
          title: "11. Modifications de cette politique",
          content: `Nous pouvons mettre à jour cette Politique de confidentialité de temps à autre. Nous vous informerons des changements importants par courriel ou notification sur la plateforme. Votre utilisation continue de Lingueefy après les changements constitue l'acceptation de la politique mise à jour.`,
        },
        {
          title: "12. Nous contacter",
          content: `Pour les questions relatives à la confidentialité ou pour exercer vos droits, contactez notre Responsable de la confidentialité à : admin@rusingacademy.ca ou Rusinga International Consulting Ltd. (commercialement connue sous le nom de RusingAcademy), Ottawa, Ontario, Canada.`,
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
            <p className="text-muted-foreground mb-4">{c.lastUpdated}</p>
            <p className="text-muted-foreground mb-8">{c.intro}</p>

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
