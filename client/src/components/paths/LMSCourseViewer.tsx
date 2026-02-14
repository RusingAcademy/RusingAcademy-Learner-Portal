/**
 * LMS Course Viewer Component
 * The Path Series - GC Bilingual Mastery Series™
 * 
 * This component renders the complete course viewer with:
 * - Video/Audio placeholders for future media integration
 * - Interactive exercises and quizzes
 * - Progress tracking
 * - Gamification elements (XP, badges)
 * 
 * @brand Lingueefy
 * @copyright Rusinga International Consulting Ltd.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward,
  CheckCircle, Circle, Lock, BookOpen, Video, Headphones, FileText,
  MessageSquare, Users, Award, Target, Clock, ChevronRight, ChevronLeft,
  Star, Zap, Trophy, Brain, Mic, PenTool
} from 'lucide-react';
import { Activity, Lesson, Module, PathData } from './courseTypes';

// ============================================================================
// VIDEO PLACEHOLDER COMPONENT
// ============================================================================

interface VideoPlaceholderProps {
  activity: Activity;
  onComplete: () => void;
}

export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({ activity, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center mb-4 animate-pulse">
              <Video className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-center px-4">{activity.titleFr}</h3>
            <p className="text-sm text-slate-300 mt-2">{activity.title}</p>
            <Badge variant="secondary" className="mt-4">
              <Clock className="w-3 h-3 mr-1" />
              {activity.duration} min
            </Badge>
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-[#C65A1E]/20 text-amber-300 border-amber-500">
                Vidéo à venir / Video Coming Soon
              </Badge>
            </div>
          </div>
          {!isPlaying && (
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </button>
          )}
        </div>
        <div className="p-4 space-y-3">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-primary" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:text-primary" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// AUDIO PLACEHOLDER COMPONENT
// ============================================================================

export const AudioPlaceholder: React.FC<VideoPlaceholderProps> = ({ activity, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <Card className="w-full bg-gradient-to-br from-emerald-900 to-emerald-800 text-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/30 flex items-center justify-center animate-pulse">
            <Headphones className="w-10 h-10 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{activity.titleFr}</h3>
            <p className="text-sm text-emerald-200">{activity.title}</p>
            <Badge variant="outline" className="mt-2 bg-[#C65A1E]/20 text-amber-300 border-amber-500">
              Audio à venir / Audio Coming Soon
            </Badge>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" className="text-white">
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button variant="default" size="icon" className="w-12 h-12 rounded-full" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// EXERCISE COMPONENT
// ============================================================================

interface ExerciseProps {
  activity: Activity;
  onComplete: (score: number) => void;
}

export const ExerciseComponent: React.FC<ExerciseProps> = ({ activity, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleComplete = () => {
    setShowResult(true);
    onComplete(score);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">{activity.titleFr}</CardTitle>
        </div>
        <CardDescription>{activity.title}</CardDescription>
      </CardHeader>
      <CardContent>
        {!showResult ? (
          <div className="space-y-4">
            <div className="p-6 bg-muted rounded-lg text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Exercice interactif à venir</p>
              <p className="text-sm text-muted-foreground">Interactive exercise coming soon</p>
            </div>
            <Button onClick={handleComplete} className="w-full">
              Marquer comme complété / Mark as Complete
            </Button>
          </div>
        ) : (
          <div className="text-center p-6">
            <Trophy className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h3 className="text-xl font-bold">Exercice complété!</h3>
            <p className="text-muted-foreground">Exercise completed!</p>
            <Badge className="mt-4">+{activity.xpReward} XP</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COURSE VIEWER COMPONENT
// ============================================================================

interface LMSCourseViewerProps {
  path: PathData;
  currentModuleIndex: number;
  currentLessonIndex: number;
  onActivityComplete: (activityId: string, xp: number) => void;
  onLessonComplete: (lessonId: string) => void;
  onModuleComplete: (moduleId: string) => void;
}

export const LMSCourseViewer: React.FC<LMSCourseViewerProps> = ({
  path,
  currentModuleIndex,
  currentLessonIndex,
  onActivityComplete,
  onLessonComplete,
  onModuleComplete
}) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const currentModule = path.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];
  const currentActivity = currentLesson?.activities[currentActivityIndex];

  const handleActivityComplete = () => {
    if (currentActivity) {
      onActivityComplete(currentActivity.id, currentActivity.xpReward);
      if (currentActivityIndex < currentLesson.activities.length - 1) {
        setCurrentActivityIndex(prev => prev + 1);
      } else {
        onLessonComplete(currentLesson.id);
      }
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      case 'exercise': return <Brain className="w-4 h-4" />;
      case 'quiz': return <FileText className="w-4 h-4" />;
      case 'roleplay': return <Users className="w-4 h-4" />;
      case 'writing': return <PenTool className="w-4 h-4" />;
      case 'discussion': return <MessageSquare className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (!currentModule || !currentLesson || !currentActivity) {
    return <div className="p-8 text-center">Loading course content...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{path.titleFr}</span>
          <ChevronRight className="w-4 h-4" />
          <span>{currentModule.titleFr}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{currentLesson.titleFr}</span>
        </div>

        {/* Activity Content */}
        {currentActivity.type === 'video' && (
          <VideoPlaceholder activity={currentActivity} onComplete={handleActivityComplete} />
        )}
        {currentActivity.type === 'audio' && (
          <AudioPlaceholder activity={currentActivity} onComplete={handleActivityComplete} />
        )}
        {(currentActivity.type === 'exercise' || currentActivity.type === 'quiz') && (
          <ExerciseComponent activity={currentActivity} onComplete={handleActivityComplete} />
        )}

        {/* Lesson Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>{currentLesson.titleFr}</CardTitle>
            <CardDescription>{currentLesson.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Compétences clés / Key Skills</h4>
                <ul className="space-y-1">
                  {currentLesson.content.keySkillsFr.map((skill, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Grammaire / Grammar</h4>
                <ul className="space-y-1">
                  {currentLesson.content.grammarFr.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-blue-500 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Activity List */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activités / Activities</CardTitle>
            <Progress value={(currentActivityIndex / currentLesson.activities.length) * 100} className="h-2" />
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 p-4">
                {currentLesson.activities.map((activity, index) => (
                  <button
                    key={activity.id}
                    onClick={() => !activity.locked && setCurrentActivityIndex(index)}
                    disabled={activity.locked}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      index === currentActivityIndex
                        ? 'bg-primary text-primary-foreground'
                        : activity.completed
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                        : activity.locked
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {activity.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : activity.locked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        getActivityIcon(activity.type)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.titleFr}</p>
                      <p className="text-xs opacity-70">{activity.duration} min • {activity.xpReward} XP</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LMSCourseViewer;
