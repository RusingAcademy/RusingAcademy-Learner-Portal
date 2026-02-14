/**
 * Path Overview Component
 * The Path Series - GC Bilingual Mastery Series™
 * 
 * @brand Lingueefy
 * @copyright Rusinga International Consulting Ltd.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle, Circle, Lock, BookOpen, Video, Headphones, FileText,
  Award, Target, Clock, ChevronRight, ChevronDown,
  Star, Zap, Trophy, GraduationCap, Users, Calendar,
  ArrowRight, Play, MapPin
} from 'lucide-react';
import { PathData, Module, Lesson, PATH_COLORS, CECR_DESCRIPTIONS, SLE_DESCRIPTIONS } from './courseTypes';

// ============================================================================
// PATH HEADER COMPONENT
// ============================================================================

interface PathHeaderProps {
  path: PathData;
  userProgress?: {
    completedModules: number;
    totalXP: number;
    currentStreak: number;
  };
}

export const PathHeader: React.FC<PathHeaderProps> = ({ path, userProgress }) => {
  const pathColor = PATH_COLORS[path.pathNumber] || '#4F46E5';
  
  return (
    <Card className="overflow-hidden">
      <div className="h-2" style={{ backgroundColor: pathColor }} />
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" style={{ borderColor: pathColor, color: pathColor }}>
                Parcours {path.pathNumber}
              </Badge>
              <Badge variant="secondary">CECR {path.level.cecr}</Badge>
              <Badge variant="secondary">SLE Niveau {path.level.sle}</Badge>
            </div>
            <CardTitle className="text-3xl">{path.titleFr}</CardTitle>
            <CardDescription className="text-lg">{path.title}</CardDescription>
          </div>
          
          {userProgress && (
            <div className="flex gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold" style={{ color: pathColor }}>{userProgress.totalXP}</p>
                <p className="text-xs text-muted-foreground">XP Total</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">{userProgress.completedModules}/{path.modules.length}</p>
                <p className="text-xs text-muted-foreground">Modules</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{userProgress.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Jours consécutifs</p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Transformation Promise */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: pathColor + '10' }}>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: pathColor }} />
            Promesse de transformation / Transformation Promise
          </h3>
          <p className="text-muted-foreground">{path.transformationPromise.fr}</p>
          <p className="text-sm text-muted-foreground mt-2 italic">{path.transformationPromise.en}</p>
        </div>

        {/* Duration Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold">{path.duration.weeks} semaines</p>
              <p className="text-xs text-muted-foreground">Durée totale</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold">{path.duration.structuredHours}h</p>
              <p className="text-xs text-muted-foreground">Heures structurées</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold">{path.modules.length}</p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-semibold">{path.totalXP} XP</p>
              <p className="text-xs text-muted-foreground">À gagner</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MODULE CARD COMPONENT
// ============================================================================

interface ModuleCardProps {
  module: Module;
  pathColor: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  onStart: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module, pathColor, isUnlocked, isCompleted, onStart
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`transition-all ${!isUnlocked ? 'opacity-60' : ''} ${isCompleted ? 'border-green-500' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCompleted ? 'bg-green-100 text-green-600' : isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : isUnlocked ? <Play className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <Badge variant="outline" className="mb-1">{module.weekRange}</Badge>
              <CardTitle className="text-lg">{module.titleFr}</CardTitle>
              <CardDescription>{module.title}</CardDescription>
            </div>
          </div>
          <Badge style={{ backgroundColor: pathColor }}>{module.xpReward} XP</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{module.descriptionFr}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {module.lessons.length} leçons</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {module.duration}h</span>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="w-full justify-between">
          {isExpanded ? 'Masquer les leçons' : 'Voir les leçons'}
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>

        {isExpanded && (
          <div className="mt-4 space-y-2">
            {module.lessons.map((lesson, index) => (
              <div key={lesson.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{index + 1}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{lesson.titleFr}</p>
                  <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                </div>
                <Badge variant="secondary" className="text-xs">{lesson.xpReward} XP</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button className="w-full" disabled={!isUnlocked} onClick={onStart} style={{ backgroundColor: isUnlocked ? pathColor : undefined }}>
          {isCompleted ? 'Réviser' : isUnlocked ? 'Commencer' : 'Verrouillé'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// ============================================================================
// PATH OVERVIEW MAIN COMPONENT
// ============================================================================

interface PathOverviewProps {
  path: PathData;
  userProgress?: {
    completedModules: number;
    completedModuleIds: string[];
    totalXP: number;
    currentStreak: number;
  };
  onModuleStart: (moduleId: string) => void;
}

export const PathOverview: React.FC<PathOverviewProps> = ({ path, userProgress, onModuleStart }) => {
  const pathColor = PATH_COLORS[path.pathNumber] || '#4F46E5';
  const completedIds = userProgress?.completedModuleIds || [];

  return (
    <div className="space-y-8">
      <PathHeader path={path} userProgress={userProgress} />
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Modules du parcours</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {path.modules.map((module, index) => {
            const isCompleted = completedIds.includes(module.id);
            const isUnlocked = index === 0 || completedIds.includes(path.modules[index - 1].id);
            
            return (
              <ModuleCard
                key={module.id}
                module={module}
                pathColor={pathColor}
                isUnlocked={isUnlocked}
                isCompleted={isCompleted}
                onStart={() => onModuleStart(module.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PathOverview;
