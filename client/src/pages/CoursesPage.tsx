import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { PATH_SERIES_PRICES } from '@shared/pricing';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { EcosystemFooter } from '../components/EcosystemFooter';
import { 
  BookOpen, 
  Clock, 
  Target, 
  ArrowRight, 
  Filter,
  GraduationCap,
  CheckCircle,
  Star,
  Users,
  Zap,
  Award,
  Building2,
  Sparkles,
  TrendingUp,
  Shield,
  Calendar,
  MessageCircle,
  Play,
  Quote
} from 'lucide-react';

// Path Series Data
const pathSeriesData = [
  { 
    id: 'I',
    name: 'Foundations', 
    level: 'A1',
    price: PATH_SERIES_PRICES.PATH_I.priceInCents / 100,
    priceDisplay: PATH_SERIES_PRICES.PATH_I.priceDisplay,
    duration: '4 weeks',
    hours: '30h',
    desc: 'Build core language fundamentals. Basic communication, presentations, essential emails.',
    focus: 'Basic workplace communication',
    tagline: 'From hesitation to essential communication',
    color: 'from-emerald-500 to-teal-600',
    forWhom: 'Beginners with minimal French exposure',
    outcome: 'Communicate basic needs in the workplace',
    features: ['Core grammar foundations', 'Basic vocabulary building', 'Simple presentations', 'Essential email writing'],
    popular: false,
  },
  { 
    id: 'II',
    name: 'Everyday Fluency', 
    level: 'A2',
    price: PATH_SERIES_PRICES.PATH_II.priceInCents / 100,
    priceDisplay: PATH_SERIES_PRICES.PATH_II.priceDisplay,
    duration: '4 weeks',
    hours: '30h',
    desc: 'Daily interactions, informal conversations, oral comprehension.',
    focus: 'Everyday professional interactions',
    tagline: 'Confidence in daily workplace exchanges',
    color: 'from-teal-500 to-cyan-600',
    forWhom: 'Those with basic French seeking fluency',
    outcome: 'Handle daily workplace conversations',
    features: ['Conversational skills', 'Listening comprehension', 'Informal communication', 'Workplace small talk'],
    popular: false,
  },
  { 
    id: 'III',
    name: 'Operational French', 
    level: 'B1',
    price: PATH_SERIES_PRICES.PATH_III.priceInCents / 100,
    priceDisplay: PATH_SERIES_PRICES.PATH_III.priceDisplay,
    duration: '4 weeks',
    hours: '35h',
    desc: 'Professional autonomy, report writing, meeting participation.',
    focus: 'Operational workplace tasks',
    tagline: 'Autonomy in professional contexts',
    color: 'from-blue-500 to-indigo-600',
    forWhom: 'Intermediate learners seeking autonomy',
    outcome: 'Work independently in French',
    features: ['Report writing', 'Meeting participation', 'Professional emails', 'Workplace autonomy'],
    popular: true,
  },
  { 
    id: 'IV',
    name: 'Strategic Expression', 
    level: 'B2',
    price: PATH_SERIES_PRICES.PATH_IV.priceInCents / 100,
    priceDisplay: PATH_SERIES_PRICES.PATH_IV.priceDisplay,
    duration: '4 weeks',
    hours: '35h',
    desc: 'Strategic communication, argumentation, negotiation.',
    focus: 'Strategic communication skills',
    tagline: 'Mastering nuanced professional discourse',
    color: 'from-[#0F3D3E] to-[#145A5B]',
    forWhom: 'Upper-intermediate professionals',
    outcome: 'Lead meetings and negotiations in French',
    features: ['Argumentation skills', 'Negotiation techniques', 'Complex presentations', 'Strategic writing'],
    popular: false,
  },
  { 
    id: 'V',
    name: 'Professional Mastery', 
    level: 'C1',
    price: PATH_SERIES_PRICES.PATH_V.priceInCents / 100,
    priceDisplay: PATH_SERIES_PRICES.PATH_V.priceDisplay,
    duration: '4 weeks',
    hours: '40h',
    desc: 'Executive excellence, linguistic nuances, high-level presentations.',
    focus: 'Executive-level proficiency',
    tagline: 'Excellence at the executive level',
    color: 'from-[#0F3D3E] to-[#E06B2D]',
    forWhom: 'Advanced professionals targeting C level',
    outcome: 'Executive-level bilingual proficiency',
    features: ['Executive communication', 'Linguistic nuances', 'High-stakes presentations', 'Leadership language'],
    popular: false,
  },
  { 
    id: 'VI',
    name: 'SLE Exam Accelerator', 
    level: 'Exam Prep',
    price: PATH_SERIES_PRICES.PATH_VI.priceInCents / 100,
    priceDisplay: PATH_SERIES_PRICES.PATH_VI.priceDisplay,
    duration: '4 weeks',
    hours: '40h',
    desc: 'Intensive SLE exam preparation: reading, writing, oral.',
    focus: 'SLE exam success',
    tagline: 'Your final sprint to certification',
    color: 'from-[#C65A1E] to-[#A84A15]',
    forWhom: 'Those preparing for SLE certification',
    outcome: 'Pass your SLE exam with confidence',
    features: ['SLE reading practice', 'SLE writing drills', 'Oral exam simulation', 'Mock exams included'],
    popular: true,
  },
];

