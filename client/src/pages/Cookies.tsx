import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Cookies() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Cookie Policy",
      lastUpdated: "Last updated: January 12, 2026",
      intro: "Rusinga International Consulting Ltd., commercially known as RusingAcademy, uses cookies and similar tracking technologies on the Lingueefy platform. This Cookie Policy explains what cookies are, how we use them, and your options for managing them.",
      sections: [
        {
          title: "1. What Are Cookies?",
          content: "Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you visit a website. They contain information about your browsing activity and preferences. Cookies help websites remember your information and provide a better user experience.",
        },
        {
          title: "2. Types of Cookies We Use",
          content: `We use the following types of cookies:

**Essential Cookies**: Required for the platform to function properly. These include:
- Session cookies for authentication and login
- Security cookies to prevent fraud
- Preference cookies to remember your language choice
- Load balancing cookies for platform performance

**Analytics Cookies**: Help us understand how users interact with our platform:
- Google Analytics to track page views and user behavior
- Performance monitoring to identify technical issues
- Heatmaps to understand user navigation patterns

**Functional Cookies**: Enhance your experience:
- Remember your preferences (language, theme)
- Store your search history
- Remember your coach preferences
- Save form data

**Marketing Cookies**: Used to track and measure advertising effectiveness:
- Conversion tracking for marketing campaigns
- Retargeting to show relevant content
- Social media integration cookies

**Third-Party Cookies**: Set by external services:
- Stripe (payment processing)
- Google Analytics
- Video conferencing platforms
- Social media platforms`,
        },
        {
          title: "3. How We Use Cookies",
          content: `We use cookies to:
- Authenticate your identity and maintain your session
- Remember your language preference (English or French)
- Store your account preferences and settings
- Analyze how you use the platform to improve our services
- Measure the effectiveness of our marketing campaigns
- Prevent fraud and ensure platform security
- Provide personalized content and recommendations
- Enable social media sharing features`,
        },
        {
          title: "4. Cookie Duration",
          content: `Cookies have different lifespans:
- **Session Cookies**: Deleted when you close your browser
- **Persistent Cookies**: Remain on your device for a specified period (typically 1 month to 1 year)
- **Essential Cookies**: May persist longer for security purposes

You can see the expiration date of each cookie in your browser settings.`,
        },
        {
          title: "5. Your Cookie Choices",
          content: `You have several options for managing cookies:

**Browser Settings**: Most browsers allow you to:
- Accept or reject all cookies
- Accept only essential cookies
- Delete existing cookies
- Set cookies to delete automatically when you close your browser

**Opt-Out Options**:
- Google Analytics: Use the Google Analytics Opt-out Browser Add-on
- Marketing cookies: Opt out through your account preferences
- Retargeting: Opt out through your browser's Do Not Track settings

**Disabling Cookies**: If you disable cookies, some features of the platform may not work properly, including:
- Login and authentication
- Language preferences
- Saved preferences
- Personalized recommendations`,
        },
        {
          title: "6. Third-Party Cookies",
          content: `Our platform integrates with third-party services that may set their own cookies:

**Stripe (Payment Processing)**:
- Cookies for secure payment processing
- Fraud prevention cookies
- See Stripe's Cookie Policy for details

**Google Analytics**:
- Performance and usage analytics
- See Google's Cookie Policy for details

**Video Conferencing Platforms**:
- Session management for video calls
- See the platform's privacy policy for details

**Social Media Platforms**:
- Social sharing and integration
- See each platform's cookie policy for details

We do not control these third-party cookies. Please review their privacy policies for more information.`,
        },
        {
          title: "7. Data Privacy with Cookies",
          content: `Cookies may contain or link to personal information. We treat all cookie data in accordance with our Privacy Policy:
- Cookies are encrypted in transit and at rest
- Cookie data is not shared with third parties for marketing purposes
- You can request deletion of cookie data at any time
- We comply with PIPEDA and other applicable privacy laws`,
        },
        {
          title: "8. Government Compliance",
          content: `As a platform serving Canadian federal public servants, we ensure:
- Compliance with Treasury Board IT security policies
- No tracking of government employee activity beyond what's necessary
- Secure cookie handling in accordance with Canadian privacy laws
- Clear disclosure of all tracking and analytics
- Option to use the platform with minimal cookies`,
        },
        {
          title: "9. Changes to This Policy",
          content: `We may update this Cookie Policy from time to time to reflect changes in our practices or technology. We will notify you of significant changes via email or platform notification. Your continued use of Lingueefy after changes constitutes acceptance of the updated policy.`,
        },
        {
          title: "10. Contact Us",
          content: `For questions about our use of cookies or to manage your cookie preferences, please contact us at:
- Email: admin@rusingacademy.ca
- Address: Rusinga International Consulting Ltd. (RusingAcademy), Ottawa, Ontario, Canada

We aim to respond to cookie-related inquiries within 5 business days.`,
        },
      ],
    },
    fr: {
      title: "Politique relative aux cookies",
      lastUpdated: "Dernière mise à jour : 12 janvier 2026",
      intro: "Rusinga International Consulting Ltd., commercialement connue sous le nom de RusingAcademy, utilise des cookies et des technologies de suivi similaires sur la plateforme Lingueefy. Cette Politique relative aux cookies explique ce que sont les cookies, comment nous les utilisons et vos options pour les gérer.",
      sections: [
        {
          title: "1. Qu'est-ce que les cookies?",
          content: "Les cookies sont de petits fichiers texte stockés sur votre appareil (ordinateur, tablette ou téléphone mobile) lorsque vous visitez un site Web. Ils contiennent des informations sur votre activité de navigation et vos préférences. Les cookies aident les sites Web à mémoriser vos informations et à offrir une meilleure expérience utilisateur.",
        },
        {
          title: "2. Types de cookies que nous utilisons",
          content: `Nous utilisons les types de cookies suivants:

**Cookies essentiels**: Requis pour que la plateforme fonctionne correctement. Ceux-ci incluent:
- Cookies de session pour l'authentification et la connexion
- Cookies de sécurité pour prévenir la fraude
- Cookies de préférence pour mémoriser votre choix de langue
- Cookies d'équilibrage de charge pour les performances de la plateforme

**Cookies analytiques**: Nous aident à comprendre comment les utilisateurs interagissent avec notre plateforme:
- Google Analytics pour suivre les pages vues et le comportement des utilisateurs
- Surveillance des performances pour identifier les problèmes techniques
- Cartes thermiques pour comprendre les modèles de navigation des utilisateurs

**Cookies fonctionnels**: Améliorent votre expérience:
- Mémoriser vos préférences (langue, thème)
- Stocker votre historique de recherche
- Mémoriser vos préférences de coach
- Enregistrer les données de formulaire

**Cookies marketing**: Utilisés pour suivre et mesurer l'efficacité de la publicité:
- Suivi des conversions pour les campagnes marketing
- Retargeting pour afficher du contenu pertinent
- Cookies d'intégration des médias sociaux

**Cookies tiers**: Définis par des services externes:
- Stripe (traitement des paiements)
- Google Analytics
- Plateformes de vidéoconférence
- Plateformes de médias sociaux`,
        },
        {
          title: "3. Comment nous utilisons les cookies",
          content: `Nous utilisons les cookies pour:
- Authentifier votre identité et maintenir votre session
- Mémoriser votre préférence de langue (anglais ou français)
- Stocker vos préférences et paramètres de compte
- Analyser comment vous utilisez la plateforme pour améliorer nos services
- Mesurer l'efficacité de nos campagnes marketing
- Prévenir la fraude et assurer la sécurité de la plateforme
- Fournir du contenu et des recommandations personnalisés
- Activer les fonctionnalités de partage sur les médias sociaux`,
        },
        {
          title: "4. Durée des cookies",
          content: `Les cookies ont des durées de vie différentes:
- **Cookies de session**: Supprimés lorsque vous fermez votre navigateur
- **Cookies persistants**: Restent sur votre appareil pendant une période spécifiée (généralement 1 mois à 1 an)
- **Cookies essentiels**: Peuvent persister plus longtemps à des fins de sécurité

Vous pouvez voir la date d'expiration de chaque cookie dans les paramètres de votre navigateur.`,
        },
        {
          title: "5. Vos choix concernant les cookies",
          content: `Vous avez plusieurs options pour gérer les cookies:

**Paramètres du navigateur**: La plupart des navigateurs vous permettent de:
- Accepter ou refuser tous les cookies
- Accepter uniquement les cookies essentiels
- Supprimer les cookies existants
- Définir les cookies à supprimer automatiquement lorsque vous fermez votre navigateur

**Options de refus**:
- Google Analytics: Utilisez le module complémentaire de refus Google Analytics
- Cookies marketing: Refusez via vos préférences de compte
- Retargeting: Refusez via le paramètre Ne pas suivre de votre navigateur

**Désactivation des cookies**: Si vous désactivez les cookies, certaines fonctionnalités de la plateforme peuvent ne pas fonctionner correctement, notamment:
- Connexion et authentification
- Préférences de langue
- Préférences enregistrées
- Recommandations personnalisées`,
        },
        {
          title: "6. Cookies tiers",
          content: `Notre plateforme s'intègre à des services tiers qui peuvent définir leurs propres cookies:

**Stripe (traitement des paiements)**:
- Cookies pour le traitement sécurisé des paiements
- Cookies de prévention de la fraude
- Voir la Politique relative aux cookies de Stripe pour plus de détails

**Google Analytics**:
- Analyses de performance et d'utilisation
- Voir la Politique relative aux cookies de Google pour plus de détails

**Plateformes de vidéoconférence**:
- Gestion des sessions pour les appels vidéo
- Voir la politique de confidentialité de la plateforme pour plus de détails

**Plateformes de médias sociaux**:
- Partage et intégration sur les réseaux sociaux
- Voir la politique relative aux cookies de chaque plateforme pour plus de détails

Nous ne contrôlons pas ces cookies tiers. Veuillez consulter leurs politiques de confidentialité pour plus d'informations.`,
        },
        {
          title: "7. Confidentialité des données avec les cookies",
          content: `Les cookies peuvent contenir ou être liés à des informations personnelles. Nous traitons toutes les données de cookies conformément à notre Politique de confidentialité:
- Les cookies sont chiffrés en transit et au repos
- Les données de cookies ne sont pas partagées avec des tiers à des fins marketing
- Vous pouvez demander la suppression des données de cookies à tout moment
- Nous respectons la LPRPDE et autres lois applicables sur la confidentialité`,
        },
        {
          title: "8. Conformité gouvernementale",
          content: `En tant que plateforme servant les fonctionnaires fédéraux canadiens, nous assurons:
- Conformité avec les politiques de sécurité informatique du Conseil du Trésor
- Aucun suivi de l'activité des employés du gouvernement au-delà de ce qui est nécessaire
- Gestion sécurisée des cookies conformément aux lois canadiennes sur la confidentialité
- Divulgation claire de tous les suivis et analyses
- Option d'utiliser la plateforme avec un minimum de cookies`,
        },
        {
          title: "9. Modifications de cette politique",
          content: `Nous pouvons mettre à jour cette Politique relative aux cookies de temps à autre pour refléter les changements dans nos pratiques ou notre technologie. Nous vous notifierons des changements importants par courriel ou notification de plateforme. Votre utilisation continue de Lingueefy après les changements constitue l'acceptation de la politique mise à jour.`,
        },
        {
          title: "10. Nous contacter",
          content: `Pour des questions sur notre utilisation des cookies ou pour gérer vos préférences en matière de cookies, veuillez nous contacter à:
- Courriel: admin@rusingacademy.ca
- Adresse: Rusinga International Consulting Ltd. (RusingAcademy), Ottawa, Ontario, Canada

Nous visons à répondre aux demandes liées aux cookies dans les 5 jours ouvrables.`,
        },
      ],
    },
  };

  const l = content[language];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{l.title}</h1>
              <p className="text-lg text-muted-foreground">{l.lastUpdated}</p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 lg:py-16">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Intro */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {l.intro}
                  </p>
                </CardContent>
              </Card>

              {/* Sections */}
              {l.sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {section.content.split('\n\n').map((paragraph, pIdx) => (
                          <p key={pIdx} className="text-base leading-relaxed text-muted-foreground mb-4 last:mb-0">
                            {paragraph.split('\n').map((line, lIdx) => (
                              <span key={lIdx}>
                                {line}
                                {lIdx < paragraph.split('\n').length - 1 && <br />}
                              </span>
                            ))}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Contact Section */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'en' ? 'Questions About Cookies?' : 'Des questions sur les cookies?'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-muted-foreground mb-4">
                    {language === 'en'
                      ? 'We are committed to transparency about how we use cookies. If you have any questions or concerns, please do not hesitate to contact us.'
                      : 'Nous nous engageons à être transparents sur la façon dont nous utilisons les cookies. Si vous avez des questions ou des préoccupations, n\'hésitez pas à nous contacter.'}
                  </p>
                  <a
                    href="mailto:admin@rusingacademy.ca"
                    className="text-primary hover:underline font-medium"
                  >
                    admin@rusingacademy.ca
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
