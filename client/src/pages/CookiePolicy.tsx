import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";

const translations = {
  en: {
    title: "Cookie Policy",
    lastUpdated: "Last updated: January 7, 2026",
    intro: "This Cookie Policy explains how Lingueefy, operated by Rusinga International Consulting Ltd. (commercially known as RusingAcademy) (\"we\", \"us\", or \"our\"), uses cookies and similar technologies when you visit our website.",
    sections: [
      {
        title: "What Are Cookies?",
        content: "Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They help the website remember your preferences and improve your browsing experience. Cookies can be \"session\" cookies (deleted when you close your browser) or \"persistent\" cookies (remain on your device for a set period)."
      },
      {
        title: "How We Use Cookies",
        content: "We use cookies for the following purposes:",
        list: [
          "**Essential Cookies**: These are necessary for the website to function properly. They enable core features like user authentication, session management, and security. Without these cookies, the website cannot operate correctly.",
          "**Preference Cookies**: These remember your choices, such as your language preference (English or French), to provide a more personalized experience.",
          "**Analytics Cookies**: These help us understand how visitors interact with our website by collecting anonymous information about page visits, traffic sources, and user behavior. We use this data to improve our services.",
          "**Functionality Cookies**: These enable enhanced features like remembering your login status, your dashboard preferences, and your progress in courses or sessions."
        ]
      },
      {
        title: "Types of Cookies We Use",
        content: "",
        table: [
          { name: "Session Cookie", purpose: "Maintains your login session", duration: "Session", type: "Essential" },
          { name: "Language Preference", purpose: "Remembers your language choice (EN/FR)", duration: "1 year", type: "Preference" },
          { name: "Analytics", purpose: "Anonymous usage statistics", duration: "2 years", type: "Analytics" },
          { name: "Theme Preference", purpose: "Remembers light/dark mode choice", duration: "1 year", type: "Preference" }
        ]
      },
      {
        title: "Third-Party Cookies",
        content: "We may use third-party services that set their own cookies:",
        list: [
          "**Stripe**: For secure payment processing. Stripe's cookies help prevent fraud and ensure secure transactions.",
          "**YouTube**: If you watch embedded coach introduction videos, YouTube may set cookies to track video playback.",
          "**Google Analytics**: To understand website traffic and user behavior (anonymized data only)."
        ]
      },
      {
        title: "Managing Cookies",
        content: "You can control and manage cookies in several ways:",
        list: [
          "**Browser Settings**: Most browsers allow you to refuse or delete cookies through their settings. Note that disabling essential cookies may affect website functionality.",
          "**Cookie Consent**: When you first visit our website, you can choose which types of cookies to accept through our cookie consent banner.",
          "**Opt-Out Links**: For third-party analytics, you can opt out through their respective websites (e.g., Google Analytics Opt-out Browser Add-on)."
        ]
      },
      {
        title: "Your Rights",
        content: "Under Canadian privacy law (PIPEDA) and other applicable regulations, you have the right to:",
        list: [
          "Know what cookies we use and why",
          "Refuse non-essential cookies",
          "Delete cookies from your device at any time",
          "Request information about the data we collect"
        ]
      },
      {
        title: "Updates to This Policy",
        content: "We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any significant changes by posting the new policy on this page with an updated \"Last updated\" date."
      },
      {
        title: "Contact Us",
        content: "If you have questions about our use of cookies or this policy, please contact us at:",
        contact: {
          email: "admin@rusingacademy.ca",
          company: "Rusinga International Consulting Ltd. (RusingAcademy)",
          address: "Ottawa, Ontario, Canada"
        }
      }
    ],
    tableHeaders: {
      name: "Cookie Name",
      purpose: "Purpose",
      duration: "Duration",
      type: "Type"
    }
  },
  fr: {
    title: "Politique de cookies",
    lastUpdated: "Dernière mise à jour : 7 janvier 2026",
    intro: "Cette politique de cookies explique comment Lingueefy, exploité par Rusinga International Consulting Ltd. (commercialement connue sous le nom de RusingAcademy) (« nous », « notre » ou « nos »), utilise les cookies et technologies similaires lorsque vous visitez notre site Web.",
    sections: [
      {
        title: "Que sont les cookies?",
        content: "Les cookies sont de petits fichiers texte stockés sur votre appareil (ordinateur, tablette ou téléphone mobile) lorsque vous visitez un site Web. Ils aident le site à mémoriser vos préférences et à améliorer votre expérience de navigation. Les cookies peuvent être des cookies de « session » (supprimés à la fermeture du navigateur) ou des cookies « persistants » (restent sur votre appareil pendant une période définie)."
      },
      {
        title: "Comment nous utilisons les cookies",
        content: "Nous utilisons les cookies aux fins suivantes :",
        list: [
          "**Cookies essentiels** : Nécessaires au bon fonctionnement du site Web. Ils permettent des fonctionnalités de base comme l'authentification des utilisateurs, la gestion des sessions et la sécurité.",
          "**Cookies de préférence** : Mémorisent vos choix, comme votre préférence linguistique (anglais ou français), pour offrir une expérience plus personnalisée.",
          "**Cookies analytiques** : Nous aident à comprendre comment les visiteurs interagissent avec notre site en collectant des informations anonymes sur les visites de pages et le comportement des utilisateurs.",
          "**Cookies de fonctionnalité** : Permettent des fonctionnalités améliorées comme la mémorisation de votre statut de connexion et vos préférences de tableau de bord."
        ]
      },
      {
        title: "Types de cookies que nous utilisons",
        content: "",
        table: [
          { name: "Cookie de session", purpose: "Maintient votre session de connexion", duration: "Session", type: "Essentiel" },
          { name: "Préférence linguistique", purpose: "Mémorise votre choix de langue (EN/FR)", duration: "1 an", type: "Préférence" },
          { name: "Analytique", purpose: "Statistiques d'utilisation anonymes", duration: "2 ans", type: "Analytique" },
          { name: "Préférence de thème", purpose: "Mémorise le choix mode clair/sombre", duration: "1 an", type: "Préférence" }
        ]
      },
      {
        title: "Cookies tiers",
        content: "Nous pouvons utiliser des services tiers qui définissent leurs propres cookies :",
        list: [
          "**Stripe** : Pour le traitement sécurisé des paiements. Les cookies de Stripe aident à prévenir la fraude et à assurer des transactions sécurisées.",
          "**YouTube** : Si vous regardez des vidéos d'introduction de coachs intégrées, YouTube peut définir des cookies pour suivre la lecture vidéo.",
          "**Google Analytics** : Pour comprendre le trafic du site Web et le comportement des utilisateurs (données anonymisées uniquement)."
        ]
      },
      {
        title: "Gestion des cookies",
        content: "Vous pouvez contrôler et gérer les cookies de plusieurs façons :",
        list: [
          "**Paramètres du navigateur** : La plupart des navigateurs vous permettent de refuser ou de supprimer les cookies via leurs paramètres. Notez que la désactivation des cookies essentiels peut affecter la fonctionnalité du site.",
          "**Consentement aux cookies** : Lors de votre première visite sur notre site, vous pouvez choisir quels types de cookies accepter via notre bannière de consentement.",
          "**Liens de désinscription** : Pour les analyses tierces, vous pouvez vous désinscrire via leurs sites respectifs."
        ]
      },
      {
        title: "Vos droits",
        content: "En vertu de la loi canadienne sur la protection de la vie privée (LPRPDE) et d'autres réglementations applicables, vous avez le droit de :",
        list: [
          "Savoir quels cookies nous utilisons et pourquoi",
          "Refuser les cookies non essentiels",
          "Supprimer les cookies de votre appareil à tout moment",
          "Demander des informations sur les données que nous collectons"
        ]
      },
      {
        title: "Mises à jour de cette politique",
        content: "Nous pouvons mettre à jour cette politique de cookies de temps à autre pour refléter les changements dans nos pratiques ou pour des raisons juridiques, opérationnelles ou réglementaires. Nous vous informerons de tout changement significatif en publiant la nouvelle politique sur cette page avec une date de « Dernière mise à jour » actualisée."
      },
      {
        title: "Nous contacter",
        content: "Si vous avez des questions sur notre utilisation des cookies ou cette politique, veuillez nous contacter à :",
        contact: {
          email: "admin@rusingacademy.ca",
          company: "Rusinga International Consulting Ltd. (RusingAcademy)",
          address: "Ottawa, Ontario, Canada"
        }
      }
    ],
    tableHeaders: {
      name: "Nom du cookie",
      purpose: "Objectif",
      duration: "Durée",
      type: "Type"
    }
  }
};