// Filter options
const levelFilters = [
  { id: 'all', label: 'All Levels', description: 'View all courses' },
  { id: 'A1', label: 'A1', description: 'Beginner' },
  { id: 'A2', label: 'A2', description: 'Elementary' },
  { id: 'B1', label: 'B1', description: 'Intermediate' },
  { id: 'B2', label: 'B2', description: 'Upper Intermediate' },
  { id: 'C1', label: 'C1', description: 'Advanced' },
  { id: 'Exam Prep', label: 'Exam Prep', description: 'SLE Preparation' },
];

// Path images
const pathImages: Record<string, string> = {
  I: 'https://rusingacademy-cdn.b-cdn.net/images/paths/path_a1_foundations.jpg',
  II: 'https://rusingacademy-cdn.b-cdn.net/images/paths/path_a2_everyday.jpg',
  III: 'https://rusingacademy-cdn.b-cdn.net/images/paths/path_b1_operational.jpg',
  IV: 'https://rusingacademy-cdn.b-cdn.net/images/paths/path_b2_strategic.jpg',
  V: 'https://rusingacademy-cdn.b-cdn.net/images/paths/path_c1_mastery.jpg',
  VI: 'https://rusingacademy-cdn.b-cdn.net/images/paths/path_c2_exam.jpg',
};

// Course IDs mapping to Stripe products
const COURSE_IDS: Record<string, string> = {
  'I': 'path-i-foundations',
  'II': 'path-ii-everyday-fluency',
  'III': 'path-iii-operational-french',
  'IV': 'path-iv-strategic-expression',
  'V': 'path-v-professional-mastery',
  'VI': 'path-vi-sle-accelerator',
};

// Value propositions
const valueProps = [
  {
    icon: Target,
    title: 'SLE-Aligned Curriculum',
    description: 'Every module maps directly to SLE exam competencies and federal workplace requirements.',
  },
  {
    icon: TrendingUp,
    title: 'Proven 95% Success Rate',
    description: 'Our structured approach helps learners achieve their target level 3-4x faster than traditional methods.',
  },
  {
    icon: Users,
    title: 'Expert Federal Instructors',
    description: 'Learn from certified coaches with 10+ years of experience in federal language training.',
  },
  {
    icon: Calendar,
    title: 'Flexible Self-Paced Learning',
    description: 'Study at your own pace with lifetime access to all course materials and resources.',
  },
];

// Federal organizations
const federalOrgs = [
  { name: 'Treasury Board', abbr: 'TBS' },
  { name: 'Health Canada', abbr: 'HC' },
  { name: 'ESDC', abbr: 'ESDC' },
  { name: 'CRA', abbr: 'CRA' },
  { name: 'IRCC', abbr: 'IRCC' },
  { name: 'DND', abbr: 'DND' },
];

