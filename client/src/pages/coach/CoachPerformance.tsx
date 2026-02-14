/**
 * CoachPerformance — Performance analytics for Coach Portal
 * Features: Teaching metrics, student outcomes, feedback summary
 */
import CoachLayout from "@/components/CoachLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const ACCENT = "#7c3aed";

function MetricRing({ value, label, color }: { value: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" className="transform -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <span className="text-xl font-bold text-gray-900 -mt-[65px] mb-8">{value}%</span>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}

export default function CoachPerformance() {
  const { lang } = useLanguage();

  return (
    <CoachLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {lang === "fr" ? "Performance" : "Performance"}
          </h1>
          <p className="text-sm text-gray-500">{lang === "fr" ? "Vos métriques d'enseignement" : "Your teaching metrics"}</p>
        </div>

        {/* Performance Rings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">{lang === "fr" ? "Indicateurs clés" : "Key Indicators"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <MetricRing value={94} label={lang === "fr" ? "Taux de complétion" : "Completion Rate"} color={ACCENT} />
            <MetricRing value={88} label={lang === "fr" ? "Satisfaction" : "Satisfaction"} color="#059669" />
            <MetricRing value={92} label={lang === "fr" ? "Rétention" : "Retention"} color="#2563eb" />
            <MetricRing value={78} label={lang === "fr" ? "Progrès étudiants" : "Student Progress"} color="#d97706" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Outcomes */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{lang === "fr" ? "Résultats des étudiants" : "Student Outcomes"}</h2>
            <div className="space-y-4">
              {[
                { label: "SLE Pass Rate", value: "85%", icon: "verified", color: "#059669" },
                { label: lang === "fr" ? "Progression CECR moyenne" : "Avg CEFR Progression", value: "+0.8 levels", icon: "trending_up", color: ACCENT },
                { label: lang === "fr" ? "Étudiants ayant atteint B2+" : "Students Reaching B2+", value: "12/24", icon: "school", color: "#2563eb" },
                { label: lang === "fr" ? "Score quiz moyen" : "Avg Quiz Score", value: "82%", icon: "quiz", color: "#d97706" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                    <span className="material-icons text-xl" style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{item.label}</p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{lang === "fr" ? "Commentaires récents" : "Recent Feedback"}</h2>
            <div className="space-y-4">
              {[
                { student: "Marie D.", rating: 5, comment: lang === "fr" ? "Excellente session! Très claire et patiente." : "Excellent session! Very clear and patient.", date: "Feb 12" },
                { student: "James W.", rating: 4, comment: lang === "fr" ? "Bonne préparation SLE. Exercices utiles." : "Good SLE prep. Useful exercises.", date: "Feb 11" },
                { student: "David C.", rating: 5, comment: lang === "fr" ? "Meilleur coach que j'ai eu!" : "Best coach I've had!", date: "Feb 10" },
                { student: "Sophie T.", rating: 4, comment: lang === "fr" ? "Très bon rythme, j'apprends vite." : "Great pace, I'm learning fast.", date: "Feb 9" },
              ].map((fb, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{fb.student}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} className={`material-icons text-[14px] ${j < fb.rating ? "text-amber-400" : "text-gray-200"}`}>star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 italic">"{fb.comment}"</p>
                  <p className="text-[10px] text-gray-400 mt-1">{fb.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Teaching Hours Summary */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{lang === "fr" ? "Heures d'enseignement" : "Teaching Hours"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: lang === "fr" ? "Cette semaine" : "This Week", value: "12h", sub: "6 sessions" },
              { label: lang === "fr" ? "Ce mois" : "This Month", value: "36h", sub: "18 sessions" },
              { label: lang === "fr" ? "Ce trimestre" : "This Quarter", value: "108h", sub: "54 sessions" },
              { label: lang === "fr" ? "Total" : "All Time", value: "480h", sub: "240 sessions" },
            ].map(h => (
              <div key={h.label} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{h.value}</p>
                <p className="text-xs text-gray-500 mt-1">{h.label}</p>
                <p className="text-[10px] text-gray-400">{h.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CoachLayout>
  );
}
