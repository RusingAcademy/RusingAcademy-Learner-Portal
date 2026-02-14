import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  CheckCircle,
  Sparkles,
  Calendar,
  Mic,
  Video,
  Brain,
  Target,
  TrendingUp,
  Users,
  Award,
  Globe,
  Lightbulb,
  Layers,
  BarChart3,
  BookOpen,
  Building2,
  GraduationCap,
  Briefcase,
  Quote,
  ChevronRight,
  Zap,
  Shield,
  Star,
} from 'lucide-react';
import SEO from '@/components/SEO';
import FooterInstitutional from '@/components/FooterInstitutional';
import CrossEcosystemSection from '@/components/CrossEcosystemSection';

// Premium color palette - refined and authoritative
const colors = {
  navy: '#0A1628',
  navyLight: '#152238',
  slate: '#3D4F5F',
  slateLight: '#5A6B7A',
  gold: '#C9A227',
  goldLight: '#D4B84A',
  goldMuted: 'rgba(201, 162, 39, 0.15)',
  cream: '#FAFAF8',
  offWhite: '#F5F5F3',
  warmGray: '#E8E6E1',
  text: '#1A1A1A',
  textMuted: '#4A5568',
  textLight: '#718096',
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Founder Image Carousel Component - Alternates between two photos every 5 seconds
const FounderImageCarousel = ({ founderName }: { founderName: string }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    '/studio-steven-3.jpg',
    '/steven-parliament.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
      {images.map((src, index) => (
        <img
          loading="lazy" key={src}
          src={src}
          alt={`${founderName} - Photo ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop';
          }}
        />
      ))}
      {/* Subtle indicator dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImage 
                ? 'bg-white w-6' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`View photo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Content data
const labels = {
  en: {
    hero: {
      badge: 'EdTech Innovation & Strategic Consulting',
      title: 'Where Pedagogy Meets',
      titleHighlight: 'Technology',
      subtitle: 'We bridge the gap between educational vision and digital execution. Strategic consulting, content innovation, and EdTech solutions for organizations ready to transform how they learn and communicate.',
      cta1: 'Schedule a Strategic Session',
      cta2: 'Explore Our Approach',
    },
    positioning: {
      title: 'Not Just Another Agency',
      lead: 'We are a strategic partner for organizations navigating the intersection of education, technology, and communication.',
      points: [
        {
          icon: 'Brain',
          title: 'Pedagogical Expertise',
          desc: 'Deep understanding of learning science, instructional design, and adult education methodologies.',
        },
        {
          icon: 'Zap',
          title: 'Technology Integration',
          desc: 'Practical AI implementation, LMS optimization, and digital transformation strategies.',
        },
        {
          icon: 'Target',
          title: 'Strategic Execution',
          desc: 'From vision to implementation—we deliver measurable outcomes, not just recommendations.',
        },
      ],
    },
    expertise: {
      badge: 'Core Competencies',
      title: 'Strategic Expertise',
      subtitle: 'Three pillars of excellence that define our approach to educational transformation',
      items: [
        {
          icon: 'Lightbulb',
          title: 'EdTech Strategy & Innovation',
          desc: 'Navigate the complex landscape of educational technology with confidence. We help organizations identify, evaluate, and implement the right solutions.',
          features: ['AI-Powered Learning Design', 'Platform Selection & Integration', 'Digital Transformation Roadmaps', 'ROI-Focused Implementation'],
          image: '/studio-steven-4.jpg',
        },
        {
          icon: 'Video',
          title: 'Premium Content Production',
          desc: 'Professional audiovisual content that elevates your message. From executive communications to learning modules, we deliver studio-quality results.',
          features: ['Podcast & Video Production', 'E-Learning Content Development', 'Executive Communication Training', 'Bilingual Content Creation'],
          image: '/studio-steven-2.jpg',
        },
        {
          icon: 'Users',
          title: 'Leadership & Communication',
          desc: 'Develop commanding presence and communication skills. Our coaching programs transform how leaders present, persuade, and perform.',
          features: ['Executive Presence Coaching', 'Bilingual Delivery Mastery', 'Media Training & Preparation', 'Presentation Excellence'],
          image: 'https://rusingacademy-cdn.b-cdn.net/images/podcast-leadership.jpg',
        },
      ],
    },
    insights: {
      badge: 'Strategic Insights',
      title: 'Perspectives on Learning Innovation',
      subtitle: 'Thought leadership from the intersection of pedagogy, technology, and organizational transformation',
      items: [
        {
          category: 'AI in Education',
          title: 'Beyond the Hype: Practical AI Implementation in Corporate Learning',
          excerpt: 'How organizations can move past AI experimentation to meaningful integration that improves learning outcomes.',
          readTime: '8 min read',
        },
        {
          category: 'Digital Transformation',
          title: 'The Hidden Costs of Poor LMS Selection',
          excerpt: 'Why platform decisions made without pedagogical expertise often lead to expensive course corrections.',
          readTime: '6 min read',
        },
        {
          category: 'Leadership Development',
          title: 'Bilingual Excellence: A Competitive Advantage',
          excerpt: 'In Canada\'s bilingual landscape, communication mastery in both languages is no longer optional—it\'s strategic.',
          readTime: '5 min read',
        },
      ],
    },
    clients: {
      badge: 'Trusted By',
      title: 'Organizations We\'ve Partnered With',
      logos: [
        { name: 'Public Sector', abbr: 'Public Sector' },
        { name: 'Schools & EdTech Organisations', abbr: 'Schools & EdTech' },
        { name: 'Private Sector', abbr: 'Private Sector' },
      ],
    },
    approach: {
      badge: 'Our Approach',
      title: 'How We Work',
      subtitle: 'A structured methodology that ensures clarity, alignment, and measurable results',
      steps: [
        {
          number: '01',
          title: 'Discovery & Diagnosis',
          desc: 'We begin with deep listening. Understanding your context, challenges, and aspirations before proposing solutions.',
        },
        {
          number: '02',
          title: 'Strategy & Design',
          desc: 'Collaborative development of a clear roadmap. Every recommendation is grounded in pedagogical best practices and practical feasibility.',
        },
        {
          number: '03',
          title: 'Implementation & Support',
          desc: 'Hands-on execution with continuous refinement. We stay engaged until the solution is delivering measurable value.',
        },
      ],
    },
    founder: {
      badge: 'Leadership',
      name: 'Meet Steven Barholere',
      title: 'Founder & Executive Director',
      bio: 'With over 15 years at the intersection of education, technology, and communication, Steven founded Barholex Media to help organizations navigate the complexities of modern learning. His unique background combines academic expertise in instructional design with practical experience in government communications and EdTech innovation.',
      credentials: [
        'M.Ed. in Educational Technology',
        'Certified Executive Coach (ICF)',
        'Former Senior Project Officer, Government of Canada',
        'Published Researcher in AI-Assisted Learning',
      ],
      quote: 'Our mission is to democratize access to premium learning experiences through the intelligent application of AI and proven pedagogical methods.',
    },
    cta: {
      title: 'Ready to Transform Your Approach?',
      subtitle: 'Let\'s discuss how strategic thinking and practical expertise can help you achieve your learning and communication goals.',
      button1: 'Schedule a Discovery Call',
      button2: 'Send an Inquiry',
    },
  },
  fr: {
    hero: {
      badge: 'Innovation EdTech & Conseil Stratégique',
      title: 'Là où la pédagogie rencontre',
      titleHighlight: 'la technologie',
      subtitle: 'Nous comblons le fossé entre la vision éducative et l\'exécution numérique. Conseil stratégique, innovation de contenu et solutions EdTech pour les organisations prêtes à transformer leur façon d\'apprendre et de communiquer.',
      cta1: 'Planifier une session stratégique',
      cta2: 'Explorer notre approche',
    },
    positioning: {
      title: 'Pas une agence ordinaire',
      lead: 'Nous sommes un partenaire stratégique pour les organisations naviguant à l\'intersection de l\'éducation, de la technologie et de la communication.',
      points: [
        {
          icon: 'Brain',
          title: 'Expertise pédagogique',
          desc: 'Compréhension approfondie des sciences de l\'apprentissage, de la conception pédagogique et des méthodologies d\'éducation des adultes.',
        },
        {
          icon: 'Zap',
          title: 'Intégration technologique',
          desc: 'Implémentation pratique de l\'IA, optimisation LMS et stratégies de transformation numérique.',
        },
        {
          icon: 'Target',
          title: 'Exécution stratégique',
          desc: 'De la vision à l\'implémentation—nous livrons des résultats mesurables, pas seulement des recommandations.',
        },
      ],
    },
    expertise: {
      badge: 'Compétences clés',
      title: 'Expertise stratégique',
      subtitle: 'Trois piliers d\'excellence qui définissent notre approche de la transformation éducative',
      items: [
        {
          icon: 'Lightbulb',
          title: 'Stratégie & Innovation EdTech',
          desc: 'Naviguez avec confiance dans le paysage complexe de la technologie éducative. Nous aidons les organisations à identifier, évaluer et implémenter les bonnes solutions.',
          features: ['Conception d\'apprentissage par IA', 'Sélection & intégration de plateformes', 'Feuilles de route de transformation', 'Implémentation axée sur le ROI'],
          image: '/studio-steven-4.jpg',
        },
        {
          icon: 'Video',
          title: 'Production de contenu premium',
          desc: 'Contenu audiovisuel professionnel qui élève votre message. Des communications exécutives aux modules d\'apprentissage, nous livrons une qualité studio.',
          features: ['Production podcast & vidéo', 'Développement de contenu e-learning', 'Formation en communication exécutive', 'Création de contenu bilingue'],
          image: '/studio-steven-2.jpg',
        },
        {
          icon: 'Users',
          title: 'Leadership & Communication',
          desc: 'Développez une présence et des compétences de communication imposantes. Nos programmes de coaching transforment la façon dont les leaders présentent, persuadent et performent.',
          features: ['Coaching de présence exécutive', 'Maîtrise de la livraison bilingue', 'Formation média & préparation', 'Excellence en présentation'],
          image: '/studio-steven-4.jpg',
        },
      ],
    },
    insights: {
      badge: 'Perspectives stratégiques',
      title: 'Perspectives sur l\'innovation en apprentissage',
      subtitle: 'Leadership éclairé à l\'intersection de la pédagogie, de la technologie et de la transformation organisationnelle',
      items: [
        {
          category: 'IA en éducation',
          title: 'Au-delà du battage: Implémentation pratique de l\'IA dans l\'apprentissage corporatif',
          excerpt: 'Comment les organisations peuvent passer de l\'expérimentation IA à une intégration significative qui améliore les résultats d\'apprentissage.',
          readTime: '8 min de lecture',
        },
        {
          category: 'Transformation numérique',
          title: 'Les coûts cachés d\'une mauvaise sélection de LMS',
          excerpt: 'Pourquoi les décisions de plateforme prises sans expertise pédagogique mènent souvent à des corrections coûteuses.',
          readTime: '6 min de lecture',
        },
        {
          category: 'Développement du leadership',
          title: 'Excellence bilingue: Un avantage compétitif',
          excerpt: 'Dans le paysage bilingue du Canada, la maîtrise de la communication dans les deux langues n\'est plus optionnelle—c\'est stratégique.',
          readTime: '5 min de lecture',
        },
      ],
    },
    clients: {
      badge: 'Ils nous font confiance',
      title: 'Organisations partenaires',
      logos: [
        { name: 'Secteur public', abbr: 'Secteur public' },
        { name: 'Écoles & Organisations EdTech', abbr: 'Écoles & EdTech' },
        { name: 'Secteur privé', abbr: 'Secteur privé' },
      ],
    },
    approach: {
      badge: 'Notre approche',
      title: 'Comment nous travaillons',
      subtitle: 'Une méthodologie structurée qui assure clarté, alignement et résultats mesurables',
      steps: [
        {
          number: '01',
          title: 'Découverte & Diagnostic',
          desc: 'Nous commençons par une écoute approfondie. Comprendre votre contexte, vos défis et vos aspirations avant de proposer des solutions.',
        },
        {
          number: '02',
          title: 'Stratégie & Conception',
          desc: 'Développement collaboratif d\'une feuille de route claire. Chaque recommandation est ancrée dans les meilleures pratiques pédagogiques et la faisabilité pratique.',
        },
        {
          number: '03',
          title: 'Implémentation & Support',
          desc: 'Exécution pratique avec raffinement continu. Nous restons engagés jusqu\'à ce que la solution livre une valeur mesurable.',
        },
      ],
    },
    founder: {
      badge: 'Direction',
      name: 'Meet Steven Barholere',
      title: 'Fondateur et directeur exécutif',
      bio: 'Avec plus de 15 ans à l\'intersection de l\'éducation, de la technologie et de la communication, Steven a fondé Barholex Media pour aider les organisations à naviguer dans les complexités de l\'apprentissage moderne. Son parcours unique combine une expertise académique en conception pédagogique avec une expérience pratique en communications gouvernementales et innovation EdTech.',
      credentials: [
        'M.Éd. en technologie éducative',
        'Coach exécutif certifié (ICF)',
        'Ancien conseiller principal, Gouvernement du Canada',
        'Chercheur publié en apprentissage assisté par IA',
      ],
      quote: 'Notre mission est de démocratiser l\'accès aux expériences d\'apprentissage premium grâce à l\'application intelligente de l\'IA et des méthodes pédagogiques éprouvées.',
    },
    cta: {
      title: 'Prêt à transformer votre approche?',
      subtitle: 'Discutons de comment la réflexion stratégique et l\'expertise pratique peuvent vous aider à atteindre vos objectifs d\'apprentissage et de communication.',
      button1: 'Planifier un appel découverte',
      button2: 'Envoyer une demande',
    },
  },
};

const iconMap: Record<string, React.ElementType> = {
  Brain,
  Zap,
  Target,
  Lightbulb,
  Video,
  Users,
  Award,
  Globe,
  Layers,
  BarChart3,
  BookOpen,
  Building2,
  GraduationCap,
  Briefcase,
  Shield,
  Star,
};

export default function BarholexMediaLanding() {
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const [activeExpertise, setActiveExpertise] = useState(0);

  useEffect(() => {
    const savedLang = localStorage.getItem('ecosystem-lang') as 'en' | 'fr' | null;
    if (savedLang) setLang(savedLang);
  }, []);

  const t = labels[lang];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEO
        title="Barholex Media - EdTech Innovation & Strategic Consulting"
        description="Strategic consulting, content innovation, and EdTech solutions for organizations ready to transform how they learn and communicate."
        canonical="https://www.rusingacademy.ca/barholex-media"
      />

      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-8 pb-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-slate-50/30 to-white">
        {/* Elegant floating orbs for depth */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-20 right-[10%] w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ background: `${colors.gold}15`, animationDuration: '8s' }}
          />
          <div 
            className="absolute top-40 left-[5%] w-80 h-80 rounded-full blur-3xl animate-pulse"
            style={{ background: `${colors.navy}08`, animationDuration: '10s', animationDelay: '2s' }}
          />
          <div 
            className="absolute bottom-20 right-[20%] w-72 h-72 rounded-full blur-3xl animate-pulse"
            style={{ background: '#7C3AED10', animationDuration: '12s', animationDelay: '4s' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Text content */}
            <div className="max-w-2xl">
              {/* Badge */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
              >
                <span 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm"
                  style={{ 
                    background: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FCD34D'
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  {t.hero.badge}
                </span>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-8 text-slate-800"
              >
                {t.hero.title}
                <br />
                <span className="bg-gradient-to-r from-amber-600 via-violet-600 to-teal-600 bg-clip-text text-transparent">{t.hero.titleHighlight}</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg lg:text-xl leading-relaxed mb-10 text-slate-600"
              >
                {t.hero.subtitle}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <a
                  href="https://calendly.com/steven-barholere/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-gradient-to-r from-amber-600 via-violet-600 to-teal-600"
                >
                  {t.hero.cta1}
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#expertise"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-[1.02] text-slate-700 bg-white border-2 border-slate-200 hover:border-amber-400 shadow-sm"
                >
                  {t.hero.cta2}
                </a>
              </motion.div>
            </div>

            {/* Right side - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              {/* Glassmorphism frame behind the image */}
              <div 
                className="absolute -inset-4 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset'
                }}
              />
              
              {/* Gold accent glow */}
              <div 
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-3xl"
                style={{ background: colors.gold }}
              />
              
              {/* The image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  loading="lazy" src="https://rusingacademy-cdn.b-cdn.net/images/studio-steven-10.png"
                  alt="Barholex Media Professional Studio - EdTech Innovation"
                  className="w-full h-auto object-cover"
                  style={{
                    aspectRatio: '16/10',
                    maxHeight: '500px'
                  }}
                />
                
                {/* Subtle overlay gradient */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, transparent 60%, rgba(26,35,54,0.1) 100%)'
                  }}
                />
              </div>
              
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -bottom-4 -left-4 px-5 py-3 rounded-xl shadow-lg"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.5)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: colors.goldMuted }}
                  >
                    <Play className="w-4 h-4" style={{ color: colors.gold }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Professional Studio</p>
                    <p className="text-sm font-semibold" style={{ color: colors.navy }}>EdTech Production</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </section>

      {/* ========== POSITIONING SECTION ========== */}
      <section className="py-20 lg:py-28" style={{ background: colors.offWhite }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: colors.navy }}
            >
              {t.positioning.title}
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl max-w-3xl mx-auto"
              style={{ color: colors.textMuted }}
            >
              {t.positioning.lead}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {t.positioning.points.map((point, index) => {
              const Icon = iconMap[point.icon];
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="relative p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: colors.goldMuted }}
                  >
                    <Icon className="w-7 h-7" style={{ color: colors.gold }} />
                  </div>
                  <h3 
                    className="text-xl font-bold mb-3"
                    style={{ color: colors.navy }}
                  >
                    {point.title}
                  </h3>
                  <p style={{ color: colors.textMuted }}>
                    {point.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========== EXPERTISE SECTION ========== */}
      <section id="expertise" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ 
                background: colors.goldMuted,
                color: colors.gold,
              }}
            >
              {t.expertise.badge}
            </span>
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: colors.navy }}
            >
              {t.expertise.title}
            </h2>
            <p 
              className="text-xl max-w-3xl mx-auto"
              style={{ color: colors.textMuted }}
            >
              {t.expertise.subtitle}
            </p>
          </motion.div>

          {/* Expertise tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {t.expertise.items.map((item, index) => {
              const Icon = iconMap[item.icon];
              return (
                <button
                  key={index}
                  onClick={() => setActiveExpertise(index)}
                  aria-pressed={activeExpertise === index}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeExpertise === index
                      ? 'text-white shadow-lg'
                      : 'bg-white border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    background: activeExpertise === index ? colors.navy : undefined,
                    color: activeExpertise === index ? 'white' : colors.navy,
                  }}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {item.title.split(' ').slice(0, 2).join(' ')}
                </button>
              );
            })}
          </div>

          {/* Active expertise content */}
          <motion.div
            key={activeExpertise}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Image */}
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-3xl opacity-20 blur-3xl"
                style={{ background: colors.gold }}
              />
              <img
                loading="lazy" src={t.expertise.items[activeExpertise].image}
                alt={t.expertise.items[activeExpertise].title}
                className="relative rounded-3xl shadow-2xl w-full aspect-[4/3] object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop';
                }}
              />
            </div>

            {/* Content */}
            <div>
              <h3 
                className="text-2xl sm:text-3xl font-bold mb-4"
                style={{ color: colors.navy }}
              >
                {t.expertise.items[activeExpertise].title}
              </h3>
              <p 
                className="text-lg mb-8 leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                {t.expertise.items[activeExpertise].desc}
              </p>
              <ul className="space-y-4">
                {t.expertise.items[activeExpertise].features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: colors.goldMuted }}
                    >
                      <CheckCircle className="w-4 h-4" style={{ color: colors.gold }} />
                    </div>
                    <span style={{ color: colors.text }}>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://calendly.com/steven-barholere/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 font-semibold transition-all hover:gap-3"
                style={{ color: colors.gold }}
              >
                Learn more about this service
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== INSIGHTS SECTION ========== */}
      <section className="py-20 lg:py-28" style={{ background: colors.navy, backgroundColor: '#2d2e10' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                color: colors.goldLight,
              }}
            >
              {t.insights.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
              {t.insights.title}
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-white/70" style={{color: '#f6f7f8'}}>
              {t.insights.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {t.insights.items.map((item, index) => (
              <motion.article
                key={index}
                variants={fadeInUp}
                className="group relative p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span 
                  className="text-sm font-medium mb-4 block"
                  style={{ color: colors.goldLight }}
                >
                  {item.category}
                </span>
                <h3 className="text-xl font-bold mb-4 text-white leading-tight">
                  {item.title}
                </h3>
                <p className="text-white/60 mb-6 leading-relaxed" style={{color: '#ffffff'}}>
                  {item.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/75">{item.readTime}</span>
                  <span 
                    className="inline-flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2"
                    style={{ color: colors.goldLight }}
                  >
                    Read article
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== CLIENTS/TRUST SECTION ========== */}
      <section className="py-16 lg:py-20" style={{ background: colors.offWhite, backgroundColor: '#d3d3a7' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <span 
              className="text-sm font-medium uppercase tracking-wider"
              style={{ color: colors.textLight }}
            >
              {t.clients.badge}
            </span>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-wrap justify-center items-center gap-8 lg:gap-16"
          >
            {t.clients.logos.map((logo, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="flex items-center justify-center px-8 py-6 rounded-xl"
                style={{ background: colors.warmGray }}
              >
                <span 
                  className="text-lg font-semibold text-center"
                  style={{ color: colors.slate }}
                >
                  {logo.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== APPROACH SECTION ========== */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ 
                background: colors.goldMuted,
                color: colors.gold,
              }}
            >
              {t.approach.badge}
            </span>
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: colors.navy }}
            >
              {t.approach.title}
            </h2>
            <p 
              className="text-xl max-w-3xl mx-auto"
              style={{ color: colors.textMuted }}
            >
              {t.approach.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {t.approach.steps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                {/* Connector line */}
                {index < t.approach.steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gray-200 -translate-x-1/2" />
                )}
                
                <div className="text-center">
                  <div 
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 text-3xl font-bold"
                    style={{ 
                      background: colors.goldMuted,
                      color: colors.gold,
                    }}
                  >
                    {step.number}
                  </div>
                  <h3 
                    className="text-xl font-bold mb-4"
                    style={{ color: colors.navy }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: colors.textMuted }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== FOUNDER SECTION ========== */}
      <section className="py-20 lg:py-28" style={{ background: colors.offWhite }}>
        <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-5 gap-12 items-center"
          >
            {/* Image with alternating animation */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <div className="relative">
                <div 
                  className="absolute -inset-4 rounded-3xl opacity-20"
                  style={{ background: colors.gold }}
                />
                <FounderImageCarousel founderName={t.founder.name} />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div variants={fadeInUp} className="lg:col-span-3">
              <span 
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{ background: colors.goldMuted, color: colors.gold }}
              >
                {t.founder.badge}
              </span>
              <h2 
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{ color: colors.navy }}
              >
                {t.founder.name}
              </h2>
              <p 
                className="text-lg mb-6"
                style={{ color: colors.gold }}
              >
                {t.founder.title}
              </p>
              <p 
                className="text-lg mb-8 leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                {t.founder.bio}
              </p>

              {/* Credentials */}
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {t.founder.credentials.map((cred, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.gold }} />
                    <span className="text-sm" style={{ color: colors.text }}>{cred}</span>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <blockquote 
                className="pl-6 border-l-4 italic text-lg"
                style={{ borderColor: colors.gold, color: colors.textMuted }}
              >
                "{t.founder.quote}"
              </blockquote>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Cross-Ecosystem Section */}
      <CrossEcosystemSection variant="barholex" />

      {/* ========== FINAL CTA SECTION ========== */}
      <section 
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{ background: colors.navy, backgroundColor: '#2d2e10' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${colors.gold} 0%, transparent 70%)` }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5"
            style={{ background: `radial-gradient(circle, white 0%, transparent 70%)` }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
              {t.cta.title}
            </h2>
            <p className="text-xl mb-10 text-white/70 max-w-2xl mx-auto" style={{color: '#ffffff'}}>
              {t.cta.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://calendly.com/steven-barholere/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{ background: colors.gold, color: colors.navy }}
              >
                <Calendar className="w-5 h-5" />
                {t.cta.button1}
              </a>
              <a
                href="mailto:contact@barholexmedia.com?subject=Inquiry"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
                style={{ border: '2px solid rgba(255,255,255,0.3)' }}
              >
                {t.cta.button2}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Free 30-min consultation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>No commitment required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Custom solutions</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <FooterInstitutional />
    </div>
  );
}