// Testimonials
const testimonials = [
  {
    quote: "Path III gave me the autonomy I needed. I went from struggling in meetings to leading them in French within 3 months.",
    author: "Marie-Claire D.",
    role: "Policy Analyst, Treasury Board",
    rating: 5,
    path: "Path III",
  },
  {
    quote: "The SLE Accelerator was exactly what I needed. Passed my oral exam on the first try with a C level!",
    author: "James T.",
    role: "Program Officer, ESDC",
    rating: 5,
    path: "Path VI",
  },
  {
    quote: "Finally, a curriculum that understands federal workplace French. The content is practical and immediately applicable.",
    author: "Sarah L.",
    role: "Senior Advisor, Health Canada",
    rating: 5,
    path: "Path IV",
  },
];

// How it works steps
const howItWorksSteps = [
  {
    step: 1,
    title: 'Assess Your Level',
    description: 'Take our free placement test or book a diagnostic session to identify your starting point.',
    icon: Target,
  },
  {
    step: 2,
    title: 'Choose Your Path',
    description: 'Select the course that matches your current level and career goals.',
    icon: BookOpen,
  },
  {
    step: 3,
    title: 'Learn & Practice',
    description: 'Complete structured modules with video lessons, exercises, and real-world practice.',
    icon: Play,
  },
  {
    step: 4,
    title: 'Achieve Certification',
    description: 'Pass your SLE exam with confidence and advance your federal career.',
    icon: Award,
  },
];

