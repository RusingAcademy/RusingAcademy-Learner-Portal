import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { COACH_RATES } from "@shared/pricing";

const translations = {
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions about Lingueefy and SLE preparation",
    categories: {
      general: "General",
      sle: "SLE Exams",
      coaches: "Coaches",
      pricing: "Pricing & Payments",
      ai: "SLE AI Companion",
      compliance: "Compliance & Data",
    },
    faqs: [
      {
        category: "general",
        question: "What is Lingueefy?",
        answer: "Lingueefy is a platform for second language learning designed for Canadian federal public servants. We connect learners with specialized coaches who understand the SLE (Second Language Evaluation) exam and provide AI-powered practice tools with SLE AI Companion."
      },
      {
        category: "general",
        question: "Who is Lingueefy for?",
        answer: "Lingueefy is designed for Canadian federal public servants who need to improve their French or English proficiency for SLE exams, bilingual positions, or career advancement. Whether you're aiming for BBB, CBC, or CCC, our platform can help."
      },
      {
        category: "general",
        question: "Is Lingueefy available in both English and French?",
        answer: "Yes! Lingueefy is fully bilingual. You can switch between English and French at any time using the language toggle in the header. Our coaches are also available in both languages."
      },
      {
        category: "compliance",
        question: "Is the SLE exam recognized by the federal government?",
        answer: "Yes. The SLE (Second Language Evaluation) is the official standardized test used by the Government of Canada to assess language proficiency for federal public servants. Results are recognized across all federal departments and agencies for staffing and promotion purposes."
      },
      {
        category: "compliance",
        question: "How is my personal data handled and protected?",
        answer: "We take data security seriously. Your personal information is encrypted, stored securely, and never shared with third parties for marketing purposes. We comply with Canadian privacy laws including PIPEDA. See our Privacy Policy for complete details."
      },
      {
        category: "compliance",
        question: "Can I use Lingueefy for my department's training program?",
        answer: "Yes. We offer group rates and enterprise solutions for federal departments. We can provide invoices, documentation, and reporting for your learning and development budget. Contact us at admin@rusingacademy.ca for details."
      },
      {
        category: "compliance",
        question: "Is Lingueefy compliant with government accessibility standards?",
        answer: "Yes. We are committed to WCAG 2.1 Level AA accessibility standards and comply with the Accessible Canada Act. Our platform is fully accessible to users with disabilities. See our Accessibility Statement for details."
      },
      {
        category: "sle",
        question: "What are SLE levels A, B, and C?",
        answer: "SLE levels measure language proficiency for federal positions: Level A is basic interaction skills, Level B is intermediate proficiency required for most bilingual positions, and Level C is advanced mastery for executive and specialized roles. Each level is tested in Reading, Writing, and Oral Interaction."
      },
      {
        category: "sle",
        question: "How does Lingueefy help with SLE preparation?",
        answer: "Our coaches specialize in SLE exam preparation and understand the Treasury Board evaluation criteria. They provide targeted practice for oral interaction, written expression, and reading comprehension. SLE AI Companion offers practice with realistic exam simulations."
      },
      {
        category: "sle",
        question: "Can I practice SLE oral exams on Lingueefy?",
        answer: "Yes. SLE AI Companion provides oral exam simulations for levels A, B, and C. You can practice anytime and receive feedback. Our human coaches also conduct mock oral exams during sessions."
      },
      {
        category: "sle",
        question: "What happens to my SLE exam results and scores?",
        answer: "Your exam results are kept confidential and stored securely. We do not share your scores with third parties without your consent. You control who can see your results. See our Privacy Policy for details on how we handle exam data."
      },
      {
        category: "coaches",
        question: "How are Lingueefy coaches selected?",
        answer: "All coaches undergo a rigorous vetting process. We verify their language proficiency, teaching experience, and understanding of the SLE exam format. Many of our coaches are former federal employees or certified language instructors with proven track records."
      },
      {
        category: "coaches",
        question: "Can I choose my own coach?",
        answer: "Yes! You can browse coach profiles, watch their introduction videos, read reviews from other learners, and book trial sessions before committing. Filter by specialization, availability, price, and language to find a coach suited to your needs."
      },
      {
        category: "coaches",
        question: "What if I'm not satisfied with my coach?",
        answer: "Your satisfaction is important. If you're not happy with a coach after your trial session, you can easily switch to another coach at no additional cost. We also offer refunds for unused sessions."
      },
      {
        category: "pricing",
        question: "How much does Lingueefy cost?",
        answer: `Coaches set their own rates, typically ranging from ${COACH_RATES.RANGE_DISPLAY} CAD per hour. Trial sessions are available at reduced rates. SLE AI Companion is included with your account at no extra charge for basic practice.`
      },
      {
        category: "pricing",
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express) through our secure Stripe payment system. Payments are processed in Canadian dollars."
      },
      {
        category: "pricing",
        question: "Can my department pay for Lingueefy?",
        answer: "Yes! Many federal departments cover language training costs. We can provide invoices and documentation for your learning and development budget. Contact us for group rates and enterprise solutions."
      },
      {
        category: "ai",
        question: "What is SLE AI Companion?",
        answer: "SLE AI Companion is an AI-powered language practice tool. It offers voice conversation practice, SLE placement tests to assess your current level, and oral exam simulations. Practice anytime, at your own pace."
      },
      {
        category: "ai",
        question: "Can SLE AI Companion replace human coaches?",
        answer: "SLE AI Companion is designed to complement human coaches. Use AI for practice between coaching sessions. Human coaches provide personalized feedback, cultural context, and exam strategies that AI cannot replicate."
      },
      {
        category: "ai",
        question: "Is SLE AI Companion accurate for SLE preparation?",
        answer: "SLE AI Companion is trained on SLE exam formats and federal workplace scenarios. It provides practice and feedback. We recommend combining AI practice with human coaching for comprehensive preparation."
      },
    ],
    contact: {
      title: "Still have questions?",
      description: "Our team is here to help. Reach out and we'll get back to you as soon as possible.",
      button: "Contact Us"
    }
  },
  fr: {
    title: "Foire aux questions",
    subtitle: "Trouvez des réponses aux questions courantes sur Lingueefy et la préparation aux ELS",
    categories: {
      general: "Général",
      sle: "Examens ELS",
      coaches: "Coachs",
      pricing: "Tarifs et paiements",
      ai: "SLE AI Companion",
      compliance: "Conformité et données",
    },
    faqs: [
      {
        category: "general",
        question: "Qu'est-ce que Lingueefy?",
        answer: "Lingueefy est une plateforme d'apprentissage des langues secondes conçue pour les fonctionnaires fédéraux canadiens. Nous connectons les apprenants avec des coachs spécialisés qui comprennent l'examen ELS (Évaluation de langue seconde) et offrons des outils de pratique alimentés par l'IA avec SLE AI Companion."
      },
      {
        category: "general",
        question: "À qui s'adresse Lingueefy?",
        answer: "Lingueefy est conçu pour les fonctionnaires fédéraux canadiens qui doivent améliorer leur maîtrise du français ou de l'anglais pour les examens ELS, les postes bilingues ou l'avancement de carrière. Que vous visiez BBB, CBC ou CCC, notre plateforme peut vous aider."
      },
      {
        category: "general",
        question: "Lingueefy est-il disponible en anglais et en français?",
        answer: "Oui! Lingueefy est entièrement bilingue. Vous pouvez passer de l'anglais au français à tout moment en utilisant le bouton de langue dans l'en-tête. Nos coachs sont également disponibles dans les deux langues."
      },
      {
        category: "compliance",
        question: "L'examen ELS est-il reconnu par le gouvernement fédéral?",
        answer: "Oui. L'ELS (Évaluation de langue seconde) est le test normalisé officiel utilisé par le gouvernement du Canada pour évaluer la compétence linguistique des fonctionnaires fédéraux. Les résultats sont reconnus dans tous les ministères et organismes fédéraux à des fins de dotation et de promotion."
      },
      {
        category: "compliance",
        question: "Comment mes données personnelles sont-elles traitées et protégées?",
        answer: "Nous prenons la sécurité des données au sérieux. Vos informations personnelles sont chiffrées, stockées de manière sécurisée et ne sont jamais partagées avec des tiers à des fins marketing. Nous respectons les lois canadiennes sur la confidentialité, notamment la LPRPDE. Voir notre Politique de confidentialité pour plus de détails."
      },
      {
        category: "compliance",
        question: "Puis-je utiliser Lingueefy pour le programme de formation de mon ministère?",
        answer: "Oui. Nous offrons des tarifs de groupe et des solutions d'entreprise pour les ministères fédéraux. Nous pouvons fournir des factures, de la documentation et des rapports pour votre budget d'apprentissage et de développement. Contactez-nous à admin@rusingacademy.ca pour plus de détails."
      },
      {
        category: "compliance",
        question: "Lingueefy est-il conforme aux normes gouvernementales d'accessibilité?",
        answer: "Oui. Nous nous engageons à respecter les normes d'accessibilité WCAG 2.1 niveau AA et à respecter la Loi canadienne sur l'accessibilité. Notre plateforme est entièrement accessible aux utilisateurs en situation de handicap. Voir notre Déclaration d'accessibilité pour plus de détails."
      },
      {
        category: "sle",
        question: "Que sont les niveaux ELS A, B et C?",
        answer: "Les niveaux ELS mesurent la compétence linguistique pour les postes fédéraux : le niveau A correspond aux compétences d'interaction de base, le niveau B à la maîtrise intermédiaire requise pour la plupart des postes bilingues, et le niveau C à la maîtrise avancée pour les rôles de direction et spécialisés."
      },
      {
        category: "sle",
        question: "Comment Lingueefy aide-t-il à la préparation aux ELS?",
        answer: "Nos coachs se spécialisent dans la préparation aux examens ELS et comprennent les critères d'évaluation du Conseil du Trésor. Ils offrent une pratique ciblée pour l'interaction orale, l'expression écrite et la compréhension de lecture. SLE AI Companion offre une pratique avec des simulations d'examens réalistes."
      },
      {
        category: "sle",
        question: "Puis-je pratiquer les examens oraux ELS sur Lingueefy?",
        answer: "Oui. SLE AI Companion propose des simulations d'examens oraux pour les niveaux A, B et C. Vous pouvez pratiquer à tout moment et recevoir des commentaires. Nos coachs humains conduisent également des examens oraux simulés pendant les sessions."
      },
      {
        category: "sle",
        question: "Qu'advient-il de mes résultats et scores aux examens ELS?",
        answer: "Vos résultats d'examen sont tenus confidentiels et stockés de manière sécurisée. Nous ne partageons pas vos scores avec des tiers sans votre consentement. Vous contrôlez qui peut voir vos résultats. Voir notre Politique de confidentialité pour plus de détails sur la façon dont nous traitons les données d'examen."
      },
      {
        category: "coaches",
        question: "Comment les coachs Lingueefy sont-ils sélectionnés?",
        answer: "Tous les coachs passent par un processus de vérification rigoureux. Nous vérifions leur compétence linguistique, leur expérience d'enseignement et leur compréhension du format d'examen ELS. Beaucoup de nos coachs sont d'anciens employés fédéraux ou des instructeurs de langues certifiés."
      },
      {
        category: "coaches",
        question: "Puis-je choisir mon propre coach?",
        answer: "Oui! Vous pouvez parcourir les profils des coachs, regarder leurs vidéos d'introduction, lire les avis d'autres apprenants et réserver des sessions d'essai avant de vous engager. Filtrez par spécialisation, disponibilité, prix et langue pour trouver un coach adapté à vos besoins."
      },
      {
        category: "coaches",
        question: "Que faire si je ne suis pas satisfait de mon coach?",
        answer: "Votre satisfaction est importante. Si vous n'êtes pas satisfait d'un coach après votre session d'essai, vous pouvez facilement changer de coach sans frais supplémentaires. Nous offrons également des remboursements pour les sessions non utilisées."
      },
      {
        category: "pricing",
        question: "Combien coûte Lingueefy?",
        answer: "Les coachs fixent leurs propres tarifs, généralement entre 30 et 80 $ CAD par heure. Les sessions d'essai sont disponibles à des tarifs réduits. SLE AI Companion est inclus avec votre compte sans frais supplémentaires pour la pratique de base."
      },
      {
        category: "pricing",
        question: "Quels modes de paiement acceptez-vous?",
        answer: "Nous acceptons toutes les principales cartes de crédit (Visa, Mastercard, American Express) via notre système de paiement sécurisé Stripe. Les paiements sont traités en dollars canadiens."
      },
      {
        category: "pricing",
        question: "Mon ministère peut-il payer pour Lingueefy?",
        answer: "Oui! De nombreux ministères fédéraux couvrent les coûts de formation linguistique. Nous pouvons fournir des factures et de la documentation pour votre budget d'apprentissage et de développement. Contactez-nous pour les tarifs de groupe."
      },
      {
        category: "ai",
        question: "Qu'est-ce que SLE AI Companion?",
        answer: "SLE AI Companion est un outil de pratique linguistique alimenté par l'IA. Il offre la pratique de conversation vocale, des tests de placement ELS pour évaluer votre niveau actuel et des simulations d'examens oraux. Pratiquez à tout moment, à votre rythme."
      },
      {
        category: "ai",
        question: "SLE AI Companion peut-il remplacer les coachs humains?",
        answer: "SLE AI Companion est conçu pour compléter les coachs humains. Utilisez l'IA pour la pratique entre les sessions de coaching. Les coachs humains fournissent des commentaires personnalisés et un contexte culturel que l'IA ne peut pas reproduire."
      },
      {
        category: "ai",
        question: "SLE AI Companion est-il précis pour la préparation aux ELS?",
        answer: "SLE AI Companion est formé sur les formats d'examens ELS et les scénarios de travail fédéral. Il fournit une pratique et des commentaires. Nous recommandons de combiner la pratique IA avec le coaching humain pour une préparation complète."
      },
    ],
    contact: {
      title: "Vous avez encore des questions?",
      description: "Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dès que possible.",
      button: "Nous contacter"
    }
  }
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full py-4 px-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
      >
        <span className="font-semibold text-base">{question}</span>
        <ChevronDown 
          className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  
  const content = translations[language];
  const categories = Object.entries(content.categories).map(([key, label]) => ({ key, label }));
  const filteredFaqs = content.faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="container max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
            <p className="text-lg text-muted-foreground">{content.subtitle}</p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b border-border">
          <div className="container max-w-4xl">
            <div className="flex flex-wrap gap-2">
              {categories.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  aria-pressed={selectedCategory === key}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 lg:py-16">
          <div className="container max-w-4xl">
            <div className="space-y-0 border border-border rounded-lg overflow-hidden">
              {filteredFaqs.map((faq, idx) => (
                <FAQItem key={idx} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 lg:py-16 bg-muted/50">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">{content.contact.title}</h2>
            <p className="text-lg text-muted-foreground mb-8">{content.contact.description}</p>
            <a href="https://calendly.com/steven-barholere/30min" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              {content.contact.button}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
