/**
 * Home / Landing Page — RusingÂcademy Ecosystem Hub
 * Premium public-facing landing page with three brand pillars,
 * testimonials, team, YouTube carousel, FAQ, booking, and footer.
 * Redirects authenticated users to /dashboard.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";

const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";

/* ─── YouTube video data ─── */
const COACH_SHORTS = [
  { id: "LEc84vX0xe0", title: "Coach Steven", duration: "2:33" },
  { id: "rAdJZ4o_N2Y", title: "Coach Erika", duration: "0:56" },
  { id: "ZytUUUv-A2g", title: "Upgrade Your GC English — Preciosa", duration: "1:22" },
  { id: "SuuhMpF5KoA", title: "Coach Sue-Anne Richer", duration: "0:49" },
  { id: "NxAK8U6_5e4", title: "Coach Victor", duration: "2:12" },
  { id: "UN9-GPwmbaw", title: "Coach Soukaina", duration: "0:51" },
];

const FEATURED_VIDEOS = [
  { id: "80-ms8AlDTU", title: "Réussir l'oral du SLE: les 10 erreurs à éviter", duration: "2:52" },
  { id: "-V3bqSxnVJg", title: "Common Mistakes in Language Exams", duration: "3:09" },
  { id: "-Bwsp5a_91U", title: "The Power of Body Language in Oral Exams", duration: "3:02" },
  { id: "P5tnFJNygoc", title: "Understanding Hypotheses in Your Exam", duration: "5:36" },
];

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  {
    name: "Mithula Naik",
    role: "Public Servant, Government of Canada",
    quote: "RusingÂcademy's approach completely transformed my confidence. I went from dreading my SLE to passing at Level C in just 8 weeks. The structured coaching and personalized feedback made all the difference.",
    initials: "MN",
    color: "#008090",
  },
  {
    name: "Jena Cameron",
    role: "Policy Analyst, Federal Government",
    quote: "The combination of crash courses and one-on-one coaching is unmatched. Steven and his team understand exactly what the SLE demands and prepare you strategically. I recommend them to every colleague.",
    initials: "JC",
    color: "#8b5cf6",
  },
  {
    name: "Edith Bramwell",
    role: "Senior Advisor, Public Service",
    quote: "After failing my oral exam twice, I was ready to give up. RusingÂcademy's method helped me identify my weaknesses and build real fluency. I passed with a B on my third attempt — now aiming for C!",
    initials: "EB",
    color: "#f5a623",
  },
  {
    name: "Scott Cantin",
    role: "Manager, Government of Canada",
    quote: "What sets RusingÂcademy apart is the genuine understanding of the public service context. The exam simulations are incredibly realistic, and the AI tools provide practice anytime I need it.",
    initials: "SC",
    color: "#059669",
  },
];

/* ─── Team ─── */
const TEAM = [
  { name: "Steven Barholere", role: "Founder & CEO", bio: "GC-certified language coach with 15+ years of experience. Visionary behind the RusingÂcademy ecosystem.", initials: "SB", color: "#008090", linkedin: "https://www.linkedin.com/in/stevenbarholere/" },
  { name: "Sue-Anne Richer", role: "Senior Coach", bio: "Expert in FSL coaching with a focus on oral proficiency and exam preparation strategies.", initials: "SR", color: "#8b5cf6", linkedin: "#" },
  { name: "Preciosa Baganha", role: "ESL Specialist", bio: "Dedicated to helping francophone professionals master English for the federal workplace.", initials: "PB", color: "#f5a623", linkedin: "#" },
  { name: "Erika Seguin", role: "Exam Stress Coach", bio: "Combines language coaching with stress management techniques for peak exam performance.", initials: "ES", color: "#e74c3c", linkedin: "#" },
];

