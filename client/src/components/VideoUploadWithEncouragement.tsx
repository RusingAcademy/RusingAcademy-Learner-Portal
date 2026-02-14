/**
 * Video Upload Component with Encouragement
 * Video is OPTIONAL but strongly encouraged.
 */

import { useState, useRef } from 'react';
import { Video, CheckCircle, Star, TrendingUp, Users, X } from 'lucide-react';

interface VideoUploadProps {
  videoUrl: string | null;
  onVideoChange: (url: string | null) => void;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    title: 'Presentation Video',
    optional: '(Optional but Highly Recommended)',
    encouragementTitle: '🎬 Why Add a Video?',
    benefits: [
      { icon: TrendingUp, title: '3x More Bookings', description: 'Coaches with videos receive 3x more booking requests.' },
      { icon: Users, title: 'Build Trust Instantly', description: 'Learners feel more confident booking with coaches they can see.' },
      { icon: Star, title: 'Stand Out', description: 'Only 40% of coaches have videos. Be part of the elite!' },
    ],
    tips: {
      title: '💡 Quick Tips for a Great Video',
      items: ['Keep it under 2 minutes', 'Introduce yourself and your teaching style', 'Mention your SLE/GC expertise', 'Smile and be authentic!'],
    },
    uploadButton: 'Upload Your Video',
    skipForNow: 'Skip for now (you can add it later)',
  },
  fr: {
    title: 'Vidéo de présentation',
    optional: '(Optionnel mais fortement recommandé)',
    encouragementTitle: '🎬 Pourquoi ajouter une vidéo ?',
    benefits: [
      { icon: TrendingUp, title: '3x plus de réservations', description: 'Les coaches avec vidéo reçoivent 3x plus de demandes.' },
      { icon: Users, title: 'Créez la confiance', description: 'Les apprenants se sentent plus confiants en voyant leur coach.' },
      { icon: Star, title: 'Démarquez-vous', description: 'Seulement 40% des coaches ont une vidéo. Faites partie de l\'élite !' },
    ],
    tips: {
      title: '💡 Conseils pour une excellente vidéo',
      items: ['Gardez-la sous 2 minutes', 'Présentez-vous et votre style', 'Mentionnez votre expertise SLE/GC', 'Souriez et soyez authentique !'],
    },
    uploadButton: 'Téléverser votre vidéo',
    skipForNow: 'Passer pour l\'instant (vous pourrez l\'ajouter plus tard)',
  },
};

export default function VideoUploadWithEncouragement({ videoUrl, onVideoChange, language }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">{t.title}</h3>
        <p className="text-sm text-amber-600 font-medium mt-1">{t.optional}</p>
      </div>
      {!videoUrl && (
        <div className="bg-gradient-to-br from-[#FFF8F3] to-[#FFF8F3] rounded-xl p-6 border border-[#FFE4D6]">
          <h4 className="text-lg font-semibold mb-4">{t.encouragementTitle}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {t.benefits.map((b, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                <b.icon className="w-8 h-8 text-amber-500 mb-2" />
                <h5 className="font-semibold text-sm">{b.title}</h5>
                <p className="text-xs text-gray-600 mt-1">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {!videoUrl && <p className="text-center text-sm text-gray-500">{t.skipForNow}</p>}
    </div>
  );
}
