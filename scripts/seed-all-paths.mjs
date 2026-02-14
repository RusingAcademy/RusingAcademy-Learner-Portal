/**
 * Seed All 6 Paths — Golden Template Content Population
 * 
 * Creates 6 Courses (Paths I-VI) with:
 * - 4 Modules per Course
 * - 4 Lessons per Module
 * - 7 Activities per Lesson (mandatory slots)
 * - Full bilingual EN/FR content
 * - Quiz questions for Slot 6
 * 
 * Total: 6 × 4 × 4 × 7 = 672 activities + 6 × 4 × 4 × 8 = 768 quiz questions
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

// ============================================================================
// PATH DEFINITIONS (6 Paths)
// ============================================================================

const PATHS = [
  {
    // Path I
    title: "Path I: FSL - Foundations",
    titleFr: "Path I : FLS - Fondations",
    slug: "path-i-foundations",
    description: "Build the fundamental communication skills required for basic professional interactions in the Canadian federal public service. Master essential greetings, introductions, and workplace vocabulary.",
    descriptionFr: "Développez les compétences de communication fondamentales requises pour les interactions professionnelles de base dans la fonction publique fédérale canadienne. Maîtrisez les salutations essentielles, les présentations et le vocabulaire du milieu de travail.",
    shortDescription: "Essential foundations for professional French communication in the GC workplace.",
    shortDescriptionFr: "Bases essentielles pour la communication professionnelle en français au sein du GC.",
    level: "beginner",
    category: "sle_oral",
    price: 89900,
    originalPrice: 99900,
    modules: [
      {
        title: "First Professional Steps",
        titleFr: "Premiers Pas Professionnels",
        description: "Master essential greetings, introductions, and basic workplace interactions.",
        descriptionFr: "Maîtrisez les salutations essentielles, les présentations et les interactions de base au travail.",
        lessons: [
          {
            title: "Greetings & Introductions",
            titleFr: "Salutations et Présentations",
            description: "Learn to greet colleagues and introduce yourself professionally.",
            descriptionFr: "Apprenez à saluer vos collègues et à vous présenter professionnellement.",
          },
          {
            title: "The Workplace Environment",
            titleFr: "L'Environnement de Travail",
            description: "Vocabulary and phrases for describing your office and workspace.",
            descriptionFr: "Vocabulaire et expressions pour décrire votre bureau et espace de travail.",
          },
          {
            title: "Numbers, Dates & Time",
            titleFr: "Nombres, Dates et Heure",
            description: "Master numbers, dates, and time expressions in professional contexts.",
            descriptionFr: "Maîtrisez les nombres, les dates et les expressions temporelles en contexte professionnel.",
          },
          {
            title: "Basic Requests & Politeness",
            titleFr: "Demandes de Base et Politesse",
            description: "Learn polite requests and essential courtesy phrases for the workplace.",
            descriptionFr: "Apprenez les demandes polies et les expressions de courtoisie essentielles au travail.",
          },
        ],
      },
      {
        title: "Daily Communication",
        titleFr: "Communication Quotidienne",
        description: "Develop confidence in everyday professional exchanges and routine interactions.",
        descriptionFr: "Développez votre confiance dans les échanges professionnels quotidiens et les interactions de routine.",
        lessons: [
          {
            title: "Phone Calls & Voicemail",
            titleFr: "Appels Téléphoniques et Messagerie",
            description: "Handle basic phone calls and leave professional voicemail messages.",
            descriptionFr: "Gérez les appels téléphoniques de base et laissez des messages vocaux professionnels.",
          },
          {
            title: "Email Basics",
            titleFr: "Les Bases du Courriel",
            description: "Write simple professional emails with proper salutations and closings.",
            descriptionFr: "Rédigez des courriels professionnels simples avec les salutations et formules de clôture appropriées.",
          },
          {
            title: "Scheduling & Calendar",
            titleFr: "Planification et Calendrier",
            description: "Schedule meetings, confirm appointments, and discuss availability.",
            descriptionFr: "Planifiez des réunions, confirmez des rendez-vous et discutez de la disponibilité.",
          },
          {
            title: "Small Talk & Socializing",
            titleFr: "Conversation Informelle et Socialisation",
            description: "Engage in casual workplace conversations about weather, weekends, and interests.",
            descriptionFr: "Participez à des conversations informelles au travail sur la météo, les fins de semaine et les intérêts.",
          },
        ],
      },
      {
        title: "Essential Interactions",
        titleFr: "Interactions Essentielles",
        description: "Navigate common workplace scenarios with growing confidence and accuracy.",
        descriptionFr: "Naviguez dans les scénarios courants du milieu de travail avec une confiance et une précision croissantes.",
        lessons: [
          {
            title: "Asking for Help",
            titleFr: "Demander de l'Aide",
            description: "Learn to ask for clarification, assistance, and directions in the workplace.",
            descriptionFr: "Apprenez à demander des éclaircissements, de l'aide et des directions au travail.",
          },
          {
            title: "Giving Simple Instructions",
            titleFr: "Donner des Instructions Simples",
            description: "Provide clear, step-by-step instructions to colleagues.",
            descriptionFr: "Fournissez des instructions claires, étape par étape, à vos collègues.",
          },
          {
            title: "Describing Problems",
            titleFr: "Décrire des Problèmes",
            description: "Explain basic technical or workplace issues to get support.",
            descriptionFr: "Expliquez des problèmes techniques ou de travail de base pour obtenir du soutien.",
          },
          {
            title: "Forms & Administrative Tasks",
            titleFr: "Formulaires et Tâches Administratives",
            description: "Complete common government forms and handle basic administrative tasks.",
            descriptionFr: "Remplissez les formulaires gouvernementaux courants et gérez les tâches administratives de base.",
          },
        ],
      },
      {
        title: "Towards Autonomy",
        titleFr: "Vers l'Autonomie",
        description: "Build independence in professional French communication for daily work situations.",
        descriptionFr: "Développez votre autonomie dans la communication professionnelle en français pour les situations de travail quotidiennes.",
        lessons: [
          {
            title: "Participating in Short Meetings",
            titleFr: "Participer à de Courtes Réunions",
            description: "Follow and contribute to brief team meetings and stand-ups.",
            descriptionFr: "Suivez et contribuez à de brèves réunions d'équipe et points quotidiens.",
          },
          {
            title: "Expressing Preferences & Opinions",
            titleFr: "Exprimer des Préférences et Opinions",
            description: "Share your views and preferences on simple workplace topics.",
            descriptionFr: "Partagez vos points de vue et préférences sur des sujets simples au travail.",
          },
          {
            title: "Handling Unexpected Situations",
            titleFr: "Gérer des Situations Imprévues",
            description: "Respond to unexpected changes, cancellations, and last-minute requests.",
            descriptionFr: "Répondez aux changements imprévus, annulations et demandes de dernière minute.",
          },
          {
            title: "Review & Self-Assessment",
            titleFr: "Révision et Auto-Évaluation",
            description: "Consolidate your learning and assess your progress through Path I.",
            descriptionFr: "Consolidez votre apprentissage et évaluez vos progrès à travers le Path I.",
          },
        ],
      },
    ],
  },
  {
    // Path II
    title: "Path II: FSL - Everyday Fluency",
    titleFr: "Path II : FLS - Aisance Quotidienne",
    slug: "path-ii-everyday-fluency",
    description: "Develop confidence in daily professional interactions. Learn to discuss past events, future plans, and personal opinions with increasing spontaneity and accuracy.",
    descriptionFr: "Développez votre confiance dans les interactions professionnelles quotidiennes. Apprenez à discuter d'événements passés, de projets futurs et d'opinions personnelles avec une spontanéité et une précision croissantes.",
    shortDescription: "Build everyday fluency for confident workplace communication.",
    shortDescriptionFr: "Développez une aisance quotidienne pour une communication confiante au travail.",
    level: "beginner",
    category: "sle_oral",
    price: 89900,
    originalPrice: 99900,
    modules: [
      {
        title: "Narrating Past Events",
        titleFr: "Raconter des Événements Passés",
        description: "Master past tenses to describe completed actions and recent events.",
        descriptionFr: "Maîtrisez les temps du passé pour décrire des actions terminées et des événements récents.",
        lessons: [
          { title: "The Passé Composé in Action", titleFr: "Le Passé Composé en Action", description: "Use the passé composé to describe completed workplace events.", descriptionFr: "Utilisez le passé composé pour décrire des événements de travail terminés." },
          { title: "The Imparfait for Context", titleFr: "L'Imparfait pour le Contexte", description: "Set the scene and describe ongoing past situations.", descriptionFr: "Plantez le décor et décrivez des situations passées en cours." },
          { title: "Combining Past Tenses", titleFr: "Combiner les Temps du Passé", description: "Weave together passé composé and imparfait in narratives.", descriptionFr: "Tissez ensemble le passé composé et l'imparfait dans vos récits." },
          { title: "Reporting on Meetings & Events", titleFr: "Rendre Compte de Réunions et Événements", description: "Summarize meetings and report on professional events.", descriptionFr: "Résumez des réunions et rendez compte d'événements professionnels." },
        ],
      },
      {
        title: "Planning & Future Projects",
        titleFr: "Planification et Projets Futurs",
        description: "Express future plans, intentions, and upcoming activities with confidence.",
        descriptionFr: "Exprimez vos plans futurs, intentions et activités à venir avec confiance.",
        lessons: [
          { title: "The Futur Proche", titleFr: "Le Futur Proche", description: "Express immediate plans and intentions using aller + infinitive.", descriptionFr: "Exprimez des plans et intentions immédiats en utilisant aller + infinitif." },
          { title: "The Futur Simple", titleFr: "Le Futur Simple", description: "Discuss future projects and long-term professional goals.", descriptionFr: "Discutez de projets futurs et d'objectifs professionnels à long terme." },
          { title: "Making Proposals & Suggestions", titleFr: "Faire des Propositions et Suggestions", description: "Propose ideas and suggest solutions in team discussions.", descriptionFr: "Proposez des idées et suggérez des solutions lors de discussions d'équipe." },
          { title: "Project Timelines & Deadlines", titleFr: "Échéanciers et Délais de Projets", description: "Discuss schedules, milestones, and deadlines effectively.", descriptionFr: "Discutez des calendriers, jalons et délais efficacement." },
        ],
      },
      {
        title: "Opinions & Preferences",
        titleFr: "Opinions et Préférences",
        description: "Express personal views, agree, disagree, and compare options professionally.",
        descriptionFr: "Exprimez vos points de vue personnels, soyez d'accord, en désaccord et comparez les options professionnellement.",
        lessons: [
          { title: "Expressing Opinions Politely", titleFr: "Exprimer des Opinions Poliment", description: "Share your views using diplomatic language and hedging.", descriptionFr: "Partagez vos points de vue en utilisant un langage diplomatique et des nuances." },
          { title: "Agreeing & Disagreeing", titleFr: "Être d'Accord et en Désaccord", description: "Navigate agreement and disagreement in professional settings.", descriptionFr: "Naviguez l'accord et le désaccord dans des contextes professionnels." },
          { title: "Comparing Options", titleFr: "Comparer des Options", description: "Use comparatives and superlatives to evaluate choices.", descriptionFr: "Utilisez les comparatifs et superlatifs pour évaluer les choix." },
          { title: "Justifying Decisions", titleFr: "Justifier des Décisions", description: "Explain the reasoning behind your choices and recommendations.", descriptionFr: "Expliquez le raisonnement derrière vos choix et recommandations." },
        ],
      },
      {
        title: "Routine Workplace Exchanges",
        titleFr: "Échanges de Routine au Travail",
        description: "Handle everyday workplace situations with fluency and natural expression.",
        descriptionFr: "Gérez les situations quotidiennes au travail avec aisance et expression naturelle.",
        lessons: [
          { title: "Coffee Break Conversations", titleFr: "Conversations à la Pause-Café", description: "Engage naturally in informal workplace conversations.", descriptionFr: "Participez naturellement aux conversations informelles au travail." },
          { title: "Handling Complaints & Feedback", titleFr: "Gérer les Plaintes et la Rétroaction", description: "Address concerns and provide constructive feedback.", descriptionFr: "Abordez les préoccupations et fournissez une rétroaction constructive." },
          { title: "Team Collaboration Phrases", titleFr: "Expressions de Collaboration d'Équipe", description: "Essential phrases for effective teamwork and coordination.", descriptionFr: "Expressions essentielles pour un travail d'équipe et une coordination efficaces." },
          { title: "Path II Review & Consolidation", titleFr: "Révision et Consolidation du Path II", description: "Review all key concepts and assess your everyday fluency.", descriptionFr: "Révisez tous les concepts clés et évaluez votre aisance quotidienne." },
        ],
      },
    ],
  },
  {
    // Path III
    title: "Path III: FSL - Operational French",
    titleFr: "Path III : FLS - Français Opérationnel",
    slug: "path-iii-operational-french",
    description: "Achieve functional professional autonomy. Present arguments, participate in debates, write structured reports, and handle most workplace communication situations independently.",
    descriptionFr: "Atteignez une autonomie professionnelle fonctionnelle. Présentez des arguments, participez à des débats, rédigez des rapports structurés et gérez la plupart des situations de communication au travail de manière indépendante.",
    shortDescription: "Professional communication for independent workplace autonomy.",
    shortDescriptionFr: "Communication professionnelle pour une autonomie indépendante au travail.",
    level: "intermediate",
    category: "sle_oral",
    price: 99900,
    originalPrice: 119900,
    modules: [
      {
        title: "Structured Argumentation",
        titleFr: "Argumentation Structurée",
        description: "Build and present logical arguments in professional discussions.",
        descriptionFr: "Construisez et présentez des arguments logiques dans les discussions professionnelles.",
        lessons: [
          { title: "Building a Logical Argument", titleFr: "Construire un Argument Logique", description: "Structure your ideas with clear thesis, evidence, and conclusion.", descriptionFr: "Structurez vos idées avec une thèse claire, des preuves et une conclusion." },
          { title: "Connectors & Transitions", titleFr: "Connecteurs et Transitions", description: "Use linking words to create coherent, flowing arguments.", descriptionFr: "Utilisez des mots de liaison pour créer des arguments cohérents et fluides." },
          { title: "Presenting Data & Statistics", titleFr: "Présenter des Données et Statistiques", description: "Describe trends, figures, and research findings effectively.", descriptionFr: "Décrivez les tendances, les chiffres et les résultats de recherche efficacement." },
          { title: "Defending Your Position", titleFr: "Défendre Votre Position", description: "Respond to challenges and reinforce your arguments under pressure.", descriptionFr: "Répondez aux défis et renforcez vos arguments sous pression." },
        ],
      },
      {
        title: "Professional Writing",
        titleFr: "Rédaction Professionnelle",
        description: "Produce clear, well-structured professional documents and reports.",
        descriptionFr: "Produisez des documents et rapports professionnels clairs et bien structurés.",
        lessons: [
          { title: "Report Structure & Format", titleFr: "Structure et Format de Rapport", description: "Organize reports with proper headings, sections, and conclusions.", descriptionFr: "Organisez les rapports avec des titres, sections et conclusions appropriés." },
          { title: "Meeting Minutes & Summaries", titleFr: "Comptes Rendus et Résumés de Réunion", description: "Capture key decisions and action items from meetings.", descriptionFr: "Capturez les décisions clés et les mesures à prendre lors des réunions." },
          { title: "Briefing Notes", titleFr: "Notes d'Information", description: "Write concise briefing notes for management and executives.", descriptionFr: "Rédigez des notes d'information concises pour la direction et les cadres." },
          { title: "Formal Correspondence", titleFr: "Correspondance Formelle", description: "Compose formal letters and official communications.", descriptionFr: "Composez des lettres formelles et des communications officielles." },
        ],
      },
      {
        title: "Meetings & Presentations",
        titleFr: "Réunions et Présentations",
        description: "Participate actively in meetings and deliver effective presentations.",
        descriptionFr: "Participez activement aux réunions et livrez des présentations efficaces.",
        lessons: [
          { title: "Active Meeting Participation", titleFr: "Participation Active aux Réunions", description: "Contribute meaningfully to discussions and decision-making.", descriptionFr: "Contribuez de manière significative aux discussions et à la prise de décision." },
          { title: "Presentation Skills", titleFr: "Compétences de Présentation", description: "Deliver clear, engaging presentations with visual support.", descriptionFr: "Livrez des présentations claires et engageantes avec support visuel." },
          { title: "Q&A Handling", titleFr: "Gestion des Questions-Réponses", description: "Handle questions confidently during and after presentations.", descriptionFr: "Gérez les questions avec confiance pendant et après les présentations." },
          { title: "Virtual Meeting Etiquette", titleFr: "Étiquette des Réunions Virtuelles", description: "Navigate bilingual virtual meetings with professionalism.", descriptionFr: "Naviguez les réunions virtuelles bilingues avec professionnalisme." },
        ],
      },
      {
        title: "Workplace Autonomy",
        titleFr: "Autonomie au Travail",
        description: "Handle complex workplace situations independently and professionally.",
        descriptionFr: "Gérez les situations complexes au travail de manière indépendante et professionnelle.",
        lessons: [
          { title: "Problem-Solving Discussions", titleFr: "Discussions de Résolution de Problèmes", description: "Lead and participate in problem-solving conversations.", descriptionFr: "Menez et participez à des conversations de résolution de problèmes." },
          { title: "Negotiation Basics", titleFr: "Bases de la Négociation", description: "Negotiate timelines, resources, and priorities effectively.", descriptionFr: "Négociez les échéanciers, les ressources et les priorités efficacement." },
          { title: "Cross-Cultural Communication", titleFr: "Communication Interculturelle", description: "Navigate cultural nuances in bilingual workplace settings.", descriptionFr: "Naviguez les nuances culturelles dans les milieux de travail bilingues." },
          { title: "Path III Review & Assessment", titleFr: "Révision et Évaluation du Path III", description: "Comprehensive review and self-assessment of operational French skills.", descriptionFr: "Révision complète et auto-évaluation des compétences en français opérationnel." },
        ],
      },
    ],
  },
  {
    // Path IV
    title: "Path IV: FSL - Strategic Expression",
    titleFr: "Path IV : FLS - Expression Stratégique",
    slug: "path-iv-strategic-expression",
    description: "Master precision, nuance, and leadership communication. Develop advanced grammatical structures, persuasive argumentation, and effective communication in complex professional contexts.",
    descriptionFr: "Maîtrisez la précision, la nuance et la communication de leadership. Développez des structures grammaticales avancées, l'argumentation persuasive et la communication efficace dans des contextes professionnels complexes.",
    shortDescription: "Advanced strategic communication for leadership roles.",
    shortDescriptionFr: "Communication stratégique avancée pour les rôles de leadership.",
    level: "advanced",
    category: "sle_oral",
    price: 109900,
    originalPrice: 129900,
    modules: [
      {
        title: "Advanced Grammar Mastery",
        titleFr: "Maîtrise de la Grammaire Avancée",
        description: "Master the subjunctive, conditional, and complex sentence structures.",
        descriptionFr: "Maîtrisez le subjonctif, le conditionnel et les structures de phrases complexes.",
        lessons: [
          { title: "The Subjunctive Mood", titleFr: "Le Mode Subjonctif", description: "Express doubt, desire, and necessity using the subjunctive.", descriptionFr: "Exprimez le doute, le désir et la nécessité en utilisant le subjonctif." },
          { title: "Conditional Structures", titleFr: "Structures Conditionnelles", description: "Master hypothetical scenarios and diplomatic suggestions.", descriptionFr: "Maîtrisez les scénarios hypothétiques et les suggestions diplomatiques." },
          { title: "Complex Sentence Building", titleFr: "Construction de Phrases Complexes", description: "Create sophisticated sentences with multiple clauses.", descriptionFr: "Créez des phrases sophistiquées avec plusieurs propositions." },
          { title: "Register & Tone Control", titleFr: "Contrôle du Registre et du Ton", description: "Adjust your language register for different professional contexts.", descriptionFr: "Ajustez votre registre de langue pour différents contextes professionnels." },
        ],
      },
      {
        title: "Persuasive Communication",
        titleFr: "Communication Persuasive",
        description: "Develop the art of persuasion in professional French communication.",
        descriptionFr: "Développez l'art de la persuasion dans la communication professionnelle en français.",
        lessons: [
          { title: "Rhetorical Techniques", titleFr: "Techniques Rhétoriques", description: "Apply rhetorical devices to strengthen your arguments.", descriptionFr: "Appliquez des procédés rhétoriques pour renforcer vos arguments." },
          { title: "Stakeholder Communication", titleFr: "Communication avec les Parties Prenantes", description: "Tailor your message for different audiences and stakeholders.", descriptionFr: "Adaptez votre message pour différents publics et parties prenantes." },
          { title: "Crisis Communication", titleFr: "Communication de Crise", description: "Communicate effectively during sensitive or urgent situations.", descriptionFr: "Communiquez efficacement lors de situations sensibles ou urgentes." },
          { title: "Influence Without Authority", titleFr: "Influencer Sans Autorité", description: "Build consensus and drive change through effective communication.", descriptionFr: "Construisez un consensus et conduisez le changement par une communication efficace." },
        ],
      },
      {
        title: "Executive Writing",
        titleFr: "Rédaction Exécutive",
        description: "Produce high-quality executive documents with precision and impact.",
        descriptionFr: "Produisez des documents exécutifs de haute qualité avec précision et impact.",
        lessons: [
          { title: "Executive Summaries", titleFr: "Résumés Exécutifs", description: "Write concise, impactful executive summaries for decision-makers.", descriptionFr: "Rédigez des résumés exécutifs concis et percutants pour les décideurs." },
          { title: "Policy Documents", titleFr: "Documents de Politique", description: "Draft clear policy documents and position papers.", descriptionFr: "Rédigez des documents de politique et des prises de position clairs." },
          { title: "Strategic Proposals", titleFr: "Propositions Stratégiques", description: "Create compelling proposals with clear objectives and outcomes.", descriptionFr: "Créez des propositions convaincantes avec des objectifs et résultats clairs." },
          { title: "Editing & Polishing", titleFr: "Révision et Peaufinage", description: "Refine your writing for clarity, concision, and professional impact.", descriptionFr: "Peaufinez votre rédaction pour la clarté, la concision et l'impact professionnel." },
        ],
      },
      {
        title: "Leadership Communication",
        titleFr: "Communication de Leadership",
        description: "Communicate with the authority and nuance expected of senior professionals.",
        descriptionFr: "Communiquez avec l'autorité et la nuance attendues des professionnels seniors.",
        lessons: [
          { title: "Leading Bilingual Teams", titleFr: "Diriger des Équipes Bilingues", description: "Manage and motivate teams in both official languages.", descriptionFr: "Gérez et motivez des équipes dans les deux langues officielles." },
          { title: "High-Stakes Presentations", titleFr: "Présentations à Enjeux Élevés", description: "Deliver presentations to senior management and committees.", descriptionFr: "Livrez des présentations à la haute direction et aux comités." },
          { title: "Diplomatic Language", titleFr: "Langage Diplomatique", description: "Navigate sensitive topics with tact and diplomatic precision.", descriptionFr: "Naviguez les sujets sensibles avec tact et précision diplomatique." },
          { title: "Path IV Review & Mastery Check", titleFr: "Révision et Vérification de Maîtrise du Path IV", description: "Comprehensive assessment of strategic expression competencies.", descriptionFr: "Évaluation complète des compétences en expression stratégique." },
        ],
      },
    ],
  },
  {
    // Path V
    title: "Path V: FSL - Professional Mastery",
    titleFr: "Path V : FLS - Maîtrise Professionnelle",
    slug: "path-v-professional-mastery",
    description: "Achieve expert-level communication with idiomatic mastery and cultural sophistication. Develop advanced competencies for executive roles: facilitating meetings, negotiating, and producing high-quality documents.",
    descriptionFr: "Atteignez une communication de niveau expert avec une maîtrise idiomatique et une sophistication culturelle. Développez les compétences avancées pour les rôles exécutifs : animer des réunions, négocier et produire des documents de haute qualité.",
    shortDescription: "Expert-level mastery for executive bilingual communication.",
    shortDescriptionFr: "Maîtrise de niveau expert pour la communication bilingue exécutive.",
    level: "advanced",
    category: "sle_oral",
    price: 119900,
    originalPrice: 149900,
    modules: [
      {
        title: "Idiomatic Mastery",
        titleFr: "Maîtrise Idiomatique",
        description: "Master French idioms, expressions, and cultural references for natural communication.",
        descriptionFr: "Maîtrisez les expressions idiomatiques, les expressions et les références culturelles françaises pour une communication naturelle.",
        lessons: [
          { title: "Common Workplace Idioms", titleFr: "Expressions Idiomatiques Courantes au Travail", description: "Learn and use the most common French workplace idioms.", descriptionFr: "Apprenez et utilisez les expressions idiomatiques françaises les plus courantes au travail." },
          { title: "Cultural References & Allusions", titleFr: "Références Culturelles et Allusions", description: "Understand and use cultural references in professional contexts.", descriptionFr: "Comprenez et utilisez les références culturelles dans des contextes professionnels." },
          { title: "Humor & Rapport Building", titleFr: "Humour et Construction de Relations", description: "Use appropriate humor to build professional relationships.", descriptionFr: "Utilisez un humour approprié pour construire des relations professionnelles." },
          { title: "Nuanced Expression", titleFr: "Expression Nuancée", description: "Express subtle distinctions and fine-grained meanings.", descriptionFr: "Exprimez des distinctions subtiles et des significations nuancées." },
        ],
      },
      {
        title: "Executive Facilitation",
        titleFr: "Facilitation Exécutive",
        description: "Lead meetings, workshops, and collaborative sessions at the executive level.",
        descriptionFr: "Dirigez des réunions, des ateliers et des sessions collaboratives au niveau exécutif.",
        lessons: [
          { title: "Meeting Facilitation Techniques", titleFr: "Techniques de Facilitation de Réunion", description: "Guide productive discussions and manage group dynamics.", descriptionFr: "Guidez des discussions productives et gérez la dynamique de groupe." },
          { title: "Workshop Design & Delivery", titleFr: "Conception et Animation d'Ateliers", description: "Design and deliver engaging bilingual workshops.", descriptionFr: "Concevez et animez des ateliers bilingues engageants." },
          { title: "Consensus Building", titleFr: "Construction de Consensus", description: "Navigate disagreements and build consensus among stakeholders.", descriptionFr: "Naviguez les désaccords et construisez un consensus parmi les parties prenantes." },
          { title: "Executive Briefings", titleFr: "Séances d'Information Exécutives", description: "Deliver concise, impactful briefings to senior leadership.", descriptionFr: "Livrez des séances d'information concises et percutantes à la haute direction." },
        ],
      },
      {
        title: "Advanced Negotiation",
        titleFr: "Négociation Avancée",
        description: "Master complex negotiation scenarios in bilingual professional settings.",
        descriptionFr: "Maîtrisez les scénarios de négociation complexes dans des contextes professionnels bilingues.",
        lessons: [
          { title: "Negotiation Strategies", titleFr: "Stratégies de Négociation", description: "Apply proven negotiation frameworks in French.", descriptionFr: "Appliquez des cadres de négociation éprouvés en français." },
          { title: "Managing Conflict", titleFr: "Gestion des Conflits", description: "Resolve workplace conflicts through effective bilingual communication.", descriptionFr: "Résolvez les conflits au travail par une communication bilingue efficace." },
          { title: "Multi-Party Negotiations", titleFr: "Négociations Multipartites", description: "Navigate complex negotiations with multiple stakeholders.", descriptionFr: "Naviguez les négociations complexes avec plusieurs parties prenantes." },
          { title: "Agreement & Follow-Up", titleFr: "Accord et Suivi", description: "Formalize agreements and manage follow-up communications.", descriptionFr: "Formalisez les accords et gérez les communications de suivi." },
        ],
      },
      {
        title: "Professional Excellence",
        titleFr: "Excellence Professionnelle",
        description: "Achieve the highest level of bilingual professional communication.",
        descriptionFr: "Atteignez le plus haut niveau de communication professionnelle bilingue.",
        lessons: [
          { title: "Public Speaking in French", titleFr: "Prise de Parole en Public en Français", description: "Deliver speeches and keynotes with confidence and impact.", descriptionFr: "Prononcez des discours et des allocutions avec confiance et impact." },
          { title: "Media & Interview Skills", titleFr: "Compétences Médiatiques et d'Entrevue", description: "Handle media interviews and public communications professionally.", descriptionFr: "Gérez les entrevues médiatiques et les communications publiques professionnellement." },
          { title: "Mentoring in French", titleFr: "Mentorat en Français", description: "Guide and mentor colleagues in their French language development.", descriptionFr: "Guidez et mentorez vos collègues dans leur développement en français." },
          { title: "Path V Capstone Assessment", titleFr: "Évaluation Finale du Path V", description: "Comprehensive mastery assessment across all professional competencies.", descriptionFr: "Évaluation complète de la maîtrise de toutes les compétences professionnelles." },
        ],
      },
    ],
  },
  {
    // Path VI
    title: "Path VI: FSL - SLE Accelerator",
    titleFr: "Path VI : FLS - Accélérateur ELS",
    slug: "path-vi-sle-accelerator",
    description: "Intensive preparation specifically designed for Second Language Evaluation (SLE) success. Master exam strategies, complete practice exams with detailed feedback, and develop confidence for maximum performance.",
    descriptionFr: "Préparation intensive spécialement conçue pour réussir l'Évaluation de langue seconde (ELS). Maîtrisez les stratégies d'examen, complétez des examens pratiques avec rétroaction détaillée et développez la confiance pour une performance maximale.",
    shortDescription: "Intensive SLE exam preparation for guaranteed success.",
    shortDescriptionFr: "Préparation intensive à l'examen ELS pour un succès garanti.",
    level: "intermediate",
    category: "exam_prep",
    price: 129900,
    originalPrice: 159900,
    modules: [
      {
        title: "SLE Exam Overview & Strategy",
        titleFr: "Survol de l'Examen ELS et Stratégie",
        description: "Understand the SLE structure, scoring criteria, and develop your test strategy.",
        descriptionFr: "Comprenez la structure de l'ELS, les critères de notation et développez votre stratégie d'examen.",
        lessons: [
          { title: "Understanding the SLE Format", titleFr: "Comprendre le Format de l'ELS", description: "Learn the structure, timing, and scoring of each SLE component.", descriptionFr: "Apprenez la structure, le chronométrage et la notation de chaque composante de l'ELS." },
          { title: "Oral Expression Strategies", titleFr: "Stratégies d'Expression Orale", description: "Master techniques for the oral expression component.", descriptionFr: "Maîtrisez les techniques pour la composante d'expression orale." },
          { title: "Written Expression Strategies", titleFr: "Stratégies d'Expression Écrite", description: "Develop strategies for the written expression component.", descriptionFr: "Développez des stratégies pour la composante d'expression écrite." },
          { title: "Reading Comprehension Strategies", titleFr: "Stratégies de Compréhension de Lecture", description: "Apply effective reading strategies for the comprehension component.", descriptionFr: "Appliquez des stratégies de lecture efficaces pour la composante de compréhension." },
        ],
      },
      {
        title: "Oral Expression Deep Dive",
        titleFr: "Approfondissement de l'Expression Orale",
        description: "Intensive practice for the oral expression component of the SLE.",
        descriptionFr: "Pratique intensive pour la composante d'expression orale de l'ELS.",
        lessons: [
          { title: "Structured Oral Responses", titleFr: "Réponses Orales Structurées", description: "Build clear, organized responses to oral prompts.", descriptionFr: "Construisez des réponses claires et organisées aux questions orales." },
          { title: "Spontaneous Speech Practice", titleFr: "Pratique de Discours Spontané", description: "Develop fluency in unscripted speaking situations.", descriptionFr: "Développez l'aisance dans des situations de parole non scriptées." },
          { title: "Pronunciation & Intonation", titleFr: "Prononciation et Intonation", description: "Refine pronunciation and natural French intonation patterns.", descriptionFr: "Peaufinez la prononciation et les schémas d'intonation naturels du français." },
          { title: "Mock Oral Exam #1", titleFr: "Examen Oral Simulé #1", description: "Complete a full practice oral exam under timed conditions.", descriptionFr: "Complétez un examen oral pratique complet en conditions chronométrées." },
        ],
      },
      {
        title: "Written Expression & Reading",
        titleFr: "Expression Écrite et Lecture",
        description: "Master the written and reading components of the SLE examination.",
        descriptionFr: "Maîtrisez les composantes écrites et de lecture de l'examen ELS.",
        lessons: [
          { title: "Essay Structure for SLE", titleFr: "Structure de Dissertation pour l'ELS", description: "Write well-organized essays that meet SLE evaluation criteria.", descriptionFr: "Rédigez des dissertations bien organisées qui répondent aux critères d'évaluation de l'ELS." },
          { title: "Grammar Under Pressure", titleFr: "Grammaire Sous Pression", description: "Maintain grammatical accuracy under exam time constraints.", descriptionFr: "Maintenez la précision grammaticale sous les contraintes de temps de l'examen." },
          { title: "Speed Reading Techniques", titleFr: "Techniques de Lecture Rapide", description: "Read efficiently and extract key information quickly.", descriptionFr: "Lisez efficacement et extrayez les informations clés rapidement." },
          { title: "Mock Written Exam #1", titleFr: "Examen Écrit Simulé #1", description: "Complete a full practice written exam under timed conditions.", descriptionFr: "Complétez un examen écrit pratique complet en conditions chronométrées." },
        ],
      },
      {
        title: "Final Preparation & Confidence",
        titleFr: "Préparation Finale et Confiance",
        description: "Final intensive preparation with stress management and performance optimization.",
        descriptionFr: "Préparation intensive finale avec gestion du stress et optimisation de la performance.",
        lessons: [
          { title: "Stress Management Techniques", titleFr: "Techniques de Gestion du Stress", description: "Develop mental strategies for calm, focused exam performance.", descriptionFr: "Développez des stratégies mentales pour une performance d'examen calme et concentrée." },
          { title: "Common Pitfalls & How to Avoid Them", titleFr: "Pièges Courants et Comment les Éviter", description: "Identify and avoid the most common mistakes on the SLE.", descriptionFr: "Identifiez et évitez les erreurs les plus courantes à l'ELS." },
          { title: "Full Practice Exam #2", titleFr: "Examen Pratique Complet #2", description: "Complete a comprehensive practice exam covering all components.", descriptionFr: "Complétez un examen pratique complet couvrant toutes les composantes." },
          { title: "Exam Day Preparation", titleFr: "Préparation du Jour de l'Examen", description: "Final checklist and confidence-building strategies for exam day.", descriptionFr: "Liste de vérification finale et stratégies de confiance pour le jour de l'examen." },
        ],
      },
    ],
  },
];

// ============================================================================
// SLOT CONTENT GENERATORS
// ============================================================================

function generateIntroduction(lesson, path, moduleIndex, lessonIndex) {
  const lessonNum = `${moduleIndex + 1}.${lessonIndex + 1}`;
  return {
    content: `<div class="space-y-4">
<h2 class="text-2xl font-bold text-[#0F3D3E]">Welcome to Lesson ${lessonNum}: ${lesson.title}</h2>
<p class="text-lg leading-relaxed">${lesson.description}</p>
<div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
<h3 class="font-semibold text-amber-800">🎯 Learning Objectives</h3>
<ul class="mt-2 space-y-1 text-amber-900">
<li>• Understand key concepts related to ${lesson.title.toLowerCase()}</li>
<li>• Practice essential vocabulary and expressions</li>
<li>• Apply new skills in realistic workplace scenarios</li>
<li>• Build confidence through guided exercises</li>
</ul>
</div>
<p class="text-sm text-gray-600 italic">Estimated time: 2 minutes | This lesson is part of ${path.title}</p>
</div>`,
    contentFr: `<div class="space-y-4">
<h2 class="text-2xl font-bold text-[#0F3D3E]">Bienvenue à la Leçon ${lessonNum} : ${lesson.titleFr}</h2>
<p class="text-lg leading-relaxed">${lesson.descriptionFr}</p>
<div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
<h3 class="font-semibold text-amber-800">🎯 Objectifs d'apprentissage</h3>
<ul class="mt-2 space-y-1 text-amber-900">
<li>• Comprendre les concepts clés liés à ${lesson.titleFr.toLowerCase()}</li>
<li>• Pratiquer le vocabulaire et les expressions essentiels</li>
<li>• Appliquer les nouvelles compétences dans des scénarios réalistes</li>
<li>• Renforcer la confiance par des exercices guidés</li>
</ul>
</div>
<p class="text-sm text-gray-600 italic">Temps estimé : 2 minutes | Cette leçon fait partie du ${path.titleFr}</p>
</div>`,
  };
}

function generateVideoScenario(lesson, moduleIndex, lessonIndex) {
  return {
    content: `<div class="space-y-4">
<h2 class="text-xl font-bold">Video Scenario: ${lesson.title}</h2>
<p>Watch the following scenario that demonstrates the key concepts of this lesson in a realistic Canadian federal workplace setting.</p>
<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
<p class="text-blue-800 font-medium">📹 Video Content</p>
<p class="text-blue-700 text-sm">This video presents a workplace scenario illustrating ${lesson.title.toLowerCase()}. Pay attention to the vocabulary, expressions, and communication strategies used by the characters.</p>
</div>
<div class="mt-4 bg-gray-50 rounded-lg p-4">
<h3 class="font-semibold">While watching, consider:</h3>
<ul class="mt-2 space-y-1 text-gray-700">
<li>1. What key expressions are used?</li>
<li>2. How do the speakers adapt their language to the context?</li>
<li>3. What cultural elements can you identify?</li>
</ul>
</div>
</div>`,
    contentFr: `<div class="space-y-4">
<h2 class="text-xl font-bold">Scénario Vidéo : ${lesson.titleFr}</h2>
<p>Regardez le scénario suivant qui démontre les concepts clés de cette leçon dans un contexte réaliste de la fonction publique fédérale canadienne.</p>
<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
<p class="text-blue-800 font-medium">📹 Contenu Vidéo</p>
<p class="text-blue-700 text-sm">Cette vidéo présente un scénario de travail illustrant ${lesson.titleFr.toLowerCase()}. Portez attention au vocabulaire, aux expressions et aux stratégies de communication utilisés par les personnages.</p>
</div>
<div class="mt-4 bg-gray-50 rounded-lg p-4">
<h3 class="font-semibold">En regardant, considérez :</h3>
<ul class="mt-2 space-y-1 text-gray-700">
<li>1. Quelles expressions clés sont utilisées ?</li>
<li>2. Comment les locuteurs adaptent-ils leur langage au contexte ?</li>
<li>3. Quels éléments culturels pouvez-vous identifier ?</li>
</ul>
</div>
</div>`,
  };
}

function generateGrammarPoint(lesson, moduleIndex, lessonIndex) {
  return {
    content: `<div class="space-y-6">
<h2 class="text-xl font-bold text-[#0F3D3E]">Grammar & Strategy Point</h2>
<p class="text-lg">In this section, we explore the key grammatical structures and communication strategies related to <strong>${lesson.title}</strong>.</p>

<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
<h3 class="font-bold text-emerald-800 text-lg">📚 Key Grammar Concepts</h3>
<div class="mt-3 space-y-3">
<div class="bg-white rounded-lg p-3 shadow-sm">
<p class="font-semibold text-emerald-700">Structure Pattern</p>
<p class="text-gray-700 mt-1">Learn the essential patterns used in professional contexts for ${lesson.title.toLowerCase()}.</p>
</div>
<div class="bg-white rounded-lg p-3 shadow-sm">
<p class="font-semibold text-emerald-700">Common Expressions</p>
<p class="text-gray-700 mt-1">Master the most frequently used expressions in this context.</p>
</div>
<div class="bg-white rounded-lg p-3 shadow-sm">
<p class="font-semibold text-emerald-700">Usage Notes</p>
<p class="text-gray-700 mt-1">Understand when and how to apply these structures appropriately.</p>
</div>
</div>
</div>

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
<p class="font-semibold text-yellow-800">💡 Pro Tip</p>
<p class="text-yellow-700">Practice these structures in context rather than in isolation. The more you use them in realistic scenarios, the more natural they will become.</p>
</div>
</div>`,
    contentFr: `<div class="space-y-6">
<h2 class="text-xl font-bold text-[#0F3D3E]">Point de Grammaire et Stratégie</h2>
<p class="text-lg">Dans cette section, nous explorons les structures grammaticales clés et les stratégies de communication liées à <strong>${lesson.titleFr}</strong>.</p>

<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
<h3 class="font-bold text-emerald-800 text-lg">📚 Concepts Grammaticaux Clés</h3>
<div class="mt-3 space-y-3">
<div class="bg-white rounded-lg p-3 shadow-sm">
<p class="font-semibold text-emerald-700">Modèle de Structure</p>
<p class="text-gray-700 mt-1">Apprenez les modèles essentiels utilisés dans les contextes professionnels pour ${lesson.titleFr.toLowerCase()}.</p>
</div>
<div class="bg-white rounded-lg p-3 shadow-sm">
<p class="font-semibold text-emerald-700">Expressions Courantes</p>
<p class="text-gray-700 mt-1">Maîtrisez les expressions les plus fréquemment utilisées dans ce contexte.</p>
</div>
<div class="bg-white rounded-lg p-3 shadow-sm">
<p class="font-semibold text-emerald-700">Notes d'Utilisation</p>
<p class="text-gray-700 mt-1">Comprenez quand et comment appliquer ces structures de manière appropriée.</p>
</div>
</div>
</div>

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
<p class="font-semibold text-yellow-800">💡 Conseil Pro</p>
<p class="text-yellow-700">Pratiquez ces structures en contexte plutôt qu'en isolation. Plus vous les utilisez dans des scénarios réalistes, plus elles deviendront naturelles.</p>
</div>
</div>`,
  };
}

function generateWrittenPractice(lesson) {
  return {
    content: `<div class="space-y-6">
<h2 class="text-xl font-bold text-[#0F3D3E]">Written Practice</h2>
<p>Put your knowledge into practice with these writing exercises related to <strong>${lesson.title}</strong>.</p>

<div class="bg-purple-50 border border-purple-200 rounded-xl p-5">
<h3 class="font-bold text-purple-800">✍️ Exercise 1: Sentence Construction</h3>
<p class="mt-2 text-purple-700">Write 3-5 sentences using the key structures from this lesson. Focus on accuracy and natural expression.</p>
</div>

<div class="bg-purple-50 border border-purple-200 rounded-xl p-5">
<h3 class="font-bold text-purple-800">✍️ Exercise 2: Workplace Scenario</h3>
<p class="mt-2 text-purple-700">Imagine you are in a Canadian federal workplace. Write a short paragraph (50-80 words) applying the concepts from this lesson to a realistic situation.</p>
</div>

<div class="bg-purple-50 border border-purple-200 rounded-xl p-5">
<h3 class="font-bold text-purple-800">✍️ Exercise 3: Email/Message Draft</h3>
<p class="mt-2 text-purple-700">Draft a professional email or message that demonstrates your understanding of the lesson's key concepts.</p>
</div>

<div class="bg-gray-50 rounded-lg p-4 mt-4">
<p class="text-sm text-gray-600">📝 Take your time with these exercises. Quality is more important than speed. Review your work before moving to the next slot.</p>
</div>
</div>`,
    contentFr: `<div class="space-y-6">
<h2 class="text-xl font-bold text-[#0F3D3E]">Pratique Écrite</h2>
<p>Mettez vos connaissances en pratique avec ces exercices d'écriture liés à <strong>${lesson.titleFr}</strong>.</p>

<div class="bg-purple-50 border border-purple-200 rounded-xl p-5">
<h3 class="font-bold text-purple-800">✍️ Exercice 1 : Construction de Phrases</h3>
<p class="mt-2 text-purple-700">Écrivez 3 à 5 phrases en utilisant les structures clés de cette leçon. Concentrez-vous sur la précision et l'expression naturelle.</p>
</div>

<div class="bg-purple-50 border border-purple-200 rounded-xl p-5">
<h3 class="font-bold text-purple-800">✍️ Exercice 2 : Scénario de Travail</h3>
<p class="mt-2 text-purple-700">Imaginez que vous êtes dans un milieu de travail fédéral canadien. Écrivez un court paragraphe (50-80 mots) appliquant les concepts de cette leçon à une situation réaliste.</p>
</div>

<div class="bg-purple-50 border border-purple-200 rounded-xl p-5">
<h3 class="font-bold text-purple-800">✍️ Exercice 3 : Brouillon de Courriel/Message</h3>
<p class="mt-2 text-purple-700">Rédigez un courriel ou message professionnel qui démontre votre compréhension des concepts clés de la leçon.</p>
</div>

<div class="bg-gray-50 rounded-lg p-4 mt-4">
<p class="text-sm text-gray-600">📝 Prenez votre temps avec ces exercices. La qualité est plus importante que la vitesse. Révisez votre travail avant de passer à l'étape suivante.</p>
</div>
</div>`,
  };
}

function generateOralPractice(lesson) {
  return {
    content: `<div class="space-y-6">
<h2 class="text-xl font-bold text-[#0F3D3E]">Oral Practice & Micro-Phonetics</h2>
<p>Develop your speaking skills with these oral exercises focused on <strong>${lesson.title}</strong>.</p>

<div class="bg-rose-50 border border-rose-200 rounded-xl p-5">
<h3 class="font-bold text-rose-800">🎤 Speaking Exercise 1: Key Phrases</h3>
<p class="mt-2 text-rose-700">Listen to the audio model and repeat each phrase 3 times. Focus on pronunciation, rhythm, and intonation.</p>
</div>

<div class="bg-rose-50 border border-rose-200 rounded-xl p-5">
<h3 class="font-bold text-rose-800">🎤 Speaking Exercise 2: Role Play</h3>
<p class="mt-2 text-rose-700">Practice the following role-play scenario out loud. Record yourself if possible and compare with the model.</p>
</div>

<div class="bg-orange-50 border border-orange-200 rounded-xl p-5">
<h3 class="font-bold text-orange-800">🔊 Micro-Phonetics Focus</h3>
<div class="mt-2 space-y-2">
<p class="text-orange-700">Pay special attention to these sounds:</p>
<ul class="list-disc pl-5 text-orange-700">
<li>French nasal vowels (an, en, in, on, un)</li>
<li>The French 'r' sound</li>
<li>Liaison and enchaînement</li>
<li>Sentence-level intonation patterns</li>
</ul>
</div>
</div>

<div class="bg-gray-50 rounded-lg p-4">
<p class="text-sm text-gray-600">🎧 Use headphones for the best audio experience. Practice speaking out loud — silent reading is not sufficient for oral skill development.</p>
</div>
</div>`,
    contentFr: `<div class="space-y-6">
<h2 class="text-xl font-bold text-[#0F3D3E]">Pratique Orale et Micro-Phonétique</h2>
<p>Développez vos compétences orales avec ces exercices axés sur <strong>${lesson.titleFr}</strong>.</p>

<div class="bg-rose-50 border border-rose-200 rounded-xl p-5">
<h3 class="font-bold text-rose-800">🎤 Exercice Oral 1 : Phrases Clés</h3>
<p class="mt-2 text-rose-700">Écoutez le modèle audio et répétez chaque phrase 3 fois. Concentrez-vous sur la prononciation, le rythme et l'intonation.</p>
</div>

<div class="bg-rose-50 border border-rose-200 rounded-xl p-5">
<h3 class="font-bold text-rose-800">🎤 Exercice Oral 2 : Jeu de Rôle</h3>
<p class="mt-2 text-rose-700">Pratiquez le scénario de jeu de rôle suivant à voix haute. Enregistrez-vous si possible et comparez avec le modèle.</p>
</div>

<div class="bg-orange-50 border border-orange-200 rounded-xl p-5">
<h3 class="font-bold text-orange-800">🔊 Focus Micro-Phonétique</h3>
<div class="mt-2 space-y-2">
<p class="text-orange-700">Portez une attention particulière à ces sons :</p>
<ul class="list-disc pl-5 text-orange-700">
<li>Les voyelles nasales françaises (an, en, in, on, un)</li>
<li>Le son « r » français</li>
<li>La liaison et l'enchaînement</li>
<li>Les schémas d'intonation au niveau de la phrase</li>
</ul>
</div>
</div>

<div class="bg-gray-50 rounded-lg p-4">
<p class="text-sm text-gray-600">🎧 Utilisez des écouteurs pour la meilleure expérience audio. Pratiquez à voix haute — la lecture silencieuse ne suffit pas pour le développement des compétences orales.</p>
</div>
</div>`,
  };
}

function generateCoachTip(lesson, moduleIndex, lessonIndex) {
  const lessonNum = `${moduleIndex + 1}.${lessonIndex + 1}`;
  return {
    content: `<div class="space-y-6">
<h2 class="text-xl font-bold text-[#0F3D3E]">Coach's Tip & Self-Evaluation</h2>

<div class="bg-teal-50 border border-teal-200 rounded-xl p-5">
<h3 class="font-bold text-teal-800 text-lg">💬 Coach's Insight</h3>
<p class="mt-2 text-teal-700 leading-relaxed">Congratulations on completing Lesson ${lessonNum}! Remember that language learning is a journey, not a destination. The key to mastering <strong>${lesson.title}</strong> is consistent practice in real-world situations. Try to use at least 3 new expressions from this lesson in your next workday.</p>
</div>

<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
<h3 class="font-bold text-indigo-800">📊 Self-Evaluation Checklist</h3>
<div class="mt-3 space-y-2">
<label class="flex items-center gap-2 text-indigo-700"><input type="checkbox" class="rounded"> I can understand the key concepts of this lesson</label>
<label class="flex items-center gap-2 text-indigo-700"><input type="checkbox" class="rounded"> I can use the main expressions in context</label>
<label class="flex items-center gap-2 text-indigo-700"><input type="checkbox" class="rounded"> I feel confident applying these skills at work</label>
<label class="flex items-center gap-2 text-indigo-700"><input type="checkbox" class="rounded"> I completed all practice exercises</label>
<label class="flex items-center gap-2 text-indigo-700"><input type="checkbox" class="rounded"> I can explain these concepts to a colleague</label>
</div>
</div>

<div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
<h3 class="font-bold text-amber-800">🚀 Next Steps</h3>
<p class="mt-2 text-amber-700">Review any areas where you felt less confident, then mark this lesson as complete and move on to the next one. You're making great progress!</p>
</div>
</div>`,
    contentFr: `<div class="space-y-6">
<h2 class="text-xl font-bold text-[#0F3D3E]">Conseil du Coach et Auto-Évaluation</h2>

<div class="bg-teal-50 border border-teal-200 rounded-xl p-5">
<h3 class="font-bold text-teal-800 text-lg">💬 Conseil du Coach</h3>
<p class="mt-2 text-teal-700 leading-relaxed">Félicitations pour avoir terminé la Leçon ${lessonNum} ! N'oubliez pas que l'apprentissage d'une langue est un voyage, pas une destination. La clé pour maîtriser <strong>${lesson.titleFr}</strong> est la pratique constante dans des situations réelles. Essayez d'utiliser au moins 3 nouvelles expressions de cette leçon lors de votre prochaine journée de travail.</p>
</div>

<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
<h3 class="font-bold text-indigo-800">📊 Liste de Vérification d'Auto-Évaluation</h3>
<div class="mt-3 space-y-2">
<label class="flex items-center gap-2 text-indigo-700"><input type="checkbox" class="rounded"> Je comprends les concepts clés de cette leçon</label>
<label class="flex items-center gap-2 text-indigo-700"><input type="checkbox" class="rounded"> Je peux utiliser les expressions principales en contexte</label>
<label class="flex items-center gap-2 text-indigo-700"><input type="checkbox" class="rounded"> Je me sens confiant(e) pour appliquer ces compétences au travail</label>
<label class="flex items-center gap-2 text-indigo-700"><input type="checkbox" class="rounded"> J'ai complété tous les exercices de pratique</label>
<label class="flex items-center gap-2 text-indigo-700"><input type="checkbox" class="rounded"> Je peux expliquer ces concepts à un(e) collègue</label>
</div>
</div>

<div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
<h3 class="font-bold text-amber-800">🚀 Prochaines Étapes</h3>
<p class="mt-2 text-amber-700">Révisez les domaines où vous vous sentiez moins confiant(e), puis marquez cette leçon comme terminée et passez à la suivante. Vous faites d'excellents progrès !</p>
</div>
</div>`,
  };
}

function generateQuizContent(lesson, moduleIndex, lessonIndex) {
  return {
    content: JSON.stringify({
      quiz: {
        title: `Quiz: ${lesson.title}`,
        titleFr: `Quiz : ${lesson.titleFr}`,
        description: `Test your knowledge of ${lesson.title}`,
        descriptionFr: `Testez vos connaissances sur ${lesson.titleFr}`,
        passingScore: 70,
        questions: [] // Questions will be in quiz_questions table
      }
    }),
    contentFr: JSON.stringify({
      quiz: {
        title: `Quiz : ${lesson.titleFr}`,
        titleFr: `Quiz : ${lesson.titleFr}`,
        description: `Testez vos connaissances sur ${lesson.titleFr}`,
        descriptionFr: `Testez vos connaissances sur ${lesson.titleFr}`,
        passingScore: 70,
        questions: []
      }
    }),
  };
}

// Quiz question generator
function generateQuizQuestions(lesson, moduleIndex, lessonIndex) {
  const questions = [
    {
      questionText: `Which of the following best describes the main focus of "${lesson.title}"?`,
      questionTextFr: `Laquelle des options suivantes décrit le mieux l'objectif principal de « ${lesson.titleFr} » ?`,
      options: JSON.stringify([
        { text: "Understanding workplace vocabulary", textFr: "Comprendre le vocabulaire du milieu de travail" },
        { text: `Mastering ${lesson.title.toLowerCase()}`, textFr: `Maîtriser ${lesson.titleFr.toLowerCase()}` },
        { text: "Learning informal slang", textFr: "Apprendre l'argot informel" },
        { text: "Studying French literature", textFr: "Étudier la littérature française" }
      ]),
      correctAnswer: "B",
      explanation: `The main focus of this lesson is mastering ${lesson.title.toLowerCase()} in a professional context.`,
      explanationFr: `L'objectif principal de cette leçon est de maîtriser ${lesson.titleFr.toLowerCase()} dans un contexte professionnel.`,
    },
    {
      questionText: `In a Canadian federal workplace, which register is most appropriate for ${lesson.title.toLowerCase()}?`,
      questionTextFr: `Dans un milieu de travail fédéral canadien, quel registre est le plus approprié pour ${lesson.titleFr.toLowerCase()} ?`,
      options: JSON.stringify([
        { text: "Very informal (slang)", textFr: "Très informel (argot)" },
        { text: "Professional but accessible", textFr: "Professionnel mais accessible" },
        { text: "Extremely formal (literary)", textFr: "Extrêmement formel (littéraire)" },
        { text: "Technical jargon only", textFr: "Jargon technique uniquement" }
      ]),
      correctAnswer: "B",
      explanation: "In the Canadian federal workplace, a professional but accessible register is most appropriate for effective bilingual communication.",
      explanationFr: "Dans le milieu de travail fédéral canadien, un registre professionnel mais accessible est le plus approprié pour une communication bilingue efficace.",
    },
    {
      questionText: `What is the recommended approach for practicing the skills learned in this lesson?`,
      questionTextFr: `Quelle est l'approche recommandée pour pratiquer les compétences apprises dans cette leçon ?`,
      options: JSON.stringify([
        { text: "Memorize grammar rules only", textFr: "Mémoriser uniquement les règles de grammaire" },
        { text: "Practice in real workplace situations", textFr: "Pratiquer dans des situations réelles de travail" },
        { text: "Read textbooks without speaking", textFr: "Lire des manuels sans parler" },
        { text: "Wait until the exam to practice", textFr: "Attendre l'examen pour pratiquer" }
      ]),
      correctAnswer: "B",
      explanation: "Practicing in real workplace situations is the most effective way to internalize new language skills.",
      explanationFr: "Pratiquer dans des situations réelles de travail est la façon la plus efficace d'intérioriser de nouvelles compétences linguistiques.",
    },
    {
      questionText: `Which of the following is a key element of effective bilingual communication in the GC?`,
      questionTextFr: `Lequel des éléments suivants est un élément clé de la communication bilingue efficace au sein du GC ?`,
      options: JSON.stringify([
        { text: "Speaking only one language at a time", textFr: "Parler une seule langue à la fois" },
        { text: "Mixing languages randomly", textFr: "Mélanger les langues au hasard" },
        { text: "Adapting to your audience's language preference", textFr: "S'adapter à la préférence linguistique de votre audience" },
        { text: "Always using English first", textFr: "Toujours utiliser l'anglais en premier" }
      ]),
      correctAnswer: "C",
      explanation: "Adapting to your audience's language preference is a fundamental principle of effective bilingual communication in the Government of Canada.",
      explanationFr: "S'adapter à la préférence linguistique de votre audience est un principe fondamental de la communication bilingue efficace au gouvernement du Canada.",
    },
    {
      questionText: `True or False: Consistent daily practice of 15-20 minutes is more effective than occasional long study sessions.`,
      questionTextFr: `Vrai ou Faux : La pratique quotidienne constante de 15 à 20 minutes est plus efficace que des sessions d'étude longues occasionnelles.`,
      options: JSON.stringify([
        { text: "True", textFr: "Vrai" },
        { text: "False", textFr: "Faux" }
      ]),
      correctAnswer: "A",
      explanation: "Research consistently shows that spaced repetition and regular short practice sessions lead to better long-term retention than cramming.",
      explanationFr: "La recherche montre constamment que la répétition espacée et les courtes sessions de pratique régulières mènent à une meilleure rétention à long terme que le bachotage.",
    },
    {
      questionText: `What should you do if you encounter a word you don't understand during a meeting?`,
      questionTextFr: `Que devriez-vous faire si vous rencontrez un mot que vous ne comprenez pas lors d'une réunion ?`,
      options: JSON.stringify([
        { text: "Ignore it and move on", textFr: "L'ignorer et continuer" },
        { text: "Politely ask for clarification", textFr: "Demander poliment des éclaircissements" },
        { text: "Leave the meeting", textFr: "Quitter la réunion" },
        { text: "Switch to English immediately", textFr: "Passer immédiatement à l'anglais" }
      ]),
      correctAnswer: "B",
      explanation: "Politely asking for clarification is professional and shows engagement. It's a normal part of bilingual workplace communication.",
      explanationFr: "Demander poliment des éclaircissements est professionnel et montre de l'engagement. C'est une partie normale de la communication bilingue au travail.",
    },
    {
      questionText: `Which strategy helps build vocabulary most effectively?`,
      questionTextFr: `Quelle stratégie aide à développer le vocabulaire le plus efficacement ?`,
      options: JSON.stringify([
        { text: "Memorizing word lists", textFr: "Mémoriser des listes de mots" },
        { text: "Learning words in context through use", textFr: "Apprendre les mots en contexte par l'utilisation" },
        { text: "Translating word by word", textFr: "Traduire mot à mot" },
        { text: "Reading the dictionary", textFr: "Lire le dictionnaire" }
      ]),
      correctAnswer: "B",
      explanation: "Learning vocabulary in context through active use is the most effective strategy for long-term retention and natural usage.",
      explanationFr: "Apprendre le vocabulaire en contexte par l'utilisation active est la stratégie la plus efficace pour la rétention à long terme et l'utilisation naturelle.",
    },
    {
      questionText: `What is the purpose of the self-evaluation at the end of each lesson?`,
      questionTextFr: `Quel est le but de l'auto-évaluation à la fin de chaque leçon ?`,
      options: JSON.stringify([
        { text: "To give you a grade", textFr: "Pour vous donner une note" },
        { text: "To identify areas for improvement and track progress", textFr: "Pour identifier les domaines à améliorer et suivre les progrès" },
        { text: "To compare with other learners", textFr: "Pour comparer avec d'autres apprenants" },
        { text: "It has no purpose", textFr: "Cela n'a aucun but" }
      ]),
      correctAnswer: "B",
      explanation: "Self-evaluation helps you identify strengths and areas for improvement, enabling targeted practice and continuous progress.",
      explanationFr: "L'auto-évaluation vous aide à identifier vos forces et les domaines à améliorer, permettant une pratique ciblée et des progrès continus.",
    },
  ];

  return questions;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedAllPaths() {
  console.log("🌱 Starting seed: All 6 Paths with golden template content...\n");

  let totalCourses = 0;
  let totalModules = 0;
  let totalLessons = 0;
  let totalActivities = 0;
  let totalQuizQuestions = 0;

  for (const path of PATHS) {
    console.log(`\n📚 Creating: ${path.title}`);

    // 1. Insert course
    const [courseResult] = await db.execute(sql`
      INSERT INTO courses (title, titleFr, slug, description, descriptionFr, shortDescription, shortDescriptionFr, level, category, price, originalPrice, currency, accessType, totalModules, totalLessons, totalActivities, totalDurationMinutes, status, hasCertificate, hasQuizzes, hasDownloads)
      VALUES (
        ${path.title}, ${path.titleFr}, ${path.slug},
        ${path.description}, ${path.descriptionFr},
        ${path.shortDescription}, ${path.shortDescriptionFr},
        ${path.level}, ${path.category},
        ${path.price}, ${path.originalPrice}, 'CAD', 'one_time',
        ${path.modules.length},
        ${path.modules.length * 4},
        ${path.modules.length * 4 * 7},
        ${path.modules.length * 4 * 52},
        'published', true, true, true
      )
    `);
    const courseId = Number(courseResult.insertId);
    totalCourses++;
    console.log(`  ✅ Course created (id: ${courseId})`);

    // 2. Insert modules
    for (let mi = 0; mi < path.modules.length; mi++) {
      const mod = path.modules[mi];
      
      const [moduleResult] = await db.execute(sql`
        INSERT INTO course_modules (courseId, title, titleFr, description, descriptionFr, sortOrder, totalLessons, totalDurationMinutes, status)
        VALUES (
          ${courseId}, ${mod.title}, ${mod.titleFr},
          ${mod.description}, ${mod.descriptionFr},
          ${mi}, ${mod.lessons.length},
          ${mod.lessons.length * 52},
          'published'
        )
      `);
      const moduleId = Number(moduleResult.insertId);
      totalModules++;
      console.log(`    📦 Module ${mi + 1}: ${mod.title} (id: ${moduleId})`);

      // 3. Insert lessons
      for (let li = 0; li < mod.lessons.length; li++) {
        const lesson = mod.lessons[li];

        const [lessonResult] = await db.execute(sql`
          INSERT INTO lessons (moduleId, courseId, title, titleFr, description, descriptionFr, sortOrder, estimatedMinutes, totalActivities, contentType, status)
          VALUES (
            ${moduleId}, ${courseId},
            ${lesson.title}, ${lesson.titleFr},
            ${lesson.description}, ${lesson.descriptionFr},
            ${li}, 52, 7, 'video', 'published'
          )
        `);
        const lessonId = Number(lessonResult.insertId);
        totalLessons++;

        // 4. Insert 7 mandatory activities (slots)
        const slots = [
          { index: 1, type: "introduction", activityType: "text", minutes: 2, ...generateIntroduction(lesson, path, mi, li) },
          { index: 2, type: "video_scenario", activityType: "video", minutes: 7, ...generateVideoScenario(lesson, mi, li) },
          { index: 3, type: "grammar_point", activityType: "text", minutes: 12, ...generateGrammarPoint(lesson, mi, li) },
          { index: 4, type: "written_practice", activityType: "assignment", minutes: 11, ...generateWrittenPractice(lesson) },
          { index: 5, type: "oral_practice", activityType: "audio", minutes: 9, ...generateOralPractice(lesson) },
          { index: 6, type: "quiz_slot", activityType: "quiz", minutes: 8, ...generateQuizContent(lesson, mi, li) },
          { index: 7, type: "coaching_tip", activityType: "text", minutes: 3, ...generateCoachTip(lesson, mi, li) },
        ];

        const slotLabels = [
          { en: "Introduction / Hook", fr: "Introduction / Accroche" },
          { en: "Video Scenario", fr: "Scénario Vidéo" },
          { en: "Grammar / Strategy Point", fr: "Point de Grammaire / Stratégie" },
          { en: "Written Practice", fr: "Pratique Écrite" },
          { en: "Oral Practice + Micro-Phonetics", fr: "Pratique Orale + Micro-Phonétique" },
          { en: "Quiz", fr: "Quiz" },
          { en: "Coaching Tip + Self-Evaluation", fr: "Conseil du Coach + Auto-Évaluation" },
        ];

        for (const slot of slots) {
          const label = slotLabels[slot.index - 1];
          const title = `${label.en}: ${lesson.title}`;
          const titleFr = `${label.fr} : ${lesson.titleFr}`;

          await db.execute(sql`
            INSERT INTO activities (lessonId, moduleId, courseId, slotIndex, slotType, title, titleFr, description, descriptionFr, activityType, content, contentFr, estimatedMinutes, points, sortOrder, status, isMandatory, unlockMode)
            VALUES (
              ${lessonId}, ${moduleId}, ${courseId},
              ${slot.index}, ${slot.type},
              ${title}, ${titleFr},
              ${lesson.description}, ${lesson.descriptionFr},
              ${slot.activityType},
              ${slot.content}, ${slot.contentFr},
              ${slot.minutes}, ${slot.index === 6 ? 20 : 10},
              ${slot.index}, 'published', true, 'immediate'
            )
          `);
          totalActivities++;
        }

        // 5. Insert quiz questions for this lesson
        const questions = generateQuizQuestions(lesson, mi, li);
        for (let qi = 0; qi < questions.length; qi++) {
          const q = questions[qi];
          await db.execute(sql`
            INSERT INTO quiz_questions (lessonId, moduleId, courseId, questionText, questionTextFr, questionType, options, correctAnswer, explanation, explanationFr, points, difficulty, orderIndex, isActive)
            VALUES (
              ${lessonId}, ${moduleId}, ${courseId},
              ${q.questionText}, ${q.questionTextFr},
              'multiple_choice',
              ${q.options},
              ${q.correctAnswer},
              ${q.explanation}, ${q.explanationFr},
              10, 'medium', ${qi}, true
            )
          `);
          totalQuizQuestions++;
        }

        console.log(`      📖 Lesson ${mi + 1}.${li + 1}: ${lesson.title} — 7 slots + ${questions.length} quiz questions`);
      }
    }
  }

  // 6. Create Learning Paths entries + link courses
  console.log("\n📍 Creating Learning Path entries...");
  
  const pathMeta = [
    { slug: "path-i-foundations", level: "A1", price: "899.00", originalPrice: "999.00", weeks: 4, hours: 30, practiceMin: 80, practiceMax: 130 },
    { slug: "path-ii-everyday-fluency", level: "A2", price: "899.00", originalPrice: "999.00", weeks: 4, hours: 30, practiceMin: 80, practiceMax: 130 },
    { slug: "path-iii-operational-french", level: "B1", price: "999.00", originalPrice: "1199.00", weeks: 4, hours: 30, practiceMin: 80, practiceMax: 130 },
    { slug: "path-iv-strategic-expression", level: "B2", price: "1099.00", originalPrice: "1299.00", weeks: 4, hours: 30, practiceMin: 80, practiceMax: 130 },
    { slug: "path-v-professional-mastery", level: "C1", price: "1199.00", originalPrice: "1499.00", weeks: 4, hours: 30, practiceMin: 80, practiceMax: 130 },
    { slug: "path-vi-sle-accelerator", level: "exam_prep", price: "1299.00", originalPrice: "1599.00", weeks: 4, hours: 30, practiceMin: 80, practiceMax: 130 },
  ];

  // Get course IDs
  const [courseRows] = await db.execute(sql`SELECT id, slug FROM courses ORDER BY id ASC`);
  
  for (let i = 0; i < PATHS.length; i++) {
    const path = PATHS[i];
    const meta = pathMeta[i];
    const courseRow = courseRows.find(r => r.slug === path.slug);
    
    if (!courseRow) {
      console.log(`  ⚠️ Course not found for slug: ${path.slug}`);
      continue;
    }

    // Check if learning path already exists
    const [existingPath] = await db.execute(sql`SELECT id FROM learning_paths WHERE slug = ${meta.slug} LIMIT 1`);
    
    if (existingPath.length > 0) {
      console.log(`  ⏭️ Learning Path already exists: ${meta.slug}`);
      continue;
    }

    const [pathResult] = await db.execute(sql`
      INSERT INTO learning_paths (title, titleFr, slug, subtitle, subtitleFr, description, descriptionFr, level, price, originalPrice, durationWeeks, structuredHours, practiceHoursMin, practiceHoursMax, totalModules, totalLessons, status, isFeatured, displayOrder)
      VALUES (
        ${path.title}, ${path.titleFr}, ${meta.slug},
        ${path.shortDescription}, ${path.shortDescriptionFr},
        ${path.description}, ${path.descriptionFr},
        ${meta.level}, ${meta.price}, ${meta.originalPrice},
        ${meta.weeks}, ${meta.hours}, ${meta.practiceMin}, ${meta.practiceMax},
        4, 16, 'published', true, ${i}
      )
    `);
    const pathId = Number(pathResult.insertId);

    // Link course to path
    await db.execute(sql`
      INSERT INTO path_courses (pathId, courseId, orderIndex, isRequired)
      VALUES (${pathId}, ${courseRow.id}, 0, true)
    `);

    console.log(`  ✅ Learning Path: ${path.title} (id: ${pathId}) → linked to course ${courseRow.id}`);
  }

  console.log("\n" + "═".repeat(60));
  console.log("🎉 SEED COMPLETE!");
  console.log("═".repeat(60));
  console.log(`  📚 Courses:        ${totalCourses}`);
  console.log(`  📦 Modules:        ${totalModules}`);
  console.log(`  📖 Lessons:        ${totalLessons}`);
  console.log(`  🎯 Activities:     ${totalActivities}`);
  console.log(`  ❓ Quiz Questions: ${totalQuizQuestions}`);
  console.log(`  📍 Learning Paths: ${PATHS.length}`);
  console.log("═".repeat(60));

  process.exit(0);
}

seedAllPaths().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
