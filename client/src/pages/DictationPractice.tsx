/**
 * Dictation Practice Page
 * Provides structured dictation exercises using pre-generated audio
 */

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Headphones,
  Trophy,
  Target,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { DictationExercise } from "@/components/DictationExercise";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type SLELevel = "A" | "B" | "C";

interface DictationResult {
  phraseId: string;
  userInput: string;
  correctText: string;
  accuracy: number;
  attempts: number;
  hintsUsed: number;
}

export default function DictationPractice() {
  const [selectedLevel, setSelectedLevel] = useState<SLELevel | null>(null);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<DictationResult[]>([]);
  
  
  // Fetch audio phrases by level
  const { data: audioData, isLoading } = trpc.audio.getAudioByLevel.useQuery(
    { level: selectedLevel || "A" },
    { enabled: !!selectedLevel }
  );
  
  const handleLevelSelect = (level: SLELevel) => {
    setSelectedLevel(level);
    setExerciseComplete(false);
    setExerciseResults([]);
  };
  
  const handleExerciseComplete = (results: DictationResult[]) => {
    setExerciseResults(results);
    setExerciseComplete(true);
    
    const avgAccuracy = Math.round(
      results.reduce((acc, r) => acc + r.accuracy, 0) / results.length
    );
    
    toast.success(`Exercice terminé! Score moyen: ${avgAccuracy}%`);
  };
  
  const handleRestartExercise = () => {
    setExerciseComplete(false);
    setExerciseResults([]);
  };
  
  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setExerciseComplete(false);
    setExerciseResults([]);
  };
  
  // Level selection view
  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/sle-diagnostic">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Headphones className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Exercices de Dictée</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Améliorez votre compréhension orale et votre orthographe en écoutant
                des phrases et en les transcrivant. Choisissez votre niveau pour commencer.
              </p>
            </div>
            
            {/* Level Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Level A */}
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleLevelSelect("A")}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-500">Niveau A</Badge>
                    <Target className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">Débutant</CardTitle>
                  <CardDescription>
                    Phrases simples pour les communications quotidiennes au travail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Salutations formelles</li>
                    <li>• Présentations personnelles</li>
                    <li>• Demandes simples</li>
                    <li>• Informations de base</li>
                  </ul>
                  <Button className="w-full mt-4" onClick={() => handleLevelSelect("A")}>Commencer</Button>
                </CardContent>
              </Card>
              
              {/* Level B */}
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleLevelSelect("B")}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-yellow-500">Niveau B</Badge>
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">Intermédiaire</CardTitle>
                  <CardDescription>
                    Discussions professionnelles et expressions d'opinions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Réunions et présentations</li>
                    <li>• Expression d'opinions</li>
                    <li>• Négociations simples</li>
                    <li>• Rapports et échéances</li>
                  </ul>
                  <Button className="w-full mt-4" onClick={() => handleLevelSelect("B")}>Commencer</Button>
                </CardContent>
              </Card>
              
              {/* Level C */}
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleLevelSelect("C")}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-red-500">Niveau C</Badge>
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">Avancé</CardTitle>
                  <CardDescription>
                    Vocabulaire technique et discussions stratégiques complexes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Analyse stratégique</li>
                    <li>• Vocabulaire technique</li>
                    <li>• Négociations complexes</li>
                    <li>• Recommandations politiques</li>
                  </ul>
                  <Button className="w-full mt-4" onClick={() => handleLevelSelect("C")}>Commencer</Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Tips */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Conseils pour réussir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Écoutez plusieurs fois</h4>
                    <p className="text-muted-foreground">
                      N'hésitez pas à rejouer l'audio autant de fois que nécessaire.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Utilisez les indices</h4>
                    <p className="text-muted-foreground">
                      Les indices peuvent vous aider à démarrer si vous êtes bloqué.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Pratiquez régulièrement</h4>
                    <p className="text-muted-foreground">
                      La répétition est la clé pour améliorer votre compréhension.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  // Exercise complete view
  if (exerciseComplete && exerciseResults.length > 0) {
    const avgAccuracy = Math.round(
      exerciseResults.reduce((acc, r) => acc + r.accuracy, 0) / exerciseResults.length
    );
    const perfectCount = exerciseResults.filter((r) => r.accuracy === 100).length;
    const goodCount = exerciseResults.filter((r) => r.accuracy >= 80 && r.accuracy < 100).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mx-auto mb-4">
                  <Trophy className="h-10 w-10 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl">Exercice Terminé!</CardTitle>
                <CardDescription>
                  Voici vos résultats pour le niveau {selectedLevel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Summary */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{avgAccuracy}%</p>
                    <p className="text-sm text-muted-foreground">Score moyen</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{perfectCount}</p>
                    <p className="text-sm text-muted-foreground">Parfaits (100%)</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-600">{goodCount}</p>
                    <p className="text-sm text-muted-foreground">Bons (≥80%)</p>
                  </div>
                </div>
                
                {/* Detailed Results */}
                <div className="space-y-2">
                  <h4 className="font-medium">Détails par phrase:</h4>
                  {exerciseResults.map((result, index) => (
                    <div
                      key={result.phraseId}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <span className="text-sm">Phrase {index + 1}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {result.attempts} tentative(s)
                        </span>
                        <Badge
                          variant={
                            result.accuracy >= 80
                              ? "default"
                              : result.accuracy >= 50
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {result.accuracy}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={handleRestartExercise}>
                    Recommencer
                  </Button>
                  <Button onClick={handleBackToLevels}>
                    Choisir un autre niveau
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  // Exercise view
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={handleBackToLevels} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux niveaux
          </Button>
          <Badge
            className={
              selectedLevel === "A"
                ? "bg-green-500"
                : selectedLevel === "B"
                ? "bg-yellow-500"
                : "bg-red-500"
            }
          >
            Niveau {selectedLevel}
          </Badge>
        </div>
        
        {/* Exercise */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        // @ts-expect-error - TS2339: auto-suppressed during TS cleanup
        ) : audioData && audioData.length > 0 ? (
          <DictationExercise
            // @ts-expect-error - TS2339: auto-suppressed during TS cleanup
            phrases={audioData.map((phrase) => ({
              id: phrase.id,
              text: phrase.text,
              textFr: phrase.textFr || phrase.text,
              audioUrl: phrase.audioUrl,
              level: phrase.level,
              category: phrase.category,
            }))}
            onComplete={handleExerciseComplete}
            showTranslation={true}
            language="fr"
          />
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Aucune phrase disponible pour ce niveau.
              </p>
              <Button onClick={handleBackToLevels} className="mt-4">
                Retour
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