/* ─── FAQ ─── */
const FAQ_ITEMS = [
  {
    q: "What is the difference between RusingÂcademy and Lingueefy?",
    a: "RusingÂcademy offers structured crash courses and self-paced learning paths (6 Paths, 96 lessons per program). Lingueefy provides personalized 1-on-1 coaching with certified instructors. Together, they form a complete ecosystem for bilingual excellence.",
  },
  {
    q: "How long does it take to reach Level C?",
    a: "With our accelerated programs, most learners achieve their target level in 4 to 24 weeks — 3 to 4 times faster than traditional approaches. Your timeline depends on your starting level and the intensity of your study plan.",
  },
  {
    q: "Do you offer training for government departments?",
    a: "Yes! Barholex Media provides custom training solutions for federal departments and agencies. We offer group coaching, workshops, and tailored programs designed for organizational bilingualism goals.",
  },
  {
    q: "What is your success rate?",
    a: "We maintain a 95% success rate among learners who complete our recommended program. Our method combines proven pedagogy with innovative technology to maximize your chances of passing the SLE.",
  },
  {
    q: "Can I try a free assessment before enrolling?",
    a: "Absolutely! We offer a free diagnostic assessment to evaluate your current level and recommend the best learning path. Book your free assessment through our scheduling system.",
  },
];

/* ─── Accordion Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-900 pr-4">{q}</span>
        <span className={`material-icons text-[#008090] transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-60" : "max-h-0"}`}>
        <p className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ─── YouTube Carousel ─── */
