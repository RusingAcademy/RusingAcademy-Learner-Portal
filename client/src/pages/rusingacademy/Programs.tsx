import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  Clock,
  BookOpen,
  Target,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";

// Path Series Data
const pathsFSL = [
  {
    id: "I",
    name: "FSL - Foundations",
    level: "CEFR Level A1 | Beginner",
    tagline: "Crash Course in Essential Communication Foundations",
    description: "Build the fundamental communication skills required for basic professional interactions. Learn to introduce yourself, ask simple questions, understand basic messages, and complete essential forms in a workplace context.",
    outcomes: [
      "Present yourself and others professionally",
      "Ask and answer simple questions about familiar topics",
      "Understand and use everyday workplace expressions",
      "Describe your workspace and daily routine",
      "Complete administrative forms accurately",
      "Write simple professional messages",
    ],
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    autonomousPractice: "80-130 Hours",
    pfl2Level: "OF 1-6",
    price: 899,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "II",
    name: "FSL - Everyday Fluency",
    level: "CEFR Level A2 | Elementary",
    tagline: "Crash Course in Everyday Workplace Interactions",
    description: "Develop confidence in daily professional interactions. Learn to discuss past events, future plans, and personal opinions. Engage in routine workplace conversations with increasing spontaneity and accuracy.",
    outcomes: [
      "Narrate past events using appropriate tenses",
      "Discuss future projects and plans confidently",
      "Express simple opinions and preferences",
      "Understand short texts on familiar topics",
      "Write basic professional emails and messages",
      "Participate in routine workplace exchanges",
    ],
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    autonomousPractice: "80-130 Hours",
    pfl2Level: "OF 7-12",
    price: 899,
    color: "from-[#0F3D3E] to-[#145A5B]",
  },
  {
    id: "III",
    name: "FSL - Operational French",
    level: "CEFR Level B1 | Intermediate",
    tagline: "Crash Course in Professional Communication for Public Servants",
    description: "Achieve functional professional autonomy. Develop the ability to present arguments, participate in debates, write structured reports, and handle most workplace communication situations independently and effectively.",
    outcomes: [
      "Present and defend viewpoints with structured arguments",
      "Narrate complex events using multiple tenses",
      "Understand main points of presentations and speeches",
      "Write structured reports and meeting minutes",
      "Participate in conversations with spontaneity",
      "Handle unpredictable workplace situations",
    ],
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    autonomousPractice: "80-130 Hours",
    pfl2Level: "OF 13-22",
    price: 999,
    color: "from-[#D97B3D] to-[#C65A1E]",
  },
  {
    id: "IV",
    name: "FSL - Strategic Expression",
    level: "CEFR Level B2 | Upper Intermediate",
    tagline: "Crash Course in Strategic Workplace Communication",
    description: "Master precision, nuance, and leadership communication. Develop advanced grammatical structures (subjunctive, conditional), persuasive argumentation skills, and the ability to communicate effectively in complex professional contexts.",
    outcomes: [
      "Express hypotheses, conditions, and nuanced opinions",
      "Analyze complex texts and extract key information",
      "Develop persuasive, well-structured arguments",
      "Communicate with fluency and spontaneity",
      "Write detailed, coherent professional documents",
      "Engage confidently in debates and negotiations",
    ],
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    autonomousPractice: "80-130 Hours",
    pfl2Level: "OF 23-32",
    price: 1099,
    color: "from-[#0F3D3E] to-[#145A5B]",
  },
  {
    id: "V",
    name: "FSL - Professional Mastery",
    level: "CEFR Level C1 | Advanced",
    tagline: "Crash Course in Advanced Professional Excellence",
    description: "Achieve expert-level communication with idiomatic mastery and cultural sophistication. Develop the advanced competencies required for executive roles: facilitating meetings, negotiating complex issues, and producing high-quality professional documents.",
    outcomes: [
      "Use idiomatic expressions and cultural references naturally",
      "Express yourself precisely on complex topics",
      "Facilitate meetings and lead negotiations with authority",
      "Produce sophisticated, well-structured documents",
      "Understand implicit meanings and subtle nuances",
      "Communicate at executive and leadership levels",
    ],
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    autonomousPractice: "80-130 Hours",
    pfl2Level: "OF 33-40",
    price: 1199,
    color: "from-[#C65A1E] to-[#E06B2D]",
  },
  {
    id: "VI",
    name: "FSL - SLE Accelerator",
    level: "Exam Preparation | Intensive",
    tagline: "Crash Course in SLE Success Strategies",
    description: "Intensive preparation specifically designed for Second Language Evaluation (SLE) success. Master exam strategies, complete five full practice exams with detailed feedback, and develop the confidence and techniques needed for maximum performance.",
    outcomes: [
      "Master SLE exam structure and evaluation criteria",
      "Apply proven test-taking strategies for each component",
      "Complete 5 full practice exams under timed conditions",
      "Receive detailed feedback on all practice attempts",
      "Develop stress management and performance techniques",
      "Target and remediate specific weaknesses",
    ],
    duration: "4 Weeks",
    structuredHours: "30 Hours",
    practiceExams: "5 Complete",
    coachingSessions: "5-Hour Quick Prep",
    price: 1299,
    color: "from-red-500 to-[#C65A1E]",
  },
];

