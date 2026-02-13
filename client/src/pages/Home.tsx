/**
 * Home / Landing Page — RusingÂcademy Learning Portal
 * Public-facing landing for unauthenticated users
 * Redirects authenticated users to /dashboard
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

const LOGO_ICON = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/mrXRaWLUDJGHdcjc.png";
const LOGO_FULL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663049070748/zDHqHOSjzqRLzEVj.png";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_ICON} alt="" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              RusingÂcademy
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href={getLoginUrl()} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#008090] hover:bg-[#006d7a] transition-all shadow-sm hover:shadow-md">
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full opacity-10" style={{
          background: "radial-gradient(circle, #008090, transparent)",
        }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-8" style={{
          background: "radial-gradient(circle, #f5a623, transparent)",
        }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#008090]/8 text-[#008090] text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-[#008090]" />
                Canada's Premier Bilingual Training Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Master Your <span className="text-[#008090]">Second Language</span> with Confidence
              </h1>
              <p className="text-lg text-gray-600 mt-6 leading-relaxed max-w-lg">
                Prepare for your SLE exam with expert coaching, AI-powered learning, gamified programs, and a supportive community of Canadian public servants.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <a href={getLoginUrl()} className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#008090] hover:bg-[#006d7a] transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                  Get Started Free
                  <span className="material-icons" style={{ fontSize: "18px" }}>arrow_forward</span>
                </a>
                <a href="#features" className="px-8 py-3.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2">
                  Learn More
                  <span className="material-icons" style={{ fontSize: "18px" }}>expand_more</span>
                </a>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "192", label: "Expert Lessons", icon: "menu_book", color: "#008090" },
                { value: "12", label: "Learning Paths", icon: "route", color: "#8b5cf6" },
                { value: "A1→C1+", label: "CEFR Levels", icon: "trending_up", color: "#f5a623" },
                { value: "3", label: "SLE Exam Types", icon: "quiz", color: "#e74c3c" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-center">
                  <span className="material-icons mb-2" style={{ fontSize: "28px", color: stat.color }}>{stat.icon}</span>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Everything You Need to <span className="text-[#008090]">Succeed</span>
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              A comprehensive platform designed specifically for Canadian public servants preparing for their Second Language Evaluation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "school", title: "FSL & ESL Programs", desc: "96 unique lessons per program covering CEFR levels A1 through C1+, with 7-slot pedagogical structure.", color: "#008090" },
              { icon: "quiz", title: "SLE Exam Simulations", desc: "Practice Reading Comprehension, Written Expression, and Oral Interaction at levels A, B, and C.", color: "#8b5cf6" },
              { icon: "smart_toy", title: "AI Language Coach", desc: "Bilingual AI assistant for grammar help, vocabulary building, and personalized SLE preparation tips.", color: "#059669" },
              { icon: "emoji_events", title: "Gamified Learning", desc: "Earn XP, unlock badges, climb the leaderboard, and complete weekly challenges to stay motivated.", color: "#f5a623" },
              { icon: "groups", title: "Learning Community", desc: "Connect with fellow learners, join study groups, share tips, and celebrate successes together.", color: "#e74c3c" },
              { icon: "translate", title: "Fully Bilingual", desc: "Switch between English and French interface at any time. All content available in both official languages.", color: "#3b82f6" },
            ].map((feat) => (
              <div key={feat.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#008090]/20 transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${feat.color}10` }}>
                  <span className="material-icons" style={{ color: feat.color, fontSize: "24px" }}>{feat.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#008090] transition-colors">{feat.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Two Complete <span className="text-[#008090]">Programs</span>
            </h2>
            <p className="text-gray-600 mt-3">Choose your path based on your language learning goals.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { title: "FSL Program", subtitle: "Français langue seconde", desc: "For English speakers learning French. 6 Paths covering A1 to C1+ with 96 structured lessons.", color: "#008090", icon: "🇫🇷" },
              { title: "ESL Program", subtitle: "English as a Second Language", desc: "For French speakers learning English. 6 Paths covering A1 to C1+ with 96 unique English lessons.", color: "#f5a623", icon: "🇬🇧" },
            ].map((prog) => (
              <div key={prog.title} className="border-2 border-gray-200 rounded-2xl p-8 hover:border-[#008090] transition-all group text-center">
                <div className="text-5xl mb-4">{prog.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#008090] transition-colors">{prog.title}</h3>
                <p className="text-sm text-[#008090] font-medium mt-1">{prog.subtitle}</p>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{prog.desc}</p>
                <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
                  <span>6 Paths</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>96 Lessons</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>A1→C1+</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6" style={{ background: "linear-gradient(160deg, #f0fafb 0%, #e0f4f5 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Start Your <span className="text-[#008090]">Bilingual Journey</span>?
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Join hundreds of Canadian public servants who are mastering their second official language with RusingÂcademy.
          </p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 mt-8 px-10 py-4 rounded-xl text-base font-bold text-white bg-[#008090] hover:bg-[#006d7a] transition-all shadow-lg hover:shadow-xl">
            Get Started Today
            <span className="material-icons" style={{ fontSize: "20px" }}>arrow_forward</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={LOGO_ICON} alt="" className="w-8 h-8 rounded-lg" />
              <div>
                <span className="text-sm font-bold text-gray-900">RusingÂcademy</span>
                <p className="text-[10px] text-gray-400">Rusinga International Consulting Ltd.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Accessibility</span>
              <span>Contact</span>
            </div>
            <p className="text-[10px] text-gray-400">© 2026 RusingÂcademy — Barholex Media Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
