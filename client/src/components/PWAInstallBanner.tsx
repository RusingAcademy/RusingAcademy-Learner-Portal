import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, X, Share } from 'lucide-react';

/**
 * PWA Install Banner Component
 * 
 * Displays a professional, non-intrusive install banner:
 * - Chrome/Edge: Shows native install prompt via beforeinstallprompt
 * - iOS Safari: Shows manual instructions (Add to Home Screen)
 * - Already installed or standalone: Hidden
 * 
 * Respects the user's dismiss preference (7-day cooldown).
 * Bilingual support (EN/FR) via LanguageContext.
 */
export function PWAInstallBanner() {
  const { canInstall, isInstalled, isIOS, isStandalone, installApp, dismissInstall, isDismissed } = usePWAInstall();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Don't show if already installed, in standalone mode, or dismissed
  if (isInstalled || isStandalone || isDismissed) return null;

  // Don't show if neither Chrome install nor iOS
  if (!canInstall && !isIOS) return null;

  return (
    <>
      {/* Main Install Banner */}
      <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-500">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-[#0D7377] to-[#0a5c5f] p-4 shadow-2xl backdrop-blur-sm">
          {/* Dismiss button */}
          <button
            onClick={dismissInstall}
            className="absolute right-2 top-2 rounded-full p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={isEn ? "Dismiss install banner" : "Fermer la bannière d'installation"}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <img
                src="/icons/icon-192x192.png"
                alt="RusingÂcademy"
                className="h-12 w-12 rounded-xl shadow-lg"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white">
                {isEn ? 'Install RusingÂcademy' : 'Installer RusingÂcademy'}
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                {isEn
                  ? 'Quick access to your courses, even offline'
                  : 'Accès rapide à vos cours, même hors ligne'}
              </p>
            </div>

            {/* Install Button */}
            {canInstall ? (
              <button
                onClick={installApp}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0D7377] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl active:scale-95"
              >
                <Download className="h-4 w-4" />
                {isEn ? 'Install' : 'Installer'}
              </button>
            ) : isIOS ? (
              <button
                onClick={() => setShowIOSInstructions(true)}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0D7377] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl active:scale-95"
              >
                <Download className="h-4 w-4" />
                {isEn ? 'Install' : 'Installer'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEn ? 'Install RusingÂcademy' : 'Installer RusingÂcademy'}
              </h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0D7377]/10 text-sm font-bold text-[#0D7377]">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {isEn ? 'Tap the Share button' : 'Appuyez sur le bouton Partager'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {isEn
                      ? 'Look for the share icon at the bottom of Safari'
                      : "Cherchez l'icône de partage en bas de Safari"}{' '}
                    <Share className="inline h-3.5 w-3.5" />
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0D7377]/10 text-sm font-bold text-[#0D7377]">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {isEn ? 'Select "Add to Home Screen"' : "Sélectionnez « Sur l'écran d'accueil »"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {isEn
                      ? 'Scroll down and tap Add to Home Screen'
                      : "Faites défiler et appuyez sur « Sur l'écran d'accueil »"}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0D7377]/10 text-sm font-bold text-[#0D7377]">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {isEn ? 'Tap "Add"' : 'Appuyez sur « Ajouter »'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {isEn
                      ? 'Confirm by tapping Add in the top right corner'
                      : 'Confirmez en appuyant sur Ajouter en haut à droite'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSInstructions(false);
                dismissInstall();
              }}
              className="mt-6 w-full rounded-xl bg-[#0D7377] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0a5c5f]"
            >
              {isEn ? 'Got it' : 'Compris'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PWAInstallBanner;
