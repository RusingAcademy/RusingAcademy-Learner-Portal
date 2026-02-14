/**
 * Coach Dashboard (Enhanced)
 * Interface for coaches to manage sessions, track learners, and provide feedback
 * Sprint 10: L'Écosystème de Gestion
 */

import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { trpc } from '@/lib/trpc';
import PortalLayout from '@/components/portal/PortalLayout';

// Types
interface Session {
  id: string;
  learnerName: string;
  learnerEmail: string;
  date: string;
  time: string;
  duration: number;
  type: 'oral' | 'written' | 'grammar' | 'general';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  rating?: number;
}

interface Learner {
  id: string;
  name: string;
  email: string;
  currentLevel: string;
  targetLevel: string;
  progress: number;
  sessionsCompleted: number;
  nextSession?: string;
  strengths: string[];
  areasToImprove: string[];
}

// Coach Navigation Items
const coachNavItems = [
  { id: 'overview', label: 'Tableau de Bord', icon: '🏠' },
  { id: 'sessions', label: 'Mes Sessions', icon: '📅' },
  { id: 'learners', label: 'Mes Apprenants', icon: '👥' },
  { id: 'notes', label: 'Notes Pédagogiques', icon: '📝' },
  { id: 'feedback', label: 'Feedback', icon: '💬' },
];

// Stat Card Component
const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

// Session Card Component
const SessionCard = ({ session }: { session: Session }) => {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const typeLabels = {
    oral: 'Expression Orale',
    written: 'Expression Écrite',
    grammar: 'Grammaire',
    general: 'Général',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#b91c1c] to-[#991b1b] flex items-center justify-center text-white font-medium text-lg">
            {session.learnerName.charAt(0)}
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-gray-900">{session.learnerName}</h4>
            <p className="text-sm text-gray-500">{session.learnerEmail}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[session.status]}`}>
          {session.status === 'scheduled' ? 'Planifiée' : session.status === 'completed' ? 'Complétée' : 'Annulée'}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">Date & Heure</p>
          <p className="text-sm font-medium text-gray-900">{session.date} à {session.time}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Type</p>
          <p className="text-sm font-medium text-gray-900">{typeLabels[session.type]}</p>
        </div>
      </div>
      <div className="mt-4 flex space-x-3">
        {session.status === 'scheduled' && (
          <button className="flex-1 px-4 py-2 bg-[#b91c1c] text-white rounded-lg hover:bg-[#991b1b] text-sm font-medium">
            Rejoindre
          </button>
        )}
        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white text-sm font-medium">
          Notes
        </button>
      </div>
    </div>
  );
};

// Learner Card Component
const LearnerCard = ({ learner }: { learner: Learner }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#b91c1c] to-[#991b1b] flex items-center justify-center text-white font-medium text-lg">
          {learner.name.charAt(0)}
        </div>
        <div className="ml-4">
          <h4 className="font-semibold text-gray-900">{learner.name}</h4>
          <p className="text-sm text-gray-500">{learner.email}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-2xl font-bold text-[#b91c1c]">{learner.currentLevel}</span>
        <span className="text-gray-400 mx-1">→</span>
        <span className="text-2xl font-bold text-gray-400">{learner.targetLevel}</span>
      </div>
    </div>
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Progression</span>
        <span className="font-medium text-gray-900">{learner.progress}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div className="h-full bg-[#b91c1c] rounded-full" style={{ width: `${learner.progress}%` }} />
      </div>
    </div>
    <div className="flex justify-between text-sm text-gray-600">
      <span>{learner.sessionsCompleted} sessions</span>
      {learner.nextSession && <span>Prochaine: {learner.nextSession}</span>}
    </div>
  </div>
);

// Main Coach Dashboard Component
export default function CoachDashboardNew() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  const mockSessions: Session[] = [
    { id: '1', learnerName: 'Marie Dupont', learnerEmail: 'marie.dupont@gc.ca', date: '21 Jan', time: '10:00', duration: 60, type: 'oral', status: 'scheduled' },
    { id: '2', learnerName: 'Jean Tremblay', learnerEmail: 'jean.tremblay@gc.ca', date: '21 Jan', time: '14:00', duration: 45, type: 'grammar', status: 'scheduled' },
  ];

  const mockLearners: Learner[] = [
    { id: '1', name: 'Marie Dupont', email: 'marie.dupont@gc.ca', currentLevel: 'A', targetLevel: 'B', progress: 65, sessionsCompleted: 12, nextSession: '21 Jan', strengths: ['Vocabulaire'], areasToImprove: ['Grammaire'] },
    { id: '2', name: 'Jean Tremblay', email: 'jean.tremblay@gc.ca', currentLevel: 'B', targetLevel: 'C', progress: 42, sessionsCompleted: 8, nextSession: '21 Jan', strengths: ['Compréhension'], areasToImprove: ['Expression orale'] },
  ];

  return (
    <PortalLayout>
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Coach</h1>
            <p className="text-gray-600 mt-1">Bienvenue, {user?.firstName || 'Coach'}</p>
          </div>
        </div>
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8">
            <nav className="flex space-x-8">
              {coachNavItems.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  aria-pressed={activeTab === item.id}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === item.id ? 'border-[#b91c1c] text-[#b91c1c]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <span className="mr-2" aria-hidden="true">{item.icon}</span>{item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Sessions Cette Semaine" value="8" icon="📅" />
                <StatCard title="Apprenants Actifs" value="12" icon="👥" />
                <StatCard title="Heures Ce Mois" value="32" icon="⏱️" />
                <StatCard title="Note Moyenne" value="4.8" icon="⭐" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sessions Aujourd'hui</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockSessions.map(session => <SessionCard key={session.id} session={session} />)}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'learners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockLearners.map(learner => <LearnerCard key={learner.id} learner={learner} />)}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