function YouTubeCarousel({ videos, title }: { videos: { id: string; title: string; duration: string }[]; title: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <span className="material-icons text-gray-600" style={{ fontSize: "18px" }}>chevron_left</span>
          </button>
          <button onClick={() => scroll(1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <span className="material-icons text-gray-600" style={{ fontSize: "18px" }}>chevron_right</span>
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {videos.map((v) => (
          <a
            key={v.id}
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[260px] snap-start group"
          >
            <div className="relative rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
              <img
                src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                alt={v.title}
                className="w-full h-[146px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-icons text-[#e74c3c]" style={{ fontSize: "24px" }}>play_arrow</span>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                {v.duration}
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700 mt-2 line-clamp-2 group-hover:text-[#008090] transition-colors">{v.title}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) setLocation("/dashboard");
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <img src={LOGO_ICON} alt="" className="w-12 h-12 mx-auto mb-4 rounded-xl animate-pulse" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ─── Sticky Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_ICON} alt="" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              RusingÂcademy
            </span>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#ecosystem" className="text-gray-600 hover:text-[#008090] transition-colors font-medium">Ecosystem</a>
            <a href="#method" className="text-gray-600 hover:text-[#008090] transition-colors font-medium">Our Method</a>
            <a href="#testimonials" className="text-gray-600 hover:text-[#008090] transition-colors font-medium">Testimonials</a>
            <a href="#team" className="text-gray-600 hover:text-[#008090] transition-colors font-medium">Our Team</a>
            <a href="#resources" className="text-gray-600 hover:text-[#008090] transition-colors font-medium">Resources</a>
            <a href="#faq" className="text-gray-600 hover:text-[#008090] transition-colors font-medium">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://calendly.com/rusingacademy" target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium text-[#008090] border border-[#008090]/30 hover:bg-[#008090]/5 transition-all">
              Book a Diagnostic
            </a>
            <a href={getLoginUrl()} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#008090] hover:bg-[#006d7a] transition-all shadow-sm hover:shadow-md">
              Sign In
            </a>
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-1">
              <span className="material-icons text-gray-600">{mobileMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            {["ecosystem", "method", "testimonials", "team", "resources", "faq"].map((s) => (
              <a key={s} href={`#${s}`} onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-gray-600 hover:text-[#008090] font-medium capitalize">{s === "faq" ? "FAQ" : s.replace("-", " ")}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-10 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #008090, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #f5a623, transparent)" }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#008090]/8 text-[#008090] text-xs font-semibold mb-6 border border-[#008090]/10">
                <span className="w-2 h-2 rounded-full bg-[#008090] animate-pulse" />
                Canada's Premier Bilingual Training Ecosystem
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-gray-900 leading-[1.1]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Choose Your Path to{" "}
                <span className="relative">
                  <span className="text-[#008090]">Bilingual Excellence</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8C60 2 240 2 298 8" stroke="#008090" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
                  </svg>
                </span>
              </h1>
              <p className="text-lg text-gray-600 mt-6 leading-relaxed max-w-xl">
                Secure your C level. Propel your federal career. Our ecosystem combines expert coaching, structured crash courses, and AI-powered tools — delivering results <strong className="text-gray-900">3 to 4 times faster</strong> than traditional approaches.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <a href={getLoginUrl()} className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#008090] hover:bg-[#006d7a] transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                  Explore the Ecosystem
                  <span className="material-icons" style={{ fontSize: "18px" }}>arrow_forward</span>
                </a>
                <a href="https://calendly.com/rusingacademy" target="_blank" rel="noopener noreferrer"
                  className="px-8 py-3.5 rounded-xl text-sm font-bold text-[#008090] border-2 border-[#008090]/20 hover:border-[#008090]/40 hover:bg-[#008090]/5 transition-all flex items-center gap-2">
                  <span className="material-icons" style={{ fontSize: "18px" }}>calendar_today</span>
                  Book a Diagnostic
                </a>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 mt-10">
                {[
                  { icon: "verified", text: "95% Success Rate" },
                  { icon: "speed", text: "4-24 Week Programs" },
                  { icon: "groups", text: "500+ Public Servants Trained" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="material-icons text-[#008090]" style={{ fontSize: "16px" }}>{b.icon}</span>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "192", label: "Expert Lessons", icon: "menu_book", color: "#008090", desc: "Structured content across 12 paths" },
                { value: "95%", label: "Success Rate", icon: "emoji_events", color: "#f5a623", desc: "Among program completers" },
                { value: "A1→C1+", label: "CEFR Levels", icon: "trending_up", color: "#8b5cf6", desc: "Full proficiency spectrum" },
                { value: "6", label: "Expert Coaches", icon: "school", color: "#059669", desc: "GC-certified professionals" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                  <span className="material-icons mb-3 group-hover:scale-110 transition-transform" style={{ fontSize: "28px", color: stat.color }}>{stat.icon}</span>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs font-semibold text-gray-700 mt-1">{stat.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THE COST OF INACTION ═══ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-4 border border-red-100">
              <span className="material-icons" style={{ fontSize: "14px" }}>warning</span>
              The Bilingual Excellence Trilemma
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Are You Stuck in One of These <span className="text-[#e74c3c]">Traps</span>?
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Most public servants face at least one of these barriers. Our ecosystem is designed to break through all three.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: "block", title: "The Fluency Wall", desc: "You understand everything but can't express yourself fluently. Comprehension without production keeps you stuck at Level B.", color: "#e74c3c" },
              { icon: "psychology", title: "Impostor Syndrome", desc: "Fear of being exposed during the oral exam. You avoid speaking situations and your confidence erodes over time.", color: "#f5a623" },
              { icon: "trending_flat", title: "The Stagnation Plateau", desc: "Years of study with no measurable progress. Traditional methods aren't working, and you feel stuck at the same level.", color: "#8b5cf6" },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-lg transition-all group hover:border-[#008090]/20">
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ background: `${item.color}10` }}>
                  <span className="material-icons" style={{ color: item.color, fontSize: "32px" }}>{item.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ECOSYSTEM — THREE BRAND PILLARS ═══ */}
      <section id="ecosystem" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Complete <span className="text-[#008090]">Ecosystem</span>
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Three complementary brands working together to deliver bilingual excellence for Canadian professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "RusingÂcademy",
                tagline: "Professional Courses & LMS",
                desc: "Structured crash courses with 6 learning paths per program (A1→C1+). Self-paced lessons with gamification, quizzes, and SLE exam simulations.",
                icon: "school",
                color: "#008090",
                features: ["96 Lessons per Program", "SLE Exam Simulations", "Gamified Learning", "AI Language Coach"],
              },
              {
                name: "Lingueefy",
                tagline: "Human & AI Coaching",
                desc: "Personalized 1-on-1 coaching with GC-certified instructors. Hybrid approach combining human expertise with AI-powered practice tools.",
                icon: "record_voice_over",
                color: "#8b5cf6",
                features: ["1-on-1 Coaching", "Real-time Speaking Practice", "Flexible Scheduling", "Progress Tracking"],
              },
              {
                name: "Barholex Media",
                tagline: "EdTech Consulting & Studio",
                desc: "Custom training solutions for federal departments and agencies. Content production, podcasts, videos, and AI-powered educational tools.",
                icon: "business",
                color: "#f5a623",
                features: ["Department Training", "Content Production", "AI-Powered Tools", "Custom Solutions"],
              },
            ].map((brand) => (
              <div key={brand.name} className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-[#008090]/20 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${brand.color}10` }}>
                  <span className="material-icons" style={{ color: brand.color, fontSize: "28px" }}>{brand.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#008090] transition-colors">{brand.name}</h3>
                <p className="text-sm font-medium mt-1" style={{ color: brand.color }}>{brand.tagline}</p>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{brand.desc}</p>
                <div className="mt-5 space-y-2">
                  {brand.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="material-icons" style={{ color: brand.color, fontSize: "14px" }}>check_circle</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3-STEP METHOD ═══ */}
      <section id="method" className="py-20 px-6" style={{ background: "linear-gradient(160deg, #f8fffe 0%, #f0fafb 50%, #faf8f5 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Our Proven <span className="text-[#008090]">3-Step Method</span>
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              A strategic approach that has helped hundreds of public servants achieve their bilingualism goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-[#008090] via-[#8b5cf6] to-[#f5a623] opacity-20" />

            {[
              { step: "01", title: "Diagnose", desc: "Strategic assessment of your current level, strengths, and areas for improvement. We identify exactly where you stand on the CEFR scale.", icon: "search", color: "#008090" },
              { step: "02", title: "Train", desc: "Personalized learning plan combining crash courses, coaching sessions, and AI-powered practice. Targeted exercises for your specific needs.", icon: "fitness_center", color: "#8b5cf6" },
              { step: "03", title: "Validate", desc: "Approach your SLE exam with confidence. Realistic simulations, strategic tips, and ongoing support until you achieve your target level.", icon: "verified", color: "#f5a623" },
            ].map((s) => (
              <div key={s.step} className="text-center relative">
                <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 bg-white border-2 shadow-lg relative z-10" style={{ borderColor: s.color }}>
                  <span className="material-icons" style={{ color: s.color, fontSize: "36px" }}>{s.icon}</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: s.color }}>Step {s.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHO BENEFITS MOST ═══ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Who Benefits <span className="text-[#008090]">Most</span>?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: "timer", title: "Deadline-Driven Professionals", desc: "SLE exam in weeks — need fast, focused preparation." },
              { icon: "work", title: "Career Advancement Seekers", desc: "Need bilingual proficiency for their next promotion." },
              { icon: "replay", title: "Previous Exam Candidates", desc: "Failed before and need a new strategic approach." },
              { icon: "person", title: "Mid-Career Professionals", desc: "5-15 years of service, ready to invest in bilingualism." },
              { icon: "laptop", title: "Remote & Regional Employees", desc: "Limited access to in-person training programs." },
              { icon: "star", title: "High Achievers Targeting C", desc: "Already at B level, aiming for the coveted Level C." },
            ].map((p) => (
              <div key={p.title} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-[#008090]/20 hover:shadow-sm transition-all bg-white">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#008090]/8">
                  <span className="material-icons text-[#008090]" style={{ fontSize: "20px" }}>{p.icon}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{p.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="testimonials" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              What Our <span className="text-[#008090]">Learners</span> Say
            </h2>
            <p className="text-gray-600 mt-3">Real testimonials from Canadian public servants who achieved their bilingualism goals.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white border border-gray-200 rounded-2xl p-7 hover:shadow-lg transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-icons text-[#f5a623]" style={{ fontSize: "16px" }}>star</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: t.color }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-[11px] text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MEET OUR TEAM ═══ */}
      <section id="team" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Meet Our <span className="text-[#008090]">Experts</span>
            </h2>
            <p className="text-gray-600 mt-3">GC-certified coaches dedicated to your bilingual success.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {TEAM.map((m) => (
              <div key={m.name} className="text-center group">
                <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform" style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)` }}>
                  {m.initials}
                </div>
                <h4 className="text-sm font-bold text-gray-900 mt-4">{m.name}</h4>
                <p className="text-xs font-medium mt-0.5" style={{ color: m.color }}>{m.role}</p>
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{m.bio}</p>
                {m.linkedin !== "#" && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-[11px] text-[#008090] hover:underline font-medium">
                    <svg className="w-3.5 h-3.5" fill="#008090" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    LinkedIn
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FREE LEARNING RESOURCES — YOUTUBE ═══ */}
      <section id="resources" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Free <span className="text-[#008090]">Learning Resources</span>
            </h2>
            <p className="text-gray-600 mt-3">Watch our expert coaches share tips, strategies, and insights on our YouTube channel.</p>
          </div>
          <div className="space-y-10">
            <YouTubeCarousel videos={COACH_SHORTS} title="Meet Our Coaches" />
            <YouTubeCarousel videos={FEATURED_VIDEOS} title="SLE Exam Tips & Strategies" />
          </div>
          <div className="text-center mt-10">
            <a href="https://www.youtube.com/@BarholexGCExamCoach" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#e74c3c] hover:bg-[#c0392b] transition-all shadow-sm hover:shadow-md">
              <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" /><path fill="#e74c3c" d="M9.545 15.568V8.432L15.818 12z" /><path fill="white" d="M9.545 15.568V8.432L15.818 12z" /></svg>
              Subscribe on YouTube
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Frequently Asked <span className="text-[#008090]">Questions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-20 px-6" style={{ background: "linear-gradient(160deg, #f0fafb 0%, #e8f6f7 50%, #f0fafb 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Take the <span className="text-[#008090]">Next Step</span>?
          </h2>
          <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
            Join hundreds of Canadian public servants who have transformed their bilingual capabilities with RusingÂcademy.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a href="https://calendly.com/rusingacademy" target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl text-sm font-bold text-white bg-[#008090] hover:bg-[#006d7a] transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              <span className="material-icons" style={{ fontSize: "18px" }}>calendar_today</span>
              Book a Free Discovery Call
            </a>
            <a href={getLoginUrl()} className="px-8 py-4 rounded-xl text-sm font-bold text-[#008090] border-2 border-[#008090]/20 hover:border-[#008090]/40 hover:bg-[#008090]/5 transition-all flex items-center gap-2">
              <span className="material-icons" style={{ fontSize: "18px" }}>play_circle</span>
              Start Learning Now
            </a>
            <a href="#resources" className="px-8 py-4 rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-2">
              <span className="material-icons" style={{ fontSize: "18px" }}>library_books</span>
              Browse Free Resources
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={LOGO_ICON} alt="" className="w-8 h-8 rounded-lg" />
                <span className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>RusingÂcademy</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Canada's premier bilingual training ecosystem. Empowering public servants to achieve bilingual excellence through expert coaching, structured courses, and innovative technology.
              </p>
              {/* Social links */}
              <div className="flex gap-3">
                {[
                  { href: "https://www.facebook.com/rusingacademy", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                  { href: "https://www.linkedin.com/company/rusingacademy", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
                  { href: "https://www.instagram.com/rusingacademy", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                  { href: "https://www.youtube.com/@BarholexGCExamCoach", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-[#008090]/10 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="#6b7280" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Ecosystem */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Ecosystem</h4>
              <div className="space-y-2.5">
                {["Our Courses", "Our Coaches", "Pricing", "For Departments", "Become a Coach"].map((l) => (
                  <a key={l} href="#" className="block text-xs text-gray-500 hover:text-[#008090] transition-colors">{l}</a>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Resources</h4>
              <div className="space-y-2.5">
                {["FAQ", "Help Center", "Blog", "YouTube Channel", "Contact Us"].map((l) => (
                  <a key={l} href={l === "YouTube Channel" ? "https://www.youtube.com/@BarholexGCExamCoach" : l === "FAQ" ? "#faq" : "#"} className="block text-xs text-gray-500 hover:text-[#008090] transition-colors">{l}</a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="material-icons text-[#008090]" style={{ fontSize: "16px" }}>email</span>
                  <a href="mailto:admin@rusingacademy.ca" className="text-xs text-gray-500 hover:text-[#008090] transition-colors">admin@rusingacademy.ca</a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-icons text-[#008090]" style={{ fontSize: "16px" }}>language</span>
                  <a href="https://www.rusingacademy.ca" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-[#008090] transition-colors">www.rusingacademy.ca</a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-icons text-[#008090]" style={{ fontSize: "16px" }}>location_on</span>
                  <span className="text-xs text-gray-500">Ottawa, Ontario, Canada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-gray-400">© 2026 RusingÂcademy — Rusinga International Consulting Ltd. / Barholex Media Inc.</p>
            <div className="flex items-center gap-6 text-[11px] text-gray-400">
              <a href="#" className="hover:text-[#008090] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#008090] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#008090] transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-[#008090] transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
