/**
 * RusingÂcademy Learning Portal - Tutoring Sessions Page
 * Features: Calendly embed, coach profiles, booking types, session history
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

/* ─── Booking Types ─── */
const bookingTypes = [
  {
    id: "discovery",
    title: "Free Discovery Call",
    subtitle: "30 minutes",
    description: "Discuss your goals, assess your current level, and get a personalized learning plan recommendation.",
    icon: "explore",
    color: "#008090",
    calendlyUrl: "https://calendly.com/steven-barholere/30min",
    badge: "FREE",
    badgeColor: "#10b981",
  },
  {
    id: "diagnostic",
    title: "Diagnostic Assessment",
    subtitle: "60 minutes",
    description: "Comprehensive evaluation of your reading, writing, and oral skills with a detailed report and SLE readiness score.",
    icon: "assessment",
    color: "#6366f1",
    calendlyUrl: "https://calendly.com/rusingacademy",
    badge: null,
    badgeColor: null,
  },
  {
    id: "coaching",
    title: "1-on-1 Coaching Session",
    subtitle: "60 minutes",
    description: "Personalized coaching with an expert tutor focused on your specific weaknesses and SLE exam preparation.",
    icon: "school",
    color: "#f59e0b",
    calendlyUrl: "https://calendly.com/rusingacademy",
    badge: "POPULAR",
    badgeColor: "#f59e0b",
  },
  {
    id: "intensive",
    title: "Intensive Crash Course",
    subtitle: "3-hour block",
    description: "Deep-dive session for rapid progress. Ideal for professionals with an upcoming SLE exam deadline.",
    icon: "bolt",
    color: "#ef4444",
    calendlyUrl: "https://calendly.com/rusingacademy",
    badge: "INTENSIVE",
    badgeColor: "#ef4444",
  },
];

/* ─── Coach Profiles ─── */
const coaches = [
  {
    name: "Steven Barholere",
    role: "Lead Coach & CEO",
    specialty: "SLE Oral (C-Level), Career Strategy",
    languages: "FR / EN",
    avatar: "SB",
    color: "#008090",
    linkedin: "https://www.linkedin.com/in/steven-barholere-1a17b8a6/",
    bio: "Founder of RusingÂcademy with 10+ years coaching public servants to bilingual excellence.",
  },
  {
    name: "Sue-Anne Richer",
    role: "Senior French Coach",
    specialty: "SLE Written Expression, Grammar",
    languages: "FR / EN",
    avatar: "SR",
    color: "#6366f1",
    linkedin: "https://www.linkedin.com/in/sue-anne-richer-46ab2a383/",
    bio: "Certified language instructor specializing in written expression and advanced grammar structures.",
  },
  {
    name: "Preciosa Baganha",
    role: "Bilingual Coach",
    specialty: "SLE Reading Comprehension, Vocabulary",
    languages: "FR / EN / PT",
    avatar: "PB",
    color: "#f59e0b",
    linkedin: "https://www.linkedin.com/in/managerok/",
    bio: "Multilingual educator with expertise in reading strategies and vocabulary acquisition techniques.",
  },
  {
    name: "Erika Seguin",
    role: "French Coach",
    specialty: "Oral Interaction, Pronunciation",
    languages: "FR / EN",
    avatar: "ES",
    color: "#10b981",
    linkedin: "https://www.linkedin.com/in/erika-seguin-9aaa40383/",
    bio: "Specialist in oral fluency and pronunciation coaching for intermediate to advanced learners.",
  },
];

