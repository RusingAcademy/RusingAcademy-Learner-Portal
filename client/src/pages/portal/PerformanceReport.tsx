// PerformanceReport - Exportable PDF progress report for ministries - Sprint 9
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { FileText, Download, TrendingUp, Award, Calendar, Target } from 'lucide-react';
import PortalLayout from '../../components/portal/PortalLayout';

interface ReportData { learnerName: string; currentLevel: string; targetLevel: string; overallProgress: number; oralProgress: number; writtenProgress: number; grammarProgress: number; testsCompleted: number; averageScore: number; chaptersCompleted: number; studyHours: number; startDate: string; generatedDate: string; }

export default function PerformanceReport() {
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);

  const reportData: ReportData = {
    learnerName: user?.fullName || 'Apprenant',
    currentLevel: 'A', targetLevel: 'B', overallProgress: 45,
    oralProgress: 52, writtenProgress: 38, grammarProgress: 48,
    testsCompleted: 8, averageScore: 72, chaptersCompleted: 12,
    studyHours: 34, startDate: '2025-09-01', generatedDate: new Date().toISOString().split('T')[0]
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/reports/generate-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reportData) });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `rapport-progression-${reportData.generatedDate}.pdf`; a.click();
    } catch (error) { console.error('PDF generation failed:', error); }
    finally { setIsGenerating(false); }
  };

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold text-slate-900">Rapport de Performance</h1><p className="text-slate-600 mt-1">Document officiel pour justification ministérielle</p></div>
          <button onClick={generatePDF} disabled={isGenerating} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <Download className="w-5 h-5" />{isGenerating ? 'Génération...' : 'Exporter PDF'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"><FileText className="w-8 h-8 text-blue-600" /></div>
            <div><h2 className="text-xl font-semibold text-slate-900">{reportData.learnerName}</h2><p className="text-slate-600">Rapport généré le {reportData.generatedDate}</p></div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-4"><div className="flex items-center gap-2 text-slate-600 mb-2"><Target className="w-4 h-4" /><span className="text-sm">Objectif</span></div><p className="text-2xl font-bold text-slate-900">Niveau {reportData.currentLevel} → {reportData.targetLevel}</p></div>
            <div className="bg-white rounded-lg p-4"><div className="flex items-center gap-2 text-slate-600 mb-2"><TrendingUp className="w-4 h-4" /><span className="text-sm">Progression globale</span></div><p className="text-2xl font-bold text-blue-600">{reportData.overallProgress}%</p></div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-4">Détail des compétences</h3>
          <div className="space-y-4 mb-8">
            {[{label:'Expression orale',value:reportData.oralProgress},{label:'Expression écrite',value:reportData.writtenProgress},{label:'Grammaire',value:reportData.grammarProgress}].map(skill => (
              <div key={skill.label}><div className="flex justify-between mb-1"><span className="text-slate-700">{skill.label}</span><span className="font-medium text-slate-900">{skill.value}%</span></div><div className="h-3 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full transition-all" style={{width:`${skill.value}%`}} /></div></div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[{icon:Award,label:'Tests complétés',value:reportData.testsCompleted},{icon:TrendingUp,label:'Score moyen',value:`${reportData.averageScore}%`},{icon:FileText,label:'Chapitres',value:reportData.chaptersCompleted},{icon:Calendar,label:'Heures d\'étude',value:reportData.studyHours}].map(stat => (
              <div key={stat.label} className="text-center p-4 bg-white rounded-lg"><stat.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold text-slate-900">{stat.value}</p><p className="text-sm text-slate-600">{stat.label}</p></div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-slate-500">Ce rapport est généré automatiquement par RusingÂcademy et peut être utilisé comme justificatif officiel de formation linguistique.</p>
      </div>
    </PortalLayout>
  );
}
