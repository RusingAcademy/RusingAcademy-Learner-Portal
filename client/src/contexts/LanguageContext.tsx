import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.findCoach": "Find a Coach",
    "nav.aiCoach": "SLE AI Companion",
    "nav.howItWorks": "How It Works",
    "nav.becomeCoach": "Become a Coach",
    "nav.signIn": "Sign In",
    "nav.getStarted": "Get Started",
    "nav.dashboard": "Dashboard",
    
    // Hero Section
    "hero.badge": "Canada's #1 GC/SLE Language Platform",
    "hero.title": "Fluency Your Way.",
    "hero.titleHighlight": "Results Guaranteed.",
    "hero.subtitle": "Master French or English 3–4× faster with a proven, coaching- and path-based methodology.",
    "hero.description": "Connect with specialized coaches who understand the SLE exam. Practice 24/7 with SLE AI Companion. Achieve your BBB, CBC, or CCC goals.",
    "hero.findCoach": "Find a Coach",
    "hero.tryAI": "Try SLE AI Companion",
    "hero.socialProof": "Public Servants",
    "hero.socialProofSub": "achieved their SLE goals",
    
    // AI Card
    "ai.title": "SLE AI Companion",
    "ai.subtitle": "Your 24/7 Practice Partner",
    "ai.voicePractice": "Voice Practice Sessions",
    "ai.placementTests": "SLE Placement Tests",
    "ai.examSimulations": "Oral Exam Simulations",
    "ai.startPractice": "Start Free Practice",
    
    // SLE Levels
    "sle.title": "Prepare for Any SLE Level",
    "sle.description": "Unlike general language schools that spread their focus across multiple teaching branches, our coaches are exclusively dedicated to preparing Canadian public servants for their Second Language Evaluation exams. This laser-focused specialization means every session, every exercise, and every strategy is tailored specifically to the Treasury Board's evaluation criteria.",
    "sle.levelA": "Level A",
    "sle.levelADesc": "Level A represents the foundation of your bilingual journey. At this stage, you'll develop essential interaction skills for simple workplace communication—greeting colleagues, understanding basic instructions, and participating in straightforward exchanges. Our coaches understand that building confidence at this level is crucial, and they create a supportive environment where you can practice without fear of judgment. Many of our Level A learners progress to Level B within 3-4 months.",
    "sle.levelB": "Level B",
    "sle.levelBDesc": "Level B is the most sought-after proficiency level, required for the majority of federal positions. At this intermediate stage, you'll master the ability to discuss work-related topics, write clear professional correspondence, and engage in meetings with confidence. Our specialized coaches have helped hundreds of public servants achieve their BBB designation, using proven techniques that focus on the exact scenarios you'll encounter in your SLE exam.",
    "sle.levelC": "Level C",
    "sle.levelCDesc": "Level C represents the pinnacle of language mastery—the gold standard for executive positions and specialized roles. Achieving CCC demonstrates your ability to communicate with nuance, handle complex negotiations, and lead discussions at the highest levels. Our elite coaches, many of whom have worked in senior federal positions themselves, understand the sophisticated language demands of leadership and will prepare you to excel in the most challenging evaluation scenarios.",
    "sle.skills": "Oral • Written • Reading",
    
    // How It Works
    "how.title": "How Lingueefy Works",
    "how.description": "Your journey to SLE success begins with a simple, proven process. Thousands of public servants have followed these steps to achieve their language goals—and you can too.",
    "how.step1Title": "Find Your Coach",
    "how.step1Desc": "Browse our carefully vetted network of SLE specialists. Each coach profile includes their specialization, success rates, availability, and authentic reviews from fellow public servants. Take your time to find the perfect match for your learning style and goals.",
    "how.step2Title": "Book a Session",
    "how.step2Desc": "Schedule sessions that fit your busy federal work schedule. Early mornings before meetings? Lunch breaks? Evenings after work? Weekends? Our flexible booking system adapts to your life, not the other way around.",
    "how.step3Title": "Practice with AI",
    "how.step3Desc": "Between coaching sessions, sharpen your skills 24/7 with SLE AI Companion. Simulate oral exams, practice pronunciation, and receive instant feedback—all designed specifically for the SLE format. The more you practice, the more confident you'll become.",
    "how.step4Title": "Achieve Your Goal",
    "how.step4Desc": "Watch your confidence soar as you master your target language. Pass your SLE exam, unlock new career opportunities, and join the ranks of bilingual leaders in the federal public service. Your success story starts here.",
    
    // Features
    "features.title": "Why Choose Lingueefy",
    "features.description": "We're not just another language platform. We're the only solution built from the ground up for Canadian federal public servants who need to succeed at their SLE exams.",
    "features.sleCoaches": "SLE-Specialized Coaches",
    "features.sleCoachesDesc": "Every single coach on our platform has deep expertise in Treasury Board evaluation criteria. They understand the specific competencies tested, the common pitfalls that trip up candidates, and the exact strategies that lead to success. No generic language tutors here—only SLE specialists.",
    "features.ai": "SLE AI Companion",
    "features.aiDesc": "Imagine having a patient, tireless practice partner available whenever you need them. SLE AI Companion provides unlimited oral practice, instant pronunciation feedback, and realistic exam simulations—all calibrated to the actual SLE format. Practice at 6 AM or midnight; your AI coach is always ready.",
    "features.flexible": "Flexible Scheduling",
    "features.flexibleDesc": "We know your schedule is demanding. That's why our coaches offer sessions early mornings, during lunch, after work, and on weekends. Find time slots that work for you, not against you. Your career advancement shouldn't wait for a convenient schedule.",
    "features.bilingual": "Bilingual Platform",
    "features.bilingualDesc": "Whether you're an anglophone learning French or a francophone perfecting English, our platform fully supports your journey. Native-speaking coaches ensure authentic language exposure, and our entire interface adapts to your preferred language.",
    "features.results": "Proven Results",
    "features.resultsDesc": "Numbers don't lie: 95% of our learners achieve their target SLE level. We've helped over 500 public servants advance their careers through improved language proficiency. Your success is our track record.",
    "features.federal": "Federal Context",
    "features.federalDesc": "Practice with scenarios you'll actually encounter: briefing senior officials, participating in committee meetings, drafting ministerial correspondence, delivering presentations. Our coaches prepare you for real federal workplace communication, not textbook exercises.",
    
    // CTA
    "cta.title": "Ready to Transform Your Career?",
    "cta.description": "Every day you wait is another day your career advancement is on hold. Join the hundreds of public servants who have already achieved their bilingual goals with Lingueefy. Your first step toward SLE success is just one click away.",
    "cta.findCoach": "Find Your Coach Now",
    "cta.becomeCoach": "Join Our Team",
    
    // Footer
    "footer.tagline": "Canada's premier platform for GC/SLE second language preparation.",
    "footer.forLearners": "For Learners",
    "footer.forCoaches": "For Coaches",
    "footer.company": "Company",
    "footer.findCoach": "Find a Coach",
    "footer.aiCoach": "SLE AI Companion",
    "footer.pricing": "Pricing",
    "footer.howItWorks": "How It Works",
    "footer.becomeCoach": "Become a Coach",
    "footer.resources": "Resources",
    "footer.faq": "FAQ",
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.copyright": "© 2026 Lingueefy. Part of the RusingAcademy ecosystem.",
    
    // Coaches Page
    "coaches.title": "Find Your SLE Coach",
    "coaches.description": "Browse our network of specialized coaches who understand the Canadian federal public service language requirements. Filter by level, language, and specialization.",
    "coaches.filters": "Filters",
    "coaches.clearAll": "Clear all",
    "coaches.search": "Search coaches...",
    "coaches.language": "Language",
    "coaches.allLanguages": "All Languages",
    "coaches.french": "French",
    "coaches.english": "English",
    "coaches.specialization": "SLE Specialization",
    "coaches.priceRange": "Price Range (per hour)",
    "coaches.anyPrice": "Any Price",
    "coaches.under40": "Under $40",
    "coaches.40to60": "$40 - $60",
    "coaches.over60": "Over $60",
    "coaches.found": "coaches found",
    "coaches.viewProfile": "View Profile",
    "coaches.message": "Message",
    "coaches.reviews": "reviews",
    "coaches.sessions": "sessions",
    "coaches.respondsIn": "Responds in",
    "coaches.successRate": "success rate",
    "coaches.noResults": "No coaches found",
    "coaches.noResultsDesc": "Try adjusting your filters to see more results",
    
    // Featured Coaches Section
    "coaches.badge": "Featured Coaches",
    "coaches.filterAll": "All",
    "coaches.filterFrench": "French",
    "coaches.filterEnglish": "English",
    "coaches.tryNow": "Book Now",
    "coaches.viewAll": "View All Coaches",
    
    // Featured Coaches
    "featured.title": "Meet Our Featured Coaches",
    "featured.description": "Learn from experienced SLE specialists who have helped hundreds of public servants achieve their language goals",
    "featured.stevenDesc": "Oral Exam Prep (Levels B & C) | Human-Centred Coaching. 15+ years helping public servants succeed with confidence and clarity.",
    "featured.sueanneDesc": "Structured Exam Prep | Oral & Written Precision. Methodical approach helps learners gain accuracy and results.",
    "featured.erikaDesc": "Exam Mindset | Performance Psychology. Builds emotional control, focus, and exam confidence.",
    "featured.viewProfile": "View Profile",
    "featured.viewAll": "View All Coaches",
    
    // Plans Maison Section
    "plans.badge": "Coaching Packages",
    "plans.title": "Choose Your Learning Path",
    "plans.subtitle": "Your SLE success journey is unique. Whether you thrive with flexibility or prefer a structured roadmap, we've designed options that adapt to your learning style and career timeline.",
    "plans.recommended": "Recommended",
    "plans.marketplace.title": "Marketplace",
    "plans.marketplace.subtitle": "Pay-per-session flexibility",
    "plans.marketplace.description": "Perfect for self-directed learners who want complete control. Browse our network of certified coaches, read reviews, and book sessions whenever your schedule allows. No commitments, no pressure—just quality coaching on your terms.",
    "plans.marketplace.feature1": "Choose from 7+ certified SLE specialists",
    "plans.marketplace.feature2": "Pay only for sessions you book",
    "plans.marketplace.feature3": "Cancel or reschedule freely",
    "plans.marketplace.cta": "Browse Coaches",
    "plans.maison.title": "Plans Maison",
    "plans.maison.subtitle": "Structured success programs",
    "plans.maison.description": "For learners who want a clear path to success with accountability built in. Our signature packages combine expert coaching, AI practice, and dedicated support—with a guarantee that you'll reach your target level or get your money back.",
    "plans.maison.feature1": "Guaranteed results or full refund",
    "plans.maison.feature2": "Personal success manager assigned",
    "plans.maison.feature3": "Unlimited SLE AI Companion access",
    "plans.maison.feature4": "Weekly progress reports for you & your manager",
    "plans.maison.cta": "View Plans",
    "plans.starter.name": "Starter",
    "plans.starter.description": "Ideal for those beginning their SLE journey or needing a confidence boost before their exam. 10 focused hours to build your foundation.",
    "plans.accelerator.name": "Accelerator",
    "plans.accelerator.description": "Our most popular choice for serious learners targeting a specific level. 20 intensive hours with dedicated support to fast-track your success.",
    "plans.accelerator.savings": "Save $97 vs pay-per-session",
    "plans.immersion.name": "Immersion",
    "plans.immersion.description": "The ultimate preparation for guaranteed results. 40 comprehensive hours with two specialized coaches, unlimited AI practice, and VIP support.",
    "plans.immersion.savings": "Save $383 vs pay-per-session",
    "plans.mostPopular": "Most Popular",
    "plans.getStarted": "Start Your Journey",
    "plans.guarantee1": "100% Satisfaction Guaranteed",
    "plans.guarantee2": "Results in 3-4 Months",
    "plans.guarantee3": "Treasury Board Certified Coaches",
    
    // Transformation Section
    "transformation.title": "Your Transformation: From Doubt to Mastery",
    "transformation.lead": "See the journey that hundreds of Canadian public servants have taken—from uncertainty to SLE confidence.",
    "transformation.before": "BEFORE",
    "transformation.after": "AFTER",
    "transformation.before1": "Nervous & Uncertain",
    "transformation.after1": "Calm, Structured & Confident",
    "transformation.before2": "Mental Translation in Real-time",
    "transformation.after2": "Thinking & Reacting in French",
    "transformation.before3": "Memorizing Phrases",
    "transformation.after3": "Natural & Spontaneous Expression",
    "transformation.before4": "Avoiding French Meetings",
    "transformation.after4": "Leading Meetings with Authority",
    "transformation.before5": "Doubting Yourself",
    "transformation.after5": "Owning Your Bilingual Identity",
    
    // Common
    "common.perHour": "/hour",
    "common.trial": "Trial",
    "common.bilingual": "Bilingual",
  },
  fr: {
    // Navigation
    "nav.findCoach": "Trouver un coach",
    "nav.aiCoach": "SLE AI Companion",
    "nav.howItWorks": "Comment ça marche",
    "nav.becomeCoach": "Devenir coach",
    "nav.signIn": "Connexion",
    "nav.getStarted": "Commencer",
    "nav.dashboard": "Tableau de bord",
    
    // Hero Section
    "hero.badge": "Plateforme linguistique #1 au Canada pour le GC/ELS",
    "hero.title": "La Fluidité à Votre Façon.",
    "hero.titleHighlight": "Des Résultats Garantis.",
    "hero.subtitle": "Maîtrisez le français ou l'anglais 3 à 4 fois plus vite grâce à une méthodologie éprouvée, basée sur le coaching et le parcours.",
    "hero.description": "Connectez-vous avec des coachs spécialisés qui comprennent l'examen ELS. Pratiquez 24h/24 avec SLE AI Companion. Atteignez vos objectifs BBB, CBC ou CCC.",
    "hero.findCoach": "Trouver un coach",
    "hero.tryAI": "Essayer SLE AI Companion",
    "hero.socialProof": "Fonctionnaires",
    "hero.socialProofSub": "ont atteint leurs objectifs ELS",
    
    // AI Card
    "ai.title": "SLE AI Companion",
    "ai.subtitle": "Votre partenaire de pratique 24h/24",
    "ai.voicePractice": "Sessions de pratique vocale",
    "ai.placementTests": "Tests de classement ELS",
    "ai.examSimulations": "Simulations d'examen oral",
    "ai.startPractice": "Commencer la pratique gratuite",
    
    // SLE Levels
    "sle.title": "Préparez-vous pour tout niveau ELS",
    "sle.description": "Contrairement aux écoles de langues généralistes qui dispersent leur attention entre plusieurs branches d'enseignement, nos coachs sont exclusivement dédiés à la préparation des fonctionnaires canadiens à leurs examens d'Évaluation de langue seconde. Cette spécialisation ciblée signifie que chaque session, chaque exercice et chaque stratégie est adaptée spécifiquement aux critères d'évaluation du Conseil du Trésor.",
    "sle.levelA": "Niveau A",
    "sle.levelADesc": "Le niveau A représente le fondement de votre parcours bilingue. À ce stade, vous développerez des compétences d'interaction essentielles pour la communication simple au travail—saluer vos collègues, comprendre des instructions de base et participer à des échanges simples. Nos coachs comprennent que bâtir la confiance à ce niveau est crucial, et ils créent un environnement bienveillant où vous pouvez pratiquer sans crainte de jugement. Beaucoup de nos apprenants de niveau A progressent vers le niveau B en 3-4 mois.",
    "sle.levelB": "Niveau B",
    "sle.levelBDesc": "Le niveau B est le niveau de compétence le plus recherché, requis pour la majorité des postes fédéraux. À ce stade intermédiaire, vous maîtriserez la capacité de discuter de sujets liés au travail, rédiger une correspondance professionnelle claire et participer aux réunions avec confiance. Nos coachs spécialisés ont aidé des centaines de fonctionnaires à obtenir leur désignation BBB, en utilisant des techniques éprouvées qui se concentrent sur les scénarios exacts que vous rencontrerez lors de votre examen ELS.",
    "sle.levelC": "Niveau C",
    "sle.levelCDesc": "Le niveau C représente le sommet de la maîtrise linguistique—l'étalon-or pour les postes de direction et les rôles spécialisés. Atteindre CCC démontre votre capacité à communiquer avec nuance, gérer des négociations complexes et mener des discussions aux plus hauts niveaux. Nos coachs d'élite, dont beaucoup ont eux-mêmes occupé des postes fédéraux de haut niveau, comprennent les exigences linguistiques sophistiquées du leadership et vous prépareront à exceller dans les scénarios d'évaluation les plus exigeants.",
    "sle.skills": "Oral • Écrit • Lecture",
    
    // How It Works
    "how.title": "Comment fonctionne Lingueefy",
    "how.description": "Votre parcours vers le succès ELS commence par un processus simple et éprouvé. Des milliers de fonctionnaires ont suivi ces étapes pour atteindre leurs objectifs linguistiques—et vous pouvez le faire aussi.",
    "how.step1Title": "Trouvez votre coach",
    "how.step1Desc": "Parcourez notre réseau soigneusement sélectionné de spécialistes ELS. Chaque profil de coach inclut sa spécialisation, ses taux de réussite, sa disponibilité et des avis authentiques de vos collègues fonctionnaires. Prenez le temps de trouver le match parfait pour votre style d'apprentissage.",
    "how.step2Title": "Réservez une session",
    "how.step2Desc": "Planifiez des sessions qui s'adaptent à votre emploi du temps chargé. Tôt le matin avant les réunions ? À l'heure du dîner ? Le soir après le travail ? Les fins de semaine ? Notre système de réservation flexible s'adapte à votre vie, pas l'inverse.",
    "how.step3Title": "Pratiquez avec l'IA",
    "how.step3Desc": "Entre les sessions de coaching, affinez vos compétences 24h/24 avec SLE AI Companion. Simulez des examens oraux, pratiquez la prononciation et recevez des commentaires instantanés—le tout conçu spécifiquement pour le format ELS. Plus vous pratiquez, plus vous gagnez en confiance.",
    "how.step4Title": "Atteignez votre objectif",
    "how.step4Desc": "Regardez votre confiance s'envoler à mesure que vous maîtrisez votre langue cible. Réussissez votre examen ELS, débloquez de nouvelles opportunités de carrière et rejoignez les rangs des leaders bilingues de la fonction publique fédérale. Votre histoire de succès commence ici.",
    
    // Features
    "features.title": "Pourquoi choisir Lingueefy",
    "features.description": "Nous ne sommes pas juste une autre plateforme de langues. Nous sommes la seule solution conçue de A à Z pour les fonctionnaires fédéraux canadiens qui doivent réussir leurs examens ELS.",
    "features.sleCoaches": "Coachs spécialisés ELS",
    "features.sleCoachesDesc": "Chaque coach sur notre plateforme possède une expertise approfondie des critères d'évaluation du Conseil du Trésor. Ils comprennent les compétences spécifiques testées, les pièges courants qui font trébucher les candidats, et les stratégies exactes qui mènent au succès. Pas de tuteurs de langues génériques ici—uniquement des spécialistes ELS.",
    "features.ai": "SLE AI Companion",
    "features.aiDesc": "Imaginez avoir un partenaire de pratique patient et infatigable disponible quand vous en avez besoin. SLE AI Companion offre une pratique orale illimitée, des commentaires instantanés sur la prononciation et des simulations d'examen réalistes—le tout calibré sur le format ELS réel. Pratiquez à 6h du matin ou à minuit; votre coach IA est toujours prêt.",
    "features.flexible": "Horaires flexibles",
    "features.flexibleDesc": "Nous savons que votre emploi du temps est exigeant. C'est pourquoi nos coachs offrent des sessions tôt le matin, à l'heure du dîner, après le travail et les fins de semaine. Trouvez des créneaux qui fonctionnent pour vous, pas contre vous. Votre avancement de carrière ne devrait pas attendre un horaire pratique.",
    "features.bilingual": "Plateforme bilingue",
    "features.bilingualDesc": "Que vous soyez anglophone apprenant le français ou francophone perfectionnant l'anglais, notre plateforme soutient pleinement votre parcours. Des coachs de langue maternelle assurent une exposition linguistique authentique, et toute notre interface s'adapte à votre langue préférée.",
    "features.results": "Résultats prouvés",
    "features.resultsDesc": "Les chiffres ne mentent pas : 95% de nos apprenants atteignent leur niveau ELS cible. Nous avons aidé plus de 500 fonctionnaires à faire avancer leur carrière grâce à une meilleure maîtrise linguistique. Votre succès est notre bilan.",
    "features.federal": "Contexte fédéral",
    "features.federalDesc": "Pratiquez avec des scénarios que vous rencontrerez réellement : breffage de hauts fonctionnaires, participation à des réunions de comité, rédaction de correspondance ministérielle, présentations. Nos coachs vous préparent à la communication réelle en milieu de travail fédéral, pas à des exercices de manuels.",
    
    // CTA
    "cta.title": "Prêt à transformer votre carrière ?",
    "cta.description": "Chaque jour que vous attendez est un jour de plus où votre avancement de carrière est en suspens. Rejoignez les centaines de fonctionnaires qui ont déjà atteint leurs objectifs bilingues avec Lingueefy. Votre premier pas vers le succès ELS n'est qu'à un clic.",
    "cta.findCoach": "Trouvez votre coach maintenant",
    "cta.becomeCoach": "Rejoignez notre équipe",
    
    // Footer
    "footer.tagline": "La plateforme de référence au Canada pour la préparation à la langue seconde GC/ELS.",
    "footer.forLearners": "Pour les apprenants",
    "footer.forCoaches": "Pour les coachs",
    "footer.company": "Entreprise",
    "footer.findCoach": "Trouver un coach",
    "footer.aiCoach": "SLE AI Companion",
    "footer.pricing": "Tarifs",
    "footer.howItWorks": "Comment ça marche",
    "footer.becomeCoach": "Devenir coach",
    "footer.resources": "Ressources",
    "footer.faq": "FAQ",
    "footer.about": "À propos",
    "footer.contact": "Contact",
    "footer.privacy": "Politique de confidentialité",
    "footer.terms": "Conditions d'utilisation",
    "footer.copyright": "© 2026 Lingueefy. Fait partie de l'écosystème RusingAcademy.",
    
    // Coaches Page
    "coaches.title": "Trouvez votre coach ELS",
    "coaches.description": "Parcourez notre réseau de coachs spécialisés qui comprennent les exigences linguistiques de la fonction publique fédérale canadienne. Filtrez par niveau, langue et spécialisation.",
    "coaches.filters": "Filtres",
    "coaches.clearAll": "Tout effacer",
    "coaches.search": "Rechercher des coachs...",
    "coaches.language": "Langue",
    "coaches.allLanguages": "Toutes les langues",
    "coaches.french": "Français",
    "coaches.english": "Anglais",
    "coaches.specialization": "Spécialisation ELS",
    "coaches.priceRange": "Fourchette de prix (par heure)",
    "coaches.anyPrice": "Tout prix",
    "coaches.under40": "Moins de 40 $",
    "coaches.40to60": "40 $ - 60 $",
    "coaches.over60": "Plus de 60 $",
    "coaches.found": "coachs trouvés",
    "coaches.viewProfile": "Voir le profil",
    "coaches.message": "Message",
    "coaches.reviews": "avis",
    "coaches.sessions": "sessions",
    "coaches.respondsIn": "Répond en",
    "coaches.successRate": "taux de réussite",
    "coaches.noResults": "Aucun coach trouvé",
    "coaches.noResultsDesc": "Essayez d'ajuster vos filtres pour voir plus de résultats",
    
    // Featured Coaches Section
    "coaches.badge": "Coachs en vedette",
    "coaches.filterAll": "Tous",
    "coaches.filterFrench": "Français",
    "coaches.filterEnglish": "Anglais",
    "coaches.tryNow": "Réserver",
    "coaches.viewAll": "Voir tous les coachs",
    
    // Featured Coaches
    "featured.title": "Rencontrez nos coachs en vedette",
    "featured.description": "Apprenez auprès de spécialistes ELS expérimentés qui ont aidé des centaines de fonctionnaires à atteindre leurs objectifs linguistiques",
    "featured.stevenDesc": "Préparation à l'examen oral (Niveaux B et C) | Coaching centré sur l'humain. Plus de 15 ans à aider les fonctionnaires à réussir avec confiance et clarté.",
    "featured.sueanneDesc": "Préparation structurée aux examens | Précision orale et écrite. Une approche méthodique aide les apprenants à gagner en précision et en résultats.",
    "featured.erikaDesc": "État d'esprit d'examen | Psychologie de la performance. Développe le contrôle émotionnel, la concentration et la confiance en examen.",
    "featured.viewProfile": "Voir le profil",
    "featured.viewAll": "Voir tous les coachs",
    
    // Plans Maison Section
    "plans.badge": "Forfaits de coaching",
    "plans.title": "Choisissez votre parcours d'apprentissage",
    "plans.subtitle": "Votre parcours vers le succès ELS est unique. Que vous prospériez avec la flexibilité ou préfériez une feuille de route structurée, nous avons conçu des options qui s'adaptent à votre style d'apprentissage et à votre calendrier de carrière.",
    "plans.recommended": "Recommandé",
    "plans.marketplace.title": "Marketplace",
    "plans.marketplace.subtitle": "Flexibilité à la session",
    "plans.marketplace.description": "Parfait pour les apprenants autonomes qui veulent un contrôle total. Parcourez notre réseau de coachs certifiés, lisez les avis et réservez des sessions quand votre horaire le permet. Aucun engagement, aucune pression—juste du coaching de qualité selon vos termes.",
    "plans.marketplace.feature1": "Choisissez parmi 7+ spécialistes ELS certifiés",
    "plans.marketplace.feature2": "Payez uniquement les sessions réservées",
    "plans.marketplace.feature3": "Annulez ou reportez librement",
    "plans.marketplace.cta": "Parcourir les coachs",
    "plans.maison.title": "Plans Maison",
    "plans.maison.subtitle": "Programmes de réussite structurés",
    "plans.maison.description": "Pour les apprenants qui veulent un chemin clair vers le succès avec une responsabilisation intégrée. Nos forfaits signature combinent coaching expert, pratique IA et support dédié—avec la garantie que vous atteindrez votre niveau cible ou serez remboursé.",
    "plans.maison.feature1": "Résultats garantis ou remboursement complet",
    "plans.maison.feature2": "Gestionnaire de succès personnel assigné",
    "plans.maison.feature3": "Accès illimité à SLE AI Companion",
    "plans.maison.feature4": "Rapports de progression hebdomadaires pour vous et votre gestionnaire",
    "plans.maison.cta": "Voir les plans",
    "plans.starter.name": "Starter",
    "plans.starter.description": "Idéal pour ceux qui commencent leur parcours ELS ou ont besoin d'un boost de confiance avant leur examen. 10 heures ciblées pour bâtir vos fondations.",
    "plans.accelerator.name": "Accélérateur",
    "plans.accelerator.description": "Notre choix le plus populaire pour les apprenants sérieux visant un niveau spécifique. 20 heures intensives avec support dédié pour accélérer votre succès.",
    "plans.accelerator.savings": "Économisez 97 $ vs paiement à la session",
    "plans.immersion.name": "Immersion",
    "plans.immersion.description": "La préparation ultime pour des résultats garantis. 40 heures complètes avec deux coachs spécialisés, pratique IA illimitée et support VIP.",
    "plans.immersion.savings": "Économisez 383 $ vs paiement à la session",
    "plans.mostPopular": "Le plus populaire",
    "plans.getStarted": "Commencez votre parcours",
    "plans.guarantee1": "Satisfaction 100% garantie",
    "plans.guarantee2": "Résultats en 3-4 mois",
    "plans.guarantee3": "Coachs certifiés Conseil du Trésor",
    
    // Transformation Section
    "transformation.title": "Votre Transformation : Du Doute à la Maîtrise",
    "transformation.lead": "Découvrez le parcours que des centaines de fonctionnaires canadiens ont emprunté—de l'incertitude à la confiance ELS.",
    "transformation.before": "AVANT",
    "transformation.after": "APRÈS",
    "transformation.before1": "Nerveux et incertain",
    "transformation.after1": "Calme, structuré et confiant",
    "transformation.before2": "Traduction mentale en temps réel",
    "transformation.after2": "Penser et réagir en français",
    "transformation.before3": "Mémoriser des phrases",
    "transformation.after3": "Expression naturelle et spontanée",
    "transformation.before4": "Éviter les réunions en français",
    "transformation.after4": "Diriger les réunions avec autorité",
    "transformation.before5": "Douter de soi-même",
    "transformation.after5": "Assumer son identité bilingue",
    
    // Common
    "common.perHour": "/heure",
    "common.trial": "Essai",
    "common.bilingual": "Bilingue",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lingueefy-language');
      if (saved === 'en' || saved === 'fr') return saved;
      const browserLang = navigator.language.toLowerCase();
      return browserLang.startsWith('fr') ? 'fr' : 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('lingueefy-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