const bundles = [
  {
    id: 1,
    name: "Complete French Pathway – Fast Track to BBB",
    originalPrice: 2797,
    price: 2697,
    savings: 100,
    paths: ["Path I: Foundations (A1)", "Path II: Everyday Fluency (A2)", "Path III: Operational French (B1)"],
    features: [
      "Achieve BBB-level competency in 12 weeks",
      "Ideal for first-time SLE candidates",
      "Comprehensive beginner to intermediate progression",
      "12 months platform access",
    ],
    popular: false,
  },
  {
    id: 2,
    name: "Complete French Pathway – Fast Track to CBC - CCC",
    originalPrice: 6394,
    price: 6194,
    savings: 200,
    paths: [
      "Path I: Foundations (A1)",
      "Path II: Everyday Fluency (A2)",
      "Path III: Operational French (B1)",
      "Path IV: Strategic Expression (B2)",
      "Path V: Professional Mastery (C1)",
      "Path VI: SLE Accelerator (Exam Prep)",
    ],
    features: [
      "Complete progression from beginner to advanced",
      "12 months platform access + 6 months extended",
    ],
    popular: true,
  },
  {
    id: 3,
    name: "Institutional Plan (Bilingual Excellence)",
    originalPrice: 12488,
    price: 11988,
    savings: 500,
    paths: ["All 6 French Paths (I-VI)", "All 6 English Paths (I-VI)"],
    features: [
      "Complete bilingual mastery (12 Paths total)",
      "Premium coaching package included",
      "Unlimited Booster Week access (1 year)",
      "Priority support and scheduling",
      "Exclusive Bilingual Champion Certificate",
      "Lifetime community access",
    ],
    popular: false,
    bestValue: true,
  },
];

const targetProfiles = [
  {
    title: "Career-Focused Public Servants",
    description: "Federal employees who recognize that bilingual proficiency is essential for career advancement, particularly those seeking positions at the EX (Executive) level or in designated bilingual regions.",
    examples: ["Aspiring managers and executives", "Policy analysts and advisors", "Program officers and coordinators", "Communications specialists"],
    icon: TrendingUp,
  },
  {
    title: "SLE/ELP Exam Candidates",
    description: "Professionals who have upcoming Second Language Evaluation (SLE) or English Language Proficiency (ELP) exams and need targeted, efficient preparation to achieve their required level (A, B, or C).",
    examples: ["First-time exam takers", "Candidates retaking after previous attempts", "Those needing to upgrade from B to C", "Employees with exam deadlines"],
    icon: Target,
  },
  {
    title: "Busy Working Professionals",
    description: "Individuals who cannot commit to traditional full-time language training but need an accelerated, flexible program that accommodates their work schedules and family responsibilities.",
    examples: ["Full-time employees seeking evening/weekend options", "Parents balancing work and family", "Remote workers across Canada", "Those requiring self-paced flexibility"],
    icon: Clock,
  },
  {
    title: "Motivated Self-Directed Learners",
    description: "Individuals who thrive in structured yet autonomous learning environments and are committed to the intensive practice required for rapid language acquisition (80-130 hours of autonomous practice per Path).",
    examples: ["Self-motivated achievers", "Those who prefer blended learning", "Individuals comfortable with technology", "Goal-oriented professionals"],
    icon: Zap,
  },
  {
    title: "Francophone Learning English",
    description: "Native French speakers in the public service who need to develop or strengthen their English language competency for professional advancement or role requirements.",
    examples: ["Quebec-based federal employees", "Francophone employees in bilingual positions", "Those preparing for ELP exams", "Professionals seeking C-level English"],
    icon: Users,
  },
  {
    title: "Anglophone Learning French",
    description: "Native English speakers who need to acquire or improve French language skills to meet position requirements, qualify for promotions, or work effectively in bilingual environments.",
    examples: ["Employees in NCR (National Capital Region)", "Those seeking bilingual positions", "Professionals preparing for SLE exams", "Individuals aiming for executive roles"],
    icon: GraduationCap,
  },
];