export default function CookiePolicy() {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      
      <main className="flex-1 py-16" id="main-content">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t.title}</h1>
          <p className="text-muted-foreground mb-8">{t.lastUpdated}</p>
          
          <p className="text-muted-foreground mb-12 leading-relaxed">{t.intro}</p>
          
          {t.sections.map((section, index) => (
            <section key={index} className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{section.title}</h2>
              
              {section.content && (
                <p className="text-muted-foreground mb-4 leading-relaxed">{section.content}</p>
              )}
              
              {section.list && (
                <ul className="space-y-3 mb-4">
                  {section.list.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/30">
                      <span dangerouslySetInnerHTML={{ 
                        __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') 
                      }} />
                    </li>
                  ))}
                </ul>
              )}
              
              {section.table && (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 text-foreground font-medium border border-border">{t.tableHeaders.name}</th>
                        <th className="text-left p-3 text-foreground font-medium border border-border">{t.tableHeaders.purpose}</th>
                        <th className="text-left p-3 text-foreground font-medium border border-border">{t.tableHeaders.duration}</th>
                        <th className="text-left p-3 text-foreground font-medium border border-border">{t.tableHeaders.type}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="p-3 text-muted-foreground border border-border">{row.name}</td>
                          <td className="p-3 text-muted-foreground border border-border">{row.purpose}</td>
                          <td className="p-3 text-muted-foreground border border-border">{row.duration}</td>
                          <td className="p-3 text-muted-foreground border border-border">{row.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {section.contact && (
                <div className="bg-muted/50 rounded-lg p-6">
                  <p className="text-foreground font-medium">{section.contact.company}</p>
                  <p className="text-muted-foreground">{section.contact.address}</p>
                  <a 
                    href={`mailto:${section.contact.email}`}
                    className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  >
                    {section.contact.email}
                  </a>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
