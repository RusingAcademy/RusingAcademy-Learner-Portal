import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { CheckCircle, AlertCircle } from "lucide-react";

const translations = {
  en: {
    title: "Accessibility Statement",
    lastUpdated: "Last updated: January 7, 2026",
    intro: "Lingueefy is committed to ensuring digital accessibility for all users, including Canadian federal public servants with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.",
    commitment: {
      title: "Our Commitment",
      content: "We believe that every Canadian public servant deserves equal access to language learning resources. As a platform serving the federal public service, we are committed to meeting or exceeding the accessibility requirements outlined in the Accessible Canada Act and the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA."
    },
    standards: {
      title: "Accessibility Standards",
      content: "We strive to conform to WCAG 2.1 Level AA standards. This includes:",
      items: [
        {
          title: "Perceivable",
          description: "Information and user interface components are presented in ways users can perceive.",
          features: [
            "Text alternatives for non-text content",
            "Captions and transcripts for audio/video content",
            "Content can be presented in different ways without losing meaning",
            "Content is distinguishable with sufficient color contrast"
          ]
        },
        {
          title: "Operable",
          description: "User interface components and navigation are operable by all users.",
          features: [
            "All functionality available via keyboard",
            "Users have enough time to read and use content",
            "Content does not cause seizures or physical reactions",
            "Users can easily navigate and find content"
          ]
        },
        {
          title: "Understandable",
          description: "Information and operation of the user interface are understandable.",
          features: [
            "Text is readable and understandable",
            "Content appears and operates in predictable ways",
            "Users are helped to avoid and correct mistakes",
            "Full bilingual support (English and French)"
          ]
        },
        {
          title: "Robust",
          description: "Content is robust enough to be interpreted by a wide variety of user agents.",
          features: [
            "Compatible with current and future assistive technologies",
            "Valid, semantic HTML markup",
            "ARIA attributes used appropriately",
            "Works across different browsers and devices"
          ]
        }
      ]
    },
    features: {
      title: "Accessibility Features",
      content: "Lingueefy includes the following accessibility features:",
      items: [
        "**Keyboard Navigation**: All interactive elements are accessible via keyboard. Use Tab to navigate, Enter/Space to activate, and Escape to close dialogs.",
        "**Screen Reader Support**: Our platform is compatible with popular screen readers including NVDA, JAWS, and VoiceOver.",
        "**Focus Indicators**: Visible focus indicators help keyboard users track their position on the page.",
        "**Color Contrast**: Text and interactive elements meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).",
        "**Bilingual Interface**: Complete English and French language support with easy language switching.",
        "**Resizable Text**: Content remains functional when text is resized up to 200%.",
        "**Alternative Text**: Images include descriptive alt text for screen reader users.",
        "**Form Labels**: All form fields have associated labels and clear error messages.",
        "**Skip Links**: Skip navigation links allow users to jump directly to main content.",
        "**Responsive Design**: The platform works on various devices and screen sizes."
      ]
    },
    aiAccessibility: {
      title: "SLE AI Companion AI Accessibility",
      content: "Our AI-powered practice partner includes accessibility considerations:",
      items: [
        "Text-based chat interface compatible with screen readers",
        "Transcripts available for voice practice sessions",
        "Adjustable response timing for users who need more time",
        "Clear visual and text indicators for AI responses"
      ]
    },
    limitations: {
      title: "Known Limitations",
      content: "While we strive for full accessibility, some areas are still being improved:",
      items: [
        "Some third-party embedded content (YouTube videos) may have limited accessibility features",
        "Real-time video sessions depend on third-party video conferencing accessibility",
        "Some complex interactive features may require additional testing with assistive technologies"
      ]
    },
    feedback: {
      title: "Feedback and Contact",
      content: "We welcome your feedback on the accessibility of Lingueefy. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:",
      email: "admin@rusingacademy.ca",
      response: "We aim to respond to accessibility feedback within 5 business days.",
      methods: [
        "Email us at admin@rusingacademy.ca",
        "Use the contact form on our Contact page",
        "Describe the issue you encountered and the assistive technology you use"
      ]
    },
    enforcement: {
      title: "Enforcement and Compliance",
      content: "This accessibility statement is reviewed annually and updated as needed. We are committed to addressing accessibility issues promptly and maintaining compliance with the Accessible Canada Act and WCAG 2.1 Level AA standards."
    },
    resources: {
      title: "Additional Resources",
      items: [
        { name: "Web Content Accessibility Guidelines (WCAG) 2.1", url: "https://www.w3.org/WAI/WCAG21/quickref/" },
        { name: "Accessible Canada Act", url: "https://www.canada.ca/en/employment-social-development/programs/accessible-canada.html" },
        { name: "Government of Canada Web Standards", url: "https://www.canada.ca/en/treasury-board-secretariat/services/government-communications/federal-identity-program/technical-specifications/web-standards.html" }
      ]
    }
  },
  fr: {
    title: "Déclaration d'accessibilité",
    lastUpdated: "Dernière mise à jour : 7 janvier 2026",
    intro: "Lingueefy s'engage à assurer l'accessibilité numérique pour tous les utilisateurs, y compris les fonctionnaires fédéraux canadiens en situation de handicap. Nous améliorons continuellement l'expérience utilisateur pour tous et appliquons les normes d'accessibilité pertinentes.",
    commitment: {
      title: "Notre engagement",
      content: "Nous croyons que chaque fonctionnaire canadien mérite un accès égal aux ressources d'apprentissage des langues. En tant que plateforme au service de la fonction publique fédérale, nous nous engageons à respecter ou à dépasser les exigences d'accessibilité énoncées dans la Loi canadienne sur l'accessibilité et les Règles pour l'accessibilité des contenus Web (WCAG) 2.1 niveau AA."
    },
    standards: {
      title: "Normes d'accessibilité",
      content: "Nous nous efforçons de nous conformer aux normes WCAG 2.1 niveau AA. Cela comprend :",
      items: [
        {
          title: "Perceptible",
          description: "L'information et les composants de l'interface utilisateur sont présentés de manière à ce que les utilisateurs puissent les percevoir.",
          features: [
            "Alternatives textuelles pour le contenu non textuel",
            "Sous-titres et transcriptions pour le contenu audio/vidéo",
            "Le contenu peut être présenté de différentes manières sans perdre son sens",
            "Le contenu est distinguable avec un contraste de couleur suffisant"
          ]
        },
        {
          title: "Utilisable",
          description: "Les composants de l'interface utilisateur et la navigation sont utilisables par tous les utilisateurs.",
          features: [
            "Toutes les fonctionnalités accessibles au clavier",
            "Les utilisateurs ont suffisamment de temps pour lire et utiliser le contenu",
            "Le contenu ne provoque pas de crises ou de réactions physiques",
            "Les utilisateurs peuvent facilement naviguer et trouver le contenu"
          ]
        },
        {
          title: "Compréhensible",
          description: "L'information et le fonctionnement de l'interface utilisateur sont compréhensibles.",
          features: [
            "Le texte est lisible et compréhensible",
            "Le contenu apparaît et fonctionne de manière prévisible",
            "Les utilisateurs sont aidés à éviter et corriger les erreurs",
            "Support bilingue complet (anglais et français)"
          ]
        },
        {
          title: "Robuste",
          description: "Le contenu est suffisamment robuste pour être interprété par une grande variété d'agents utilisateurs.",
          features: [
            "Compatible avec les technologies d'assistance actuelles et futures",
            "Balisage HTML valide et sémantique",
            "Attributs ARIA utilisés de manière appropriée",
            "Fonctionne sur différents navigateurs et appareils"
          ]
        }
      ]
    },
    features: {
      title: "Fonctionnalités d'accessibilité",
      content: "Lingueefy comprend les fonctionnalités d'accessibilité suivantes :",
      items: [
        "**Navigation au clavier** : Tous les éléments interactifs sont accessibles au clavier. Utilisez Tab pour naviguer, Entrée/Espace pour activer et Échap pour fermer les dialogues.",
        "**Support des lecteurs d'écran** : Notre plateforme est compatible avec les lecteurs d'écran populaires, notamment NVDA, JAWS et VoiceOver.",
        "**Indicateurs de focus** : Des indicateurs de focus visibles aident les utilisateurs du clavier à suivre leur position sur la page.",
        "**Contraste des couleurs** : Le texte et les éléments interactifs respectent les exigences de contraste WCAG AA (4,5:1 pour le texte normal, 3:1 pour le grand texte).",
        "**Interface bilingue** : Support complet en anglais et en français avec changement de langue facile.",
        "**Texte redimensionnable** : Le contenu reste fonctionnel lorsque le texte est agrandi jusqu'à 200 %.",
        "**Texte alternatif** : Les images incluent un texte alt descriptif pour les utilisateurs de lecteurs d'écran.",
        "**Étiquettes de formulaire** : Tous les champs de formulaire ont des étiquettes associées et des messages d'erreur clairs.",
        "**Liens de saut** : Les liens de navigation de saut permettent aux utilisateurs d'accéder directement au contenu principal.",
        "**Design responsive** : La plateforme fonctionne sur divers appareils et tailles d'écran."
      ]
    },
    aiAccessibility: {
      title: "Accessibilité de SLE AI Companion IA",
      content: "Notre partenaire de pratique alimenté par l'IA inclut des considérations d'accessibilité :",
      items: [
        "Interface de chat textuelle compatible avec les lecteurs d'écran",
        "Transcriptions disponibles pour les sessions de pratique vocale",
        "Temps de réponse ajustable pour les utilisateurs qui ont besoin de plus de temps",
        "Indicateurs visuels et textuels clairs pour les réponses de l'IA"
      ]
    },
    limitations: {
      title: "Limitations connues",
      content: "Bien que nous nous efforcions d'atteindre une accessibilité complète, certains domaines sont encore en cours d'amélioration :",
      items: [
        "Certains contenus tiers intégrés (vidéos YouTube) peuvent avoir des fonctionnalités d'accessibilité limitées",
        "Les sessions vidéo en temps réel dépendent de l'accessibilité des vidéoconférences tierces",
        "Certaines fonctionnalités interactives complexes peuvent nécessiter des tests supplémentaires avec des technologies d'assistance"
      ]
    },
    feedback: {
      title: "Commentaires et contact",
      content: "Nous accueillons vos commentaires sur l'accessibilité de Lingueefy. Si vous rencontrez des obstacles à l'accessibilité ou avez des suggestions d'amélioration, veuillez nous contacter :",
      email: "admin@rusingacademy.ca",
      response: "Nous visons à répondre aux commentaires sur l'accessibilité dans les 5 jours ouvrables.",
      methods: [
        "Envoyez-nous un courriel à admin@rusingacademy.ca",
        "Utilisez le formulaire de contact sur notre page Contact",
        "Décrivez le problème rencontré et la technologie d'assistance que vous utilisez"
      ]
    },
    enforcement: {
      title: "Application et conformité",
      content: "Cette déclaration d'accessibilité est révisée annuellement et mise à jour au besoin. Nous nous engageons à traiter rapidement les problèmes d'accessibilité et à maintenir la conformité avec la Loi canadienne sur l'accessibilité et les normes WCAG 2.1 niveau AA."
    },
    resources: {
      title: "Ressources supplémentaires",
      items: [
        { name: "Règles pour l'accessibilité des contenus Web (WCAG) 2.1", url: "https://www.w3.org/WAI/WCAG21/quickref/" },
        { name: "Loi canadienne sur l'accessibilité", url: "https://www.canada.ca/fr/emploi-developpement-social/programmes/canada-accessible.html" },
        { name: "Normes Web du gouvernement du Canada", url: "https://www.canada.ca/fr/secretariat-conseil-tresor/services/communications-gouvernementales/programme-federal-image-marque/specifications-techniques/normes-web.html" }
      ]
    }
  }
};