export default function Programs() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F3] via-white to-teal-50/30">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#FFE4D6]/30 to-[#FFE4D6]/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#0F3D3E]/20 to-[#145A5B]/20 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-[#FFF0E6] to-[#FFF0E6] text-[#C65A1E] border-[#FFE4D6]">
              <Sparkles className="w-4 h-4 mr-2" />
              Exclusive Professional Training
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gray-900">Discover Your Path to</span>
              <br />
              <span className="bg-gradient-to-r from-[#C65A1E] via-amber-500 to-teal-500 bg-clip-text text-transparent">
                Bilingual Excellence
              </span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
              GC Bilingual Mastery Series
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              An Accelerated Language Training for Canadian Public Service Excellence.
              <br />
              <span className="font-semibold text-orange-600">"Learn Fast, Consolidate Deeply"</span>
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button size="lg" className="bg-gradient-to-r from-[#C65A1E] to-[#D97B3D] hover:from-[#A84A15] hover:to-[#C65A1E] text-white shadow-lg">
                Explore the Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-orange-300 text-[#C65A1E] hover:bg-orange-50">
                View All Paths
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
              {[
                { value: "6", label: "Complete Learning Paths" },
                { value: "2,500+", label: "Successful Graduates" },
                { value: "3-4x", label: "Faster Than Traditional" },
                { value: "100%", label: "Aligned with CEFR & PSC" },
                { value: "40", label: "PFL2 Objectives Integrated" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#C65A1E] to-teal-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Path Series Methodology */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Badge className="mb-4 bg-teal-100 text-teal-700">Proprietary Framework</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Path Series™ Methodology
            </h2>
            <p className="text-lg text-gray-600">
              At the heart of our program lies the Path Series™, an innovative pedagogical framework that transforms language learning from a passive, classroom-based experience into an active, task-oriented journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Structured Progression",
                description: "Clear milestones from A1 to C1 with each Path corresponding to a specific CEFR level",
                icon: Target,
                color: "from-[#C65A1E] to-[#D97B3D]",
              },
              {
                title: "Accelerated Performance",
                description: "Intensive 4-week modules with measurable outcomes and 3-4x faster results",
                icon: Zap,
                color: "from-[#0F3D3E] to-[#145A5B]",
              },
              {
                title: "Deep Consolidation",
                description: "Spaced repetition, booster sessions, and community practice for long-term retention",
                icon: Shield,
                color: "from-[#0F3D3E] to-[#145A5B]",
              },
            ].map((item, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Double-Modality */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Double-Modality Learning Architecture</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-[#FFE4D6] bg-orange-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C65A1E] to-[#D97B3D] flex items-center justify-center text-white font-bold text-xl">
                      70%
                    </div>
                    <CardTitle>RusingAcademy Platform</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Self-paced digital modules featuring video instruction, interactive exercises, quizzes, and multimedia resources accessible 24/7
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-teal-200 bg-teal-50/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F3D3E] to-[#145A5B] flex items-center justify-center text-white font-bold text-xl">
                      30%
                    </div>
                    <CardTitle>Live Coaching</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Individual and group sessions with certified language instructors who provide personalized feedback, conduct simulations, and prepare you for exam scenarios
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* The Six Paths */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-100 text-[#C65A1E]">Our Crash Courses</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Six Paths to Bilingual Mastery
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each Path is a comprehensive, intensive 4-week learning experience designed to advance your competency by one full CEFR level.
            </p>
          </div>

          <Tabs defaultValue="fsl" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="fsl">French as Second Language</TabsTrigger>
              <TabsTrigger value="esl">English as Second Language</TabsTrigger>
            </TabsList>

            <TabsContent value="fsl">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pathsFSL.map((path) => (
                  <Card 
                    key={path.id} 
                    className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                      selectedPath === path.id ? "ring-2 ring-orange-500" : ""
                    }`}
                    onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${path.color}`} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                          {path.id}
                        </Badge>
                        <Badge className={`bg-gradient-to-r ${path.color} text-white border-0`}>
                          {path.level.split(" | ")[1]}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{path.name}</CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        {path.level.split(" | ")[0]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm font-medium text-gray-700 mb-3">{path.tagline}</p>
                      
                      {selectedPath === path.id && (
                        <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                          <p className="text-sm text-gray-600">{path.description}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-700">Key Learning Outcomes:</p>
                            <ul className="space-y-1">
                              {path.outcomes.slice(0, 3).map((outcome, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {outcome}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-3 h-3" />
                          {path.duration}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <BookOpen className="w-3 h-3" />
                          {path.structuredHours}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">${path.price}</span>
                        <span className="text-sm text-gray-500 ml-1">CAD</span>
                      </div>
                      <Button size="sm" className={`bg-gradient-to-r ${path.color} text-white border-0`}>
                        Enroll
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="esl">
              <div className="text-center py-12">
                <Badge className="mb-4 bg-blue-100 text-blue-700">Coming Soon</Badge>
                <h3 className="text-2xl font-bold mb-4">English as Second Language Paths</h3>
                <p className="text-gray-600 mb-6">
                  Our ESL program mirrors the FSL Path Series™ methodology, designed specifically for Francophone public servants.
                </p>
                <Button variant="outline">
                  Request Information
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Bundle Packages */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-[#FFF0E6] to-[#FFF0E6] text-[#C65A1E]">
              Save Up to $500
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Bundle Packages</h2>
            <p className="text-lg text-gray-600">
              Commit to your complete bilingual journey and save significantly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {bundles.map((bundle) => (
              <Card 
                key={bundle.id} 
                className={`relative overflow-hidden border-2 ${
                  bundle.popular 
                    ? "border-orange-400 shadow-xl scale-105" 
                    : bundle.bestValue 
                    ? "border-teal-400 shadow-lg" 
                    : "border-gray-200"
                }`}
              >
                {bundle.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C65A1E] to-[#D97B3D] text-white text-center py-1 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                {bundle.bestValue && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] text-white text-center py-1 text-sm font-semibold">
                    Best Value
                  </div>
                )}
                <CardHeader className={bundle.popular || bundle.bestValue ? "pt-10" : ""}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#C65A1E] to-[#D97B3D] text-white font-bold mb-4">
                    {bundle.id}
                  </div>
                  <CardTitle className="text-lg">{bundle.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500 line-through">${bundle.originalPrice.toLocaleString()} CAD</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">${bundle.price.toLocaleString()}</span>
                      <span className="text-gray-500">CAD</span>
                    </div>
                    <Badge className="mt-2 bg-green-100 text-green-700">Save ${bundle.savings}</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-semibold text-gray-700">Includes:</p>
                    {bundle.paths.map((path, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {path}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    {bundle.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      bundle.popular 
                        ? "bg-gradient-to-r from-[#C65A1E] to-[#D97B3D] hover:from-[#A84A15] hover:to-[#C65A1E]" 
                        : bundle.bestValue 
                        ? "bg-gradient-to-r from-[#0F3D3E] to-[#145A5B] hover:from-[#0B1220] hover:to-[#0F3D3E]" 
                        : ""
                    }`}
                  >
                    Choose This Bundle
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is This Program For */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-teal-100 text-teal-700">Target Audience</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Who Is This Program For?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The GC Bilingual Mastery Series is specifically designed for dedicated professionals in Canada's federal public service who are committed to achieving bilingual excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {targetProfiles.map((profile, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C65A1E] to-teal-500 flex items-center justify-center mb-4">
                    <profile.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{profile.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{profile.description}</p>
                  <div className="space-y-1">
                    {profile.examples.map((example, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        {example}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#C65A1E] via-amber-500 to-teal-500">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Journey Today
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Book your free assessment and discover which Path is right for you
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/request-proposal">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                  Book Free Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/rusingacademy">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