/* ─── Calendly Embed Component ─── */
function CalendlyEmbed({ url, onClose }: { url: string; onClose: () => void }) {
  const iframeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="material-icons text-[#008090]">calendar_month</span>
            <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Schedule Your Session
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-icons text-gray-500">close</span>
          </button>
        </div>
        {/* Calendly Inline Widget */}
        <div ref={iframeRef} className="h-[650px]">
          <div
            className="calendly-inline-widget"
            data-url={url}
            style={{ minWidth: "320px", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function TutoringSessions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"book" | "coaches" | "history">("book");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [showCalendly, setShowCalendly] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState("");

  const handleBook = (url: string) => {
    setCalendlyUrl(url);
    setShowCalendly(true);
  };

  const tabs = [
    { id: "book" as const, label: "Book a Session", icon: "event" },
    { id: "coaches" as const, label: "Our Coaches", icon: "groups" },
    { id: "history" as const, label: "Session History", icon: "history" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Tutoring Sessions
          </h1>
        </div>
        <p className="text-gray-500 text-sm mb-6 ml-8">
          Book personalized coaching sessions with our certified language experts.
        </p>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative
                ${activeTab === tab.id
                  ? "text-[#008090] border-b-2 border-[#008090]"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <span className="material-icons text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── BOOK A SESSION TAB ─── */}
        {activeTab === "book" && (
          <div className="space-y-6">
            {/* Quick CTA Banner */}
            <div className="bg-gradient-to-r from-[#008090] to-[#006070] rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Not sure where to start?
                  </h2>
                  <p className="text-white/80 text-sm">
                    Book a free 30-minute discovery call to discuss your goals and get a personalized recommendation.
                  </p>
                </div>
                <button
                  onClick={() => handleBook("https://calendly.com/steven-barholere/30min")}
                  className="bg-white text-[#008090] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="material-icons text-[18px]">phone_in_talk</span>
                  Book Free Discovery Call
                </button>
              </div>
            </div>

            {/* Booking Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookingTypes.map((bt) => (
                <div
                  key={bt.id}
                  onClick={() => setSelectedBooking(selectedBooking === bt.id ? null : bt.id)}
                  className={`glass-card rounded-xl p-5 cursor-pointer transition-all duration-300 border-2
                    ${selectedBooking === bt.id
                      ? `border-[${bt.color}] shadow-lg`
                      : "border-transparent hover:border-gray-200 hover:shadow-md"
                    }`}
                  style={selectedBooking === bt.id ? { borderColor: bt.color } : {}}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${bt.color}15` }}
                      >
                        <span className="material-icons text-[24px]" style={{ color: bt.color }}>
                          {bt.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bt.title}</h3>
                        <p className="text-xs text-gray-500">{bt.subtitle}</p>
                      </div>
                    </div>
                    {bt.badge && (
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: bt.badgeColor || bt.color }}
                      >
                        {bt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{bt.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBook(bt.calendlyUrl);
                    }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: `${bt.color}10`,
                      color: bt.color,
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = bt.color;
                      (e.target as HTMLElement).style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = `${bt.color}10`;
                      (e.target as HTMLElement).style.color = bt.color;
                    }}
                  >
                    <span className="material-icons text-[16px]">calendar_today</span>
                    Book Now
                  </button>
                </div>
              ))}
            </div>

            {/* How It Works */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: "1", icon: "event", title: "Choose a Session", desc: "Select the type of session that fits your needs." },
                  { step: "2", icon: "calendar_month", title: "Pick a Time", desc: "Choose a convenient time slot from the calendar." },
                  { step: "3", icon: "videocam", title: "Join Online", desc: "Connect via Zoom or Google Meet at your scheduled time." },
                  { step: "4", icon: "trending_up", title: "Track Progress", desc: "Review session notes and track your improvement." },
                ].map((s) => (
                  <div key={s.step} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-[rgba(0,128,144,0.1)] flex items-center justify-center mx-auto mb-3">
                      <span className="text-sm font-bold text-[#008090]">{s.step}</span>
                    </div>
                    <span className="material-icons text-[28px] text-[#008090] mb-2 block">{s.icon}</span>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{s.title}</h4>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── OUR COACHES TAB ─── */}
        {activeTab === "coaches" && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm mb-4">
              Our team of certified language coaches brings years of experience in SLE preparation and bilingual excellence coaching for Canadian public servants.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coaches.map((coach) => (
                <div key={coach.name} className="glass-card rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ backgroundColor: coach.color }}
                    >
                      {coach.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{coach.name}</h3>
                        <a
                          href={coach.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0077b5] hover:text-[#005885] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      </div>
                      <p className="text-sm text-[#008090] font-medium mb-1">{coach.role}</p>
                      <p className="text-xs text-gray-500 mb-2">{coach.bio}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {coach.specialty}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-[rgba(0,128,144,0.1)] text-[#008090]">
                          {coach.languages}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBook("https://calendly.com/rusingacademy")}
                    className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold bg-[rgba(0,128,144,0.08)] text-[#008090] hover:bg-[#008090] hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-icons text-[16px]">calendar_today</span>
                    Book with {coach.name.split(" ")[0]}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SESSION HISTORY TAB ─── */}
        {activeTab === "history" && (
          <div>
            {/* Session History Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[rgba(0,128,144,0.06)]">
                    <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">
                      <div className="flex items-center gap-1">
                        Date
                        <span className="material-icons text-[14px] text-gray-400">unfold_more</span>
                      </div>
                    </th>
                    <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Time</th>
                    <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Duration</th>
                    <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Coach</th>
                    <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <span className="material-icons text-[48px] text-gray-300 mb-3 block">event_busy</span>
                      <p className="text-gray-500 text-sm font-medium mb-1">No sessions yet</p>
                      <p className="text-gray-400 text-xs mb-4">
                        Your session history will appear here after your first booking.
                      </p>
                      <button
                        onClick={() => setActiveTab("book")}
                        className="text-sm font-semibold text-[#008090] hover:underline"
                      >
                        Book your first session →
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Info Card */}
            <div className="mt-4 glass-card rounded-xl p-4 flex items-start gap-3">
              <span className="material-icons text-[#008090] text-[20px] mt-0.5">info</span>
              <div>
                <p className="text-sm text-gray-700 font-medium">Session tracking coming soon</p>
                <p className="text-xs text-gray-500 mt-1">
                  We're working on automatic session tracking with Calendly integration. For now, book sessions through the calendar and your coach will track your progress.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendly Modal */}
      {showCalendly && (
        <CalendlyEmbed
          url={calendlyUrl}
          onClose={() => setShowCalendly(false)}
        />
      )}
    </DashboardLayout>
  );
}
