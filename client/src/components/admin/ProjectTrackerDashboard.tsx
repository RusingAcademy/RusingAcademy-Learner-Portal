/**
 * Project Tracker Dashboard
 * Real-time tracking of RusingÂcademy Ecosystem Development
 * 
 * @route /admin/project-tracker
 * @access Admin only (Clerk protected)
 * @brand RusingÂcademy
 * @copyright Rusinga International Consulting Ltd.
 */

import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { BarChart3, GitPullRequest, Package, BookOpen, Video, AlertTriangle, TrendingUp, Calendar, Clock } from 'lucide-react';

// Types
interface SprintData {
  id: number;
  name: string;
  status: 'completed' | 'in-progress' | 'planned';
  description: string;
  completedDate?: string;
}

interface PathProgress {
  id: string;
  name: string;
  level: string;
  structureComplete: boolean;
  videosProduced: number;
  videosTotal: number;
  audiosProduced: number;
  audiosTotal: number;
  quizReady: boolean;
  priority: boolean;
}

interface MissingItem {
  category: string;
  item: string;
  count?: number;
  severity: 'critical' | 'warning' | 'info';
}

// Project Data (Updated after each sprint)
const PROJECT_DATA = {
  lastUpdated: '2026-01-20',
  sprintsCompleted: 13,
  sprintsTotal: 20,
  pullRequestsMerged: 52,
  componentsCreated: 87,
  lessonsStructured: 96,
  
  sprints: [
    { id: 13, name: 'Marketing Automation, SEO & Conversion B2B', status: 'completed', description: 'SEO Pillar Pages, Lead Magnet Tunnel, Email Nurturing, In-App Messaging', completedDate: '2026-01-20' },
    { id: 12, name: 'IA Avancée, Automatisation & Flux Financiers', status: 'completed', description: 'Commission Progressive, RAG Steven AI, Diagnostic PDF Automation', completedDate: '2026-01-20' },
    { id: 0, name: 'The Path Series (Mandat Spécial)', status: 'completed', description: '6 Paths structurés, 96 leçons, RAG Knowledge Base, Steven AI Integration', completedDate: '2026-01-20' },
    { id: -1, name: 'Performance Fixes', status: 'completed', description: 'Email Deliverability (SPF/DKIM/DMARC), Core Web Vitals, Monitoring Dashboard', completedDate: '2026-01-20' },
    { id: 14, name: 'Sprint 14', status: 'planned', description: 'À définir' },
    { id: 15, name: 'Sprint 15', status: 'planned', description: 'À définir' },
  ] as SprintData[],

  paths: [
    { id: 'path-1', name: 'Path I: Foundations', level: 'A1', structureComplete: true, videosProduced: 0, videosTotal: 32, audiosProduced: 0, audiosTotal: 32, quizReady: false, priority: false },
    { id: 'path-2', name: 'Path II: Building Confidence', level: 'A2', structureComplete: true, videosProduced: 0, videosTotal: 32, audiosProduced: 0, audiosTotal: 32, quizReady: false, priority: false },
    { id: 'path-3', name: 'Path III: Professional Fluency', level: 'B1', structureComplete: true, videosProduced: 0, videosTotal: 32, audiosProduced: 0, audiosTotal: 32, quizReady: false, priority: true },
    { id: 'path-4', name: 'Path IV: Advanced Mastery', level: 'B2', structureComplete: true, videosProduced: 0, videosTotal: 32, audiosProduced: 0, audiosTotal: 32, quizReady: false, priority: true },
    { id: 'path-5', name: 'Path V: Executive Excellence', level: 'C1', structureComplete: true, videosProduced: 0, videosTotal: 32, audiosProduced: 0, audiosTotal: 32, quizReady: false, priority: false },
    { id: 'path-6', name: 'Path VI: Native-Like Mastery', level: 'C2', structureComplete: true, videosProduced: 0, videosTotal: 32, audiosProduced: 0, audiosTotal: 32, quizReady: false, priority: false },
  ] as PathProgress[],

  missingItems: [
    { category: 'Média', item: 'Vidéos de cours', count: 192, severity: 'critical' },
    { category: 'Média', item: 'Audios de compréhension', count: 192, severity: 'critical' },
    { category: 'Contenu', item: 'Banque de questions quiz', severity: 'warning' },
    { category: 'Fonctionnalité', item: 'Certificats de complétion', severity: 'warning' },
    { category: 'Visuel', item: 'Thumbnails des cours', severity: 'warning' },
    { category: 'Visuel', item: 'Couvertures des 6 Paths', severity: 'warning' },
    { category: 'IA', item: 'RAG Embeddings (vectorisation)', severity: 'info' },
    { category: 'QA', item: 'Tests utilisateurs', severity: 'info' },
  ] as MissingItem[],

  mediaProduction: {
    totalAssets: 384,
    videosTotal: 192,
    audiosTotal: 192,
    estimatedMonths: '12-18',
    estimatedBudgetMin: 220000,
    estimatedBudgetMax: 490000,
  },

  branches: [
    { name: 'RusingÂcademy', description: 'Pilier Académique & Formation', status: 'production', features: ['6 Paths', '96 Leçons', 'RAG AI'] },
    { name: 'Lingueefy', description: 'Coaching Humain & IA', status: 'production', features: ['Booking', 'Coaches', 'Messaging', 'Commission'] },
    { name: 'Barholex Media', description: 'EdTech, Consulting & Innovation', status: 'production', features: ['Services', 'Portfolio', 'Contact', 'B2B/B2G'] },
  ],

  techStack: [
    { name: 'Frontend', value: 'React + TypeScript + TailwindCSS' },
    { name: 'Backend', value: 'Node.js + Express + Drizzle ORM' },
    { name: 'Database', value: 'MySQL / TiDB' },
    { name: 'Auth', value: 'Clerk' },
    { name: 'Payments', value: 'Stripe Connect' },
    { name: 'AI', value: 'OpenAI GPT-5 + RAG' },
    { name: 'Email', value: 'SendGrid' },
    { name: 'Hosting', value: 'Railway' },
  ],
};

