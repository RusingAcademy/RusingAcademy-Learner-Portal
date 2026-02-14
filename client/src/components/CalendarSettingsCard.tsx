import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
  en: {
    title: 'Calendar Settings',
    description: 'Choose how learners book sessions with you',
    internalCalendar: 'Internal Calendar',
    internalDesc: 'Use Lingueefy\'s built-in availability system',
    calendly: 'Calendly',
    calendlyDesc: 'Connect your Calendly account for bookings',
    calendlyUrl: 'Calendly URL',
    calendlyPlaceholder: 'https://calendly.com/your-name',
    save: 'Save Settings',
    saving: 'Saving...',
    saved: 'Settings saved!',
    error: 'Failed to save settings',
    currentSelection: 'Currently using:',
    recommended: 'Recommended',
  },
  fr: {
    title: 'Paramètres du calendrier',
    description: 'Choisissez comment les apprenants réservent des sessions avec vous',
    internalCalendar: 'Calendrier interne',
    internalDesc: 'Utilisez le système de disponibilité intégré de Lingueefy',
    calendly: 'Calendly',
    calendlyDesc: 'Connectez votre compte Calendly pour les réservations',
    calendlyUrl: 'URL Calendly',
    calendlyPlaceholder: 'https://calendly.com/votre-nom',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    saved: 'Paramètres enregistrés!',
    error: 'Échec de l\'enregistrement',
    currentSelection: 'Utilisation actuelle:',
    recommended: 'Recommandé',
  },
};

interface CalendarSettingsCardProps {
  coachId: number;
  currentCalendarType?: 'internal' | 'calendly';
  currentCalendlyUrl?: string | null;
}

export function CalendarSettingsCard({ 
  coachId, 
  currentCalendarType = 'internal',
  currentCalendlyUrl = null 
}: CalendarSettingsCardProps) {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [calendarType, setCalendarType] = useState<'internal' | 'calendly'>(currentCalendarType);
  const [calendlyUrl, setCalendlyUrl] = useState(currentCalendlyUrl || '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const updateCalendarSettings = trpc.coach.updateCalendarSettings.useMutation({
    onSuccess: () => {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    },
    onError: () => {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    },
  });
  
  useEffect(() => {
    setCalendarType(currentCalendarType);
    setCalendlyUrl(currentCalendlyUrl || '');
  }, [currentCalendarType, currentCalendlyUrl]);
  
  const handleSave = () => {
    setStatus('saving');
    updateCalendarSettings.mutate({
      calendarType,
      calendlyUrl: calendarType === 'calendly' ? calendlyUrl : null,
    });
  };
  
  const isValidCalendlyUrl = (url: string) => {
    return url.startsWith('https://calendly.com/') || url === '';
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.title}</h3>
      <p className="text-sm text-gray-600 mb-6">{t.description}</p>
      
      <div className="space-y-4">
        {/* Internal Calendar Option */}
        <label 
          className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            calendarType === 'internal' 
              ? 'border-teal-500 bg-teal-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="calendarType"
            value="internal"
            checked={calendarType === 'internal'}
            onChange={() => setCalendarType('internal')}
            className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{t.internalCalendar}</span>
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                {t.recommended}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{t.internalDesc}</p>
          </div>
          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </label>
        
        {/* Calendly Option */}
        <label 
          className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            calendarType === 'calendly' 
              ? 'border-teal-500 bg-teal-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="calendarType"
            value="calendly"
            checked={calendarType === 'calendly'}
            onChange={() => setCalendarType('calendly')}
            className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900">{t.calendly}</span>
            <p className="text-sm text-gray-600 mt-1">{t.calendlyDesc}</p>
          </div>
          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.655 14.262c-.281.281-.592.527-.926.736l-1.762-1.762a3.5 3.5 0 00.926-.736 3.5 3.5 0 000-4.95 3.5 3.5 0 00-4.95 0 3.5 3.5 0 00-.736.926l-1.762-1.762c.209-.334.455-.645.736-.926a6 6 0 018.474 0 6 6 0 010 8.474z"/>
            <path d="M4.345 9.738c.281-.281.592-.527.926-.736l1.762 1.762a3.5 3.5 0 00-.926.736 3.5 3.5 0 000 4.95 3.5 3.5 0 004.95 0 3.5 3.5 0 00.736-.926l1.762 1.762c-.209.334-.455.645-.736.926a6 6 0 01-8.474 0 6 6 0 010-8.474z"/>
          </svg>
        </label>
        
        {/* Calendly URL Input */}
        {calendarType === 'calendly' && (
          <div className="ml-8 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.calendlyUrl}
            </label>
            <input
              type="url"
              value={calendlyUrl}
              onChange={(e) => setCalendlyUrl(e.target.value)}
              placeholder={t.calendlyPlaceholder}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                calendlyUrl && !isValidCalendlyUrl(calendlyUrl) 
                  ? 'border-red-300' 
                  : 'border-gray-300'
              }`}
            />
            {calendlyUrl && !isValidCalendlyUrl(calendlyUrl) && (
              <p className="text-sm text-red-600 mt-1">
                URL must start with https://calendly.com/
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Save Button */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleSave}
          disabled={status === 'saving' || (calendarType === 'calendly' && !isValidCalendlyUrl(calendlyUrl))}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'saving' ? t.saving : t.save}
        </button>
        
        {status === 'saved' && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t.saved}
          </span>
        )}
        
        {status === 'error' && (
          <span className="text-sm text-red-600">{t.error}</span>
        )}
      </div>
    </div>
  );
}
