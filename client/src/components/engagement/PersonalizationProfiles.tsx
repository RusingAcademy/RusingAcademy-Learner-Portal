/**
 * PersonalizationProfiles.tsx
 * Sprint 18 - P2: Personalization Profiles System
 * 
 * Adaptive learning profiles based on learner characteristics:
 * - Anxious Learner (needs encouragement, smaller steps)
 * - Busy Professional (time-constrained, efficiency-focused)
 * - SLE-Focused (exam-oriented, deadline-driven)
 * - Perfectionist (detail-oriented, comprehensive)
 * - Social Learner (community-driven, collaborative)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, Clock, Target, Heart, Users, Brain,
  ChevronRight, Settings, Sparkles, AlertCircle
} from 'lucide-react';

// ============================================
// PROFILE TYPES & DEFINITIONS
// ============================================

export interface LearnerProfile {
  id: string;
  name: string;
  nameFr: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  descriptionFr: string;
  characteristics: string[];
  adaptations: ProfileAdaptation[];
  recommendedPace: 'slow' | 'moderate' | 'fast' | 'intensive';
  dailyTarget: number;
  weeklyTarget: number;
  preferredActivityTypes: string[];
  motivationalStyle: 'encouraging' | 'challenging' | 'data-driven' | 'social';
}

export interface ProfileAdaptation {
  area: string;
  standard: string;
  adapted: string;
}

export const LEARNER_PROFILES: LearnerProfile[] = [
  {
    id: 'anxious',
    name: 'Anxious Learner',
    nameFr: 'Apprenant Anxieux',
    icon: <Heart className="w-5 h-5" />,
    color: '#EC4899',
    description: 'Needs encouragement and smaller, achievable steps',
    descriptionFr: 'A besoin d\'encouragement et de petites étapes réalisables',
    characteristics: [
      'Fears making mistakes',
      'Needs frequent positive reinforcement',
      'Prefers private practice before public performance',
      'Benefits from clear expectations',
      'May avoid speaking activities'
    ],
    adaptations: [
      { area: 'Feedback', standard: 'Direct correction', adapted: 'Sandwich method: positive → correction → encouragement' },
      { area: 'Speaking', standard: 'Immediate live practice', adapted: 'Record privately first, then optional sharing' },
      { area: 'Progress', standard: 'Show all metrics', adapted: 'Focus on growth, minimize error counts' }
    ],
    recommendedPace: 'slow',
    dailyTarget: 20,
    weeklyTarget: 100,
    preferredActivityTypes: ['reading', 'listening', 'writing', 'private-recording'],
    motivationalStyle: 'encouraging'
  },
  {
    id: 'busy-professional',
    name: 'Busy Professional',
    nameFr: 'Professionnel Occupé',
    icon: <Clock className="w-5 h-5" />,
    color: '#3B82F6',
    description: 'Time-constrained, needs maximum efficiency',
    descriptionFr: 'Contraint par le temps, a besoin d\'efficacité maximale',
    characteristics: [
      'Limited daily time (15-30 min)',
      'Values efficiency over thoroughness',
      'Prefers mobile-friendly content',
      'Needs flexible scheduling',
      'Results-oriented'
    ],
    adaptations: [
      { area: 'Lesson Length', standard: '45-60 minutes', adapted: '15-20 minute micro-lessons' },
      { area: 'Content', standard: 'Comprehensive coverage', adapted: 'High-impact essentials only' },
      { area: 'Practice', standard: 'Multiple extended exercises', adapted: 'Quick drills with immediate feedback' }
    ],
    recommendedPace: 'moderate',
    dailyTarget: 15,
    weeklyTarget: 75,
    preferredActivityTypes: ['quick-quiz', 'flashcards', 'micro-listening', 'voice-note'],
    motivationalStyle: 'data-driven'
  },
  {
    id: 'sle-focused',
    name: 'SLE-Focused',
    nameFr: 'Focalisé SLE',
    icon: <Target className="w-5 h-5" />,
    color: '#EF4444',
    description: 'Exam-oriented with specific deadline',
    descriptionFr: 'Orienté examen avec une date limite spécifique',
    characteristics: [
      'Has specific exam date',
      'Needs targeted preparation',
      'Values exam-relevant content',
      'Motivated by progress toward goal',
      'Wants to know exactly what to expect'
    ],
    adaptations: [
      { area: 'Content', standard: 'Comprehensive curriculum', adapted: 'Exam-weighted content prioritization' },
      { area: 'Practice', standard: 'Varied activities', adapted: 'Exam-format simulations' },
      { area: 'Progress', standard: 'General progress', adapted: 'Predicted exam score with confidence interval' }
    ],
    recommendedPace: 'intensive',
    dailyTarget: 45,
    weeklyTarget: 300,
    preferredActivityTypes: ['exam-simulation', 'timed-practice', 'rubric-feedback', 'weak-area-drill'],
    motivationalStyle: 'challenging'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    nameFr: 'Perfectionniste',
    icon: <Brain className="w-5 h-5" />,
    color: '#8B5CF6',
    description: 'Detail-oriented, wants comprehensive mastery',
    descriptionFr: 'Orienté détails, veut une maîtrise complète',
    characteristics: [
      'Wants to understand everything deeply',
      'May get stuck on details',
      'Values accuracy over speed',
      'Needs complete explanations',
      'High self-standards'
    ],
    adaptations: [
      { area: 'Explanations', standard: 'Concise rules', adapted: 'Detailed explanations with exceptions' },
      { area: 'Progression', standard: 'Move on at 70% mastery', adapted: 'Option to achieve 90%+ before moving on' },
      { area: 'Feedback', standard: 'General feedback', adapted: 'Detailed analysis with specific improvement points' }
    ],
    recommendedPace: 'slow',
    dailyTarget: 40,
    weeklyTarget: 200,
    preferredActivityTypes: ['grammar-deep-dive', 'detailed-feedback', 'comprehensive-quiz'],
    motivationalStyle: 'data-driven'
  },
  {
    id: 'social-learner',
    name: 'Social Learner',
    nameFr: 'Apprenant Social',
    icon: <Users className="w-5 h-5" />,
    color: '#10B981',
    description: 'Thrives with community and collaboration',
    descriptionFr: 'S\'épanouit avec la communauté et la collaboration',
    characteristics: [
      'Motivated by peer interaction',
      'Enjoys group activities',
      'Values community recognition',
      'Learns well from others experiences',
      'Competitive in positive way'
    ],
    adaptations: [
      { area: 'Practice', standard: 'Individual exercises', adapted: 'Pair/group activities, community challenges' },
      { area: 'Progress', standard: 'Personal metrics only', adapted: 'Leaderboards, cohort comparisons' },
      { area: 'Support', standard: 'AI/coach support', adapted: 'Peer mentoring, study groups, community forums' }
    ],
    recommendedPace: 'moderate',
    dailyTarget: 30,
    weeklyTarget: 150,
    preferredActivityTypes: ['group-challenge', 'peer-review', 'community-discussion'],
    motivationalStyle: 'social'
  }
];

// ============================================
// PROFILE SELECTOR COMPONENT
// ============================================

interface ProfileSelectorProps {
  onProfileSelect: (profile: LearnerProfile) => void;
  currentProfile?: LearnerProfile;
  language?: 'en' | 'fr';
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  onProfileSelect,
  currentProfile,
  language = 'fr'
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {LEARNER_PROFILES.map((profile) => (
        <Card
          key={profile.id}
          className={`cursor-pointer transition-all hover:shadow-lg ${
            currentProfile?.id === profile.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onProfileSelect(profile)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${profile.color}20` }}
              >
                <span style={{ color: profile.color }}>
                  {profile.id === 'anxious' && '💗'}
                  {profile.id === 'busy-professional' && '⏰'}
                  {profile.id === 'sle-focused' && '🎯'}
                  {profile.id === 'perfectionist' && '🧠'}
                  {profile.id === 'social-learner' && '👥'}
                </span>
              </div>
              <CardTitle className="text-lg">
                {language === 'fr' ? profile.nameFr : profile.name}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {language === 'fr' ? profile.descriptionFr : profile.description}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline">
                {profile.dailyTarget} min/jour
              </Badge>
              <Badge variant="outline" style={{ borderColor: profile.color, color: profile.color }}>
                {profile.recommendedPace === 'slow' && 'Rythme doux'}
                {profile.recommendedPace === 'moderate' && 'Rythme modéré'}
                {profile.recommendedPace === 'fast' && 'Rythme rapide'}
                {profile.recommendedPace === 'intensive' && 'Rythme intensif'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ============================================
// LEADERBOARD COMPONENT (OPT-IN)
// ============================================

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar?: string;
  xp: number;
  streak: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  type: 'weekly' | 'monthly' | 'all-time';
  language?: 'en' | 'fr';
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  currentUserId,
  type,
  language = 'fr'
}) => {
  const titles = {
    weekly: { en: 'Weekly Leaderboard', fr: 'Classement Hebdomadaire' },
    monthly: { en: 'Monthly Leaderboard', fr: 'Classement Mensuel' },
    'all-time': { en: 'All-Time Leaderboard', fr: 'Classement Général' }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏆 {titles[type][language]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.slice(0, 10).map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                entry.userId === currentUserId ? 'bg-primary/10 border border-primary' : 'bg-muted/50'
              }`}
            >
              <div className="w-8 text-center font-bold">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && `#${index + 1}`}
              </div>
              <div className="flex-1">
                <div className="font-medium">{entry.displayName}</div>
                <div className="text-xs text-muted-foreground">
                  🔥 {entry.streak} jours • {entry.xp.toLocaleString()} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSelector;