// KPI Card Component
const KPICard = ({ icon: Icon, label, value, subtitle, progress }: { icon: any; label: string; value: string | number; subtitle: string; progress?: number; }) => (
  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400 text-sm">{label}</span>
      <Icon className="w-6 h-6 text-emerald-400" />
    </div>
    <div className="text-4xl font-bold text-white">{value}</div>
    <div className="text-sm text-gray-400 mt-2">{subtitle}</div>
    {progress !== undefined && (
      <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    )}
  </div>
);

// Path Card Component
const PathCard = ({ path }: { path: PathProgress }) => {
  const videoProgress = (path.videosProduced / path.videosTotal) * 100;
  const overallProgress = path.structureComplete ? 25 : 0;

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 ${path.priority ? 'border border-amber-500/50' : 'border border-white/10'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{path.name}</h3>
        <span className={`text-xs px-2 py-1 rounded ${path.level.startsWith('B') ? 'bg-blue-500/20 text-blue-400' : path.level.startsWith('C') ? 'bg-[#E7F2F2]/20 text-[#0F3D3E]' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {path.level} {path.priority && '⭐'}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-400">Structure</span><span className={path.structureComplete ? 'text-emerald-400' : 'text-red-400'}>{path.structureComplete ? '✓ Complète' : '✗ Incomplète'}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Vidéos ({path.videosTotal})</span><span className={videoProgress > 0 ? 'text-emerald-400' : 'text-red-400'}>{videoProgress.toFixed(0)}% Produit</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Quiz</span><span className={path.quizReady ? 'text-emerald-400' : 'text-amber-400'}>{path.quizReady ? '✓ Prêt' : 'Structure OK'}</span></div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
        <div className="bg-gradient-to-r from-[#C65A1E] to-yellow-400 h-2 rounded-full" style={{ width: `${overallProgress}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-2">{path.priority ? '⭐ Priorité SLE Level B' : `${overallProgress}% complété`}</p>
    </div>
  );
};

// Main Component
export default function ProjectTrackerDashboard() {
  const { user, isLoaded } = useUser();
  const [data] = useState(PROJECT_DATA);
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.emailAddresses?.[0]?.emailAddress?.includes('rusingacademy');

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Accès Restreint</h1>
          <p className="text-gray-400">Ce tableau de bord est réservé aux administrateurs.</p>
        </div>
      </div>
    );
  }

  const sprintProgress = (data.sprintsCompleted / data.sprintsTotal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center font-bold text-xl">R</div>
            <div>
              <h1 className="text-xl font-bold">RusingÂcademy Ecosystem</h1>
              <p className="text-xs text-gray-400">Project Tracker Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Dernière mise à jour: {data.lastUpdated}</span>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard icon={TrendingUp} label="Sprints Complétés" value={data.sprintsCompleted} subtitle={`sur ${data.sprintsTotal} planifiés`} progress={sprintProgress} />
          <KPICard icon={GitPullRequest} label="Pull Requests Mergés" value={data.pullRequestsMerged} subtitle="commits en production" progress={100} />
          <KPICard icon={Package} label="Composants Créés" value={data.componentsCreated} subtitle="fichiers TypeScript/React" progress={85} />
          <KPICard icon={BookOpen} label="Cours Structurés" value={data.lessonsStructured} subtitle="leçons dans 6 Paths" progress={100} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-emerald-400" /> État des Branches</h2>
            <div className="space-y-4">
              {data.branches.map((branch, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${index === 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : index === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-[#0F3D3E] to-[#E06B2D]'}`}>{branch.name.substring(0, 2)}</div>
                      <div><h3 className="font-semibold">{branch.name}</h3><p className="text-xs text-gray-400">{branch.description}</p></div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">Production</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center text-sm">
                    {branch.features.map((feature, i) => (<div key={i}><span className="block text-lg font-bold text-emerald-400">✓</span><span className="text-gray-400">{feature}</span></div>))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Calendar className="w-6 h-6 text-emerald-400" /> Progression</h2>
            <div className="flex flex-col items-center justify-center h-64">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="#374151" strokeWidth="16" fill="none" />
                  <circle cx="96" cy="96" r="80" stroke="url(#gradient)" strokeWidth="16" fill="none" strokeDasharray={`${sprintProgress * 5.03} 503`} strokeLinecap="round" />
                  <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#14b8a6" /></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{sprintProgress.toFixed(0)}%</span>
                  <span className="text-sm text-gray-400">Complété</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><BookOpen className="w-6 h-6 text-emerald-400" /> The Path Series</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.paths.map((path) => (<PathCard key={path.id} path={path} />))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Package className="w-6 h-6 text-emerald-400" /> Stack Technique</h2>
            <div className="space-y-3">
              {data.techStack.map((tech, index) => (<div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3"><span className="text-gray-400">{tech.name}</span><span className="text-emerald-400">{tech.value}</span></div>))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-amber-400" /> Éléments Manquants</h2>
            <div className="space-y-3">
              {data.missingItems.map((item, index) => (<div key={index} className={`flex items-center justify-between rounded-lg p-3 border ${item.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' : item.severity === 'warning' ? 'bg-[#C65A1E]/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}><span className="text-gray-300">{item.item}</span><span className={item.severity === 'critical' ? 'text-red-400' : item.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}>{item.count ? `${item.count} à produire` : 'À développer'}</span></div>))}
            </div>
          </div>
        </div>

        <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Clock className="w-6 h-6 text-emerald-400" /> Sprints Récents</h2>
          <div className="space-y-4">
            {data.sprints.slice(0, 6).map((sprint) => (
              <div key={sprint.id} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${sprint.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : sprint.status === 'in-progress' ? 'bg-[#C65A1E]/20 text-amber-400' : 'bg-white0/20 text-gray-400'}`}>{sprint.id > 0 ? sprint.id : sprint.id === 0 ? 'SP' : 'PF'}</div>
                <div className="flex-1 bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{sprint.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${sprint.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : sprint.status === 'in-progress' ? 'bg-[#C65A1E]/20 text-amber-400' : 'bg-white0/20 text-gray-400'}`}>{sprint.status === 'completed' ? 'Complété' : sprint.status === 'in-progress' ? 'En cours' : 'Planifié'}</span>
                  </div>
                  <p className="text-sm text-gray-400">{sprint.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Video className="w-6 h-6 text-emerald-400" /> Estimation Production Média</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center"><div className="text-5xl font-bold text-amber-400">{data.mediaProduction.totalAssets}</div><p className="text-gray-400 mt-2">Assets Média Total</p><p className="text-xs text-gray-500">{data.mediaProduction.videosTotal} vidéos + {data.mediaProduction.audiosTotal} audios</p></div>
            <div className="text-center"><div className="text-5xl font-bold text-blue-400">{data.mediaProduction.estimatedMonths}</div><p className="text-gray-400 mt-2">Mois de Production</p><p className="text-xs text-gray-500">Avec équipe dédiée</p></div>
            <div className="text-center"><div className="text-4xl font-bold text-[#0F3D3E]">${(data.mediaProduction.estimatedBudgetMin / 1000).toFixed(0)}K-${(data.mediaProduction.estimatedBudgetMax / 1000).toFixed(0)}K</div><p className="text-gray-400 mt-2">Budget Estimé (CAD)</p><p className="text-xs text-gray-500">Incluant AI-assisted production</p></div>
          </div>
        </section>
      </main>

      <footer className="bg-white/5 border-t border-white/10 mt-8 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <span>© 2026 Rusinga International Consulting Ltd.</span>
          <span>Dashboard généré par Manus AI</span>
        </div>
      </footer>
    </div>
  );
    }