export default function Accessibility() {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      
      <main className="flex-1 py-16" id="main-content">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t.title}</h1>
          <p className="text-muted-foreground mb-8">{t.lastUpdated}</p>
          
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">{t.intro}</p>
          
          {/* Commitment */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t.commitment.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{t.commitment.content}</p>
          </section>
          
          {/* Standards */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t.standards.title}</h2>
            <p className="text-muted-foreground mb-6">{t.standards.content}</p>
            <div className="grid md:grid-cols-2 gap-6">
              {t.standards.items.map((item, index) => (
                <div key={index} className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <ul className="space-y-2">
                    {item.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          
          {/* Features */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t.features.title}</h2>
            <p className="text-muted-foreground mb-6">{t.features.content}</p>
            <ul className="space-y-3">
              {t.features.items.map((item, index) => (
                <li key={index} className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/30">
                  <span dangerouslySetInnerHTML={{ 
                    __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') 
                  }} />
                </li>
              ))}
            </ul>
          </section>
          
          {/* AI Accessibility */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t.aiAccessibility.title}</h2>
            <p className="text-muted-foreground mb-4">{t.aiAccessibility.content}</p>
            <ul className="space-y-2">
              {t.aiAccessibility.items.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          
          {/* Limitations */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t.limitations.title}</h2>
            <p className="text-muted-foreground mb-4">{t.limitations.content}</p>
            <ul className="space-y-2">
              {t.limitations.items.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          
          {/* Feedback */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t.feedback.title}</h2>
            <p className="text-muted-foreground mb-4">{t.feedback.content}</p>
            <div className="bg-primary/5 rounded-lg p-6 mb-4">
              <a 
                href={`mailto:${t.feedback.email}`}
                className="text-primary text-lg font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
              >
                {t.feedback.email}
              </a>
              <p className="text-sm text-muted-foreground mt-2">{t.feedback.response}</p>
            </div>
            <ul className="space-y-2">
              {t.feedback.methods.map((method, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {method}
                </li>
              ))}
            </ul>
          </section>
          
          {/* Enforcement */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t.enforcement.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{t.enforcement.content}</p>
          </section>
          
          {/* Resources */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t.resources.title}</h2>
            <ul className="space-y-3">
              {t.resources.items.map((resource, index) => (
                <li key={index}>
                  <a 
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