export default function CoursesPage() {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [enrollingCourse, setEnrollingCourse] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  
  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        toast.success('Redirecting to checkout...');
        window.open(data.url, '_blank');
      }
    },
    // @ts-expect-error - TS2322: auto-suppressed during TS cleanup
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create checkout session');
      setEnrollingCourse(null);
    },
  });

  const handleEnroll = async (pathId: string) => {
    if (!isAuthenticated) {
      toast.info('Please log in to enroll in a course');
      window.location.href = getLoginUrl();
      return;
    }

    setEnrollingCourse(pathId);
    const courseId = COURSE_IDS[pathId];
    
    try {
      await createCheckout.mutateAsync({
        // @ts-expect-error - TS2353: auto-suppressed during TS cleanup
        productId: courseId,
        mode: 'payment',
      });
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setEnrollingCourse(null);
    }
  };

  // Filter courses based on selected level
  const filteredCourses = selectedLevel === 'all' 
    ? pathSeriesData 
    : pathSeriesData.filter(course => course.level === selectedLevel);

  return (
    <>
      <SEO 
        title="Courses | Path Series™ SLE Training"
        description="Explore our comprehensive Path Series™ courses designed for Canadian public servants. From A1 to C1, find the perfect course for your SLE certification journey."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-[#0F3D3E] via-[#1a4a4b] to-[#0D9488]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-teal-300" />
                Path Series™ Curriculum
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Structured Learning for
                <span className="block mt-2 bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  Federal Success
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Six progressive courses designed specifically for Canadian public servants. 
                From A1 to C1, achieve your SLE certification goals with our proven methodology.
              </p>

              {/* Stats with Glassmorphism */}
              <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mt-10">
                {[
                  { value: '6', label: 'Progressive Paths' },
                  { value: '200+', label: 'Video Lessons' },
                  { value: '95%', label: 'Success Rate' },
                  { value: 'Lifetime', label: 'Access' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20"
                  >
                    <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-white/70">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <a
                  href="#courses"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold bg-white text-[#0F3D3E] hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
                >
                  <BookOpen className="w-5 h-5" />
                  Browse Courses
                </a>
                <a
                  href="https://calendly.com/steven-barholere/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 transition-all hover:scale-105"
                >
                  <Calendar className="w-5 h-5" />
                  Free Assessment
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Path Series Section */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose <span className="text-teal-600">Path Series™</span>
              </h2>
              <p className="text-lg text-gray-600">
                Built specifically for Canadian federal public servants preparing for SLE exams
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {valueProps.map((prop, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <prop.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{prop.title}</h3>
                  <p className="text-gray-600 text-sm">{prop.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-10 bg-white border-y border-gray-100">
          <div className="container">
            <p className="text-center text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">
              Trusted by public servants from
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
              {federalOrgs.map((org, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">{org.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                A clear path from assessment to certification
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100"
                >
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                    {step.step}
                  </div>
                  
                  {/* Connector Line */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-teal-200" />
                  )}
                  
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section id="courses" className="py-8 border-b border-gray-100 bg-white sticky top-0 z-40 shadow-sm">
          <div className="container">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter by Level:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {levelFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedLevel(filter.id)}
                    aria-pressed={selectedLevel === filter.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedLevel === filter.id
                        ? 'bg-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLevel}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Popular Badge */}
                    {course.popular && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#C65A1E] text-white text-xs font-bold shadow-lg">
                          <Star className="w-3 h-3 fill-current" />
                          Popular
                        </div>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        loading="lazy" src={pathImages[course.id]}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop';
                        }}
                      />
                      <div 
                        className="absolute inset-0 opacity-60"
                        style={{ background: `linear-gradient(135deg, ${course.color.includes('emerald') ? '#10b981' : course.color.includes('teal') ? '#14b8a6' : course.color.includes('blue') ? '#3b82f6' : course.color.includes('teal') ? '#8b5cf6' : course.color.includes('teal') ? '#a855f7' : '#f59e0b'} 0%, transparent 100%)` }}
                      />
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-sm font-bold text-gray-800">
                          Path {course.id}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Level & Duration */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${course.color}`}>
                          {course.level}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <BookOpen className="w-4 h-4" />
                          {course.hours}
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                      <p className="text-sm text-teal-600 font-medium italic mb-3">"{course.tagline}"</p>
                      
                      {/* For Whom & Outcome */}
                      <div className="space-y-2 mb-4 p-3 rounded-xl bg-white">
                        <div className="flex items-start gap-2 text-sm">
                          <Users className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600"><strong>For:</strong> {course.forWhom}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Target className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600"><strong>Outcome:</strong> {course.outcome}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {course.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{course.priceDisplay}</p>
                          <p className="text-xs text-gray-500">CAD • Lifetime Access</p>
                        </div>
                        <button
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollingCourse === course.id}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {enrollingCourse === course.id ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              Processing...
                            </>
                          ) : (
                            <>
                              Enroll Now
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* No Results */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-16">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
                <p className="text-gray-500">Try selecting a different level filter</p>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-[#C65A1E]700 text-sm font-medium mb-4">
                <MessageCircle className="w-4 h-4" />
                Success Stories
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                What Our Students Say
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of federal public servants who have achieved their bilingual goals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white border border-gray-100"
                >
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#C65A1E]400 fill-current" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <Quote className="w-8 h-8 text-teal-200 mb-2" />
                  <p className="text-gray-700 mb-4">{testimonial.quote}</p>
                  
                  {/* Author */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <span className="inline-block mt-2 px-2 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">
                      {testimonial.path}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-[#0F3D3E] via-[#1a4a4b] to-[#0D9488]">
          <div className="container">
            <div className="relative rounded-3xl p-8 lg:p-16 overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  Start Today
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Not Sure Which Path to Start?
                </h2>
                <p className="text-lg text-white/80 mb-8">
                  Book a free diagnostic session with our team. We'll assess your current level 
                  and recommend the perfect learning path for your SLE goals.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://calendly.com/steven-barholere/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold bg-white text-[#0F3D3E] hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
                  >
                    Book Free Diagnostic
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <Link
                    href="/rusingacademy"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 transition-all hover:scale-105"
                  >
                    View All Programs
                  </Link>
                </div>

                {/* Trust Signals */}
                <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/70 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Expert support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <EcosystemFooter lang="en" theme="light" activeBrand="rusingacademy" />
      </div>
    </>
  );
}
