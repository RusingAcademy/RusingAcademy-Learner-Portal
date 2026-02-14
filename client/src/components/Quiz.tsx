import { useState, useEffect } from "react";

interface QuizQuestion {
  id: number;
  type: "multiple_choice" | "true_false" | "fill_blank" | "matching" | "audio";
  question: string;
  questionFr?: string;
  options?: string[];
  optionsFr?: string[];
  correctAnswer: string | number;
  explanation?: string;
  explanationFr?: string;
  audioUrl?: string;
  points?: number;
}

interface QuizProps {
  title: string;
  titleFr?: string;
  questions: QuizQuestion[];
  passingScore?: number; // percentage
  timeLimit?: number; // seconds
  language?: "en" | "fr";
  onComplete: (result: {
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    answers: Record<number, { answer: string | number; correct: boolean }>;
    timeSpent: number;
  }) => void;
  onExit?: () => void;
}

export function Quiz({
  title,
  titleFr,
  questions,
  passingScore = 70,
  timeLimit,
  language = "en",
  onComplete,
  onExit,
}: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [startTime] = useState(Date.now());
  
  const currentQuestion = questions[currentIndex];
  const displayTitle = language === "fr" && titleFr ? titleFr : title;
  const displayQuestion = language === "fr" && currentQuestion.questionFr 
    ? currentQuestion.questionFr 
    : currentQuestion.question;
  const displayOptions = language === "fr" && currentQuestion.optionsFr 
    ? currentQuestion.optionsFr 
    : currentQuestion.options;
  const displayExplanation = language === "fr" && currentQuestion.explanationFr 
    ? currentQuestion.explanationFr 
    : currentQuestion.explanation;
  
  // Timer
  useEffect(() => {
    if (!timeLimit || showResults) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLimit, showResults]);
  
  const handleSelectAnswer = (answer: string | number) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };
  
  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return;
    
    setAnswers({ ...answers, [currentQuestion.id]: selectedAnswer });
    setIsAnswered(true);
    setShowExplanation(true);
  };
  
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      handleSubmitQuiz();
    }
  };
  
  const handleSubmitQuiz = () => {
    const results: Record<number, { answer: string | number; correct: boolean }> = {};
    let totalPoints = 0;
    let earnedPoints = 0;
    
    questions.forEach((q) => {
      const points = q.points || 1;
      totalPoints += points;
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      
      if (isCorrect) {
        earnedPoints += points;
      }
      
      results[q.id] = {
        answer: userAnswer,
        correct: isCorrect,
      };
    });
    
    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    setShowResults(true);
    
    onComplete({
      score: earnedPoints,
      totalPoints,
      percentage,
      passed: percentage >= passingScore,
      answers: results,
      timeSpent,
    });
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  
  if (showResults) {
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const earnedPoints = Object.entries(answers).reduce((sum, [id, answer]) => {
      const question = questions.find((q) => q.id === parseInt(id));
      if (question && answer === question.correctAnswer) {
        return sum + (question.points || 1);
      }
      return sum;
    }, 0);
    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const passed = percentage >= passingScore;
    
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto">
        <div className={`p-8 text-center ${passed ? "bg-gradient-to-br from-teal-500 to-teal-600" : "bg-gradient-to-br from-[#C65A1E] to-red-500"} text-white`}>
          <div className="text-6xl mb-4">{passed ? "🎉" : "📚"}</div>
          <h2 className="text-2xl font-bold mb-2">
            {passed 
              ? (language === "fr" ? "Félicitations !" : "Congratulations!") 
              : (language === "fr" ? "Continuez à pratiquer !" : "Keep Practicing!")}
          </h2>
          <p className="text-white/90">
            {passed
              ? (language === "fr" ? "Vous avez réussi le quiz !" : "You passed the quiz!")
              : (language === "fr" ? `Vous avez besoin de ${passingScore}% pour réussir.` : `You need ${passingScore}% to pass.`)}
          </p>
        </div>
        
        <div className="p-6">
          {/* Score */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">{percentage}%</div>
            <p className="text-gray-600">
              {earnedPoints} / {totalPoints} {language === "fr" ? "points" : "points"}
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {Object.values(answers).filter((a, i) => a === questions[i]?.correctAnswer).length}
              </p>
              <p className="text-sm text-green-700">{language === "fr" ? "Correct" : "Correct"}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600">
                {questions.length - Object.values(answers).filter((a, i) => a === questions[i]?.correctAnswer).length}
              </p>
              <p className="text-sm text-red-700">{language === "fr" ? "Incorrect" : "Incorrect"}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatTime(Math.round((Date.now() - startTime) / 1000))}
              </p>
              <p className="text-sm text-blue-700">{language === "fr" ? "Temps" : "Time"}</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onExit}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-white font-medium"
            >
              {language === "fr" ? "Retour au cours" : "Back to Course"}
            </button>
            {!passed && (
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setAnswers({});
                  setShowResults(false);
                  setSelectedAnswer(null);
                  setIsAnswered(false);
                  setShowExplanation(false);
                  setTimeRemaining(timeLimit || 0);
                }}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium"
              >
                {language === "fr" ? "Réessayer" : "Try Again"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">{displayTitle}</h2>
          {timeLimit && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              timeRemaining < 60 ? "bg-red-500" : "bg-white/20"
            }`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-sm">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>
      
      {/* Question */}
      <div className="p-6">
        <p className="text-lg font-medium text-gray-900 mb-6">{displayQuestion}</p>
        
        {/* Options */}
        {currentQuestion.type === "multiple_choice" && displayOptions && (
          <div className="space-y-3">
            {displayOptions.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === currentQuestion.correctAnswer;
              
              let optionStyle = "bg-white border-gray-200 hover:border-teal-300";
              
              if (isAnswered) {
                if (isCorrectOption) {
                  optionStyle = "bg-green-50 border-green-500 text-green-700";
                } else if (isSelected && !isCorrectOption) {
                  optionStyle = "bg-red-50 border-red-500 text-red-700";
                }
              } else if (isSelected) {
                optionStyle = "bg-teal-50 border-teal-500";
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-teal-500 bg-teal-500 text-white" : "border-gray-300"
                    }`}>
                      {isAnswered && isCorrectOption && "✓"}
                      {isAnswered && isSelected && !isCorrectOption && "✗"}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        
        {/* True/False */}
        {currentQuestion.type === "true_false" && (
          <div className="flex gap-4">
            {["true", "false"].map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              
              let optionStyle = "bg-white border-gray-200 hover:border-teal-300";
              
              if (isAnswered) {
                if (isCorrectOption) {
                  optionStyle = "bg-green-50 border-green-500";
                } else if (isSelected && !isCorrectOption) {
                  optionStyle = "bg-red-50 border-red-500";
                }
              } else if (isSelected) {
                optionStyle = "bg-teal-50 border-teal-500";
              }
              
              return (
                <button
                  key={option}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={isAnswered}
                  className={`flex-1 p-4 rounded-xl border-2 text-center font-medium transition-all ${optionStyle}`}
                >
                  {option === "true" 
                    ? (language === "fr" ? "Vrai" : "True") 
                    : (language === "fr" ? "Faux" : "False")}
                </button>
              );
            })}
          </div>
        )}
        
        {/* Explanation */}
        {showExplanation && displayExplanation && (
          <div className={`mt-4 p-4 rounded-xl ${isCorrect ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
            <p className={`text-sm ${isCorrect ? "text-green-700" : "text-orange-700"}`}>
              <span className="font-medium">
                {isCorrect 
                  ? (language === "fr" ? "Correct ! " : "Correct! ") 
                  : (language === "fr" ? "Explication : " : "Explanation: ")}
              </span>
              {displayExplanation}
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 p-4 flex justify-between">
        <button
          onClick={onExit}
          className="px-4 py-2 text-gray-500 hover:text-gray-700"
        >
          {language === "fr" ? "Quitter" : "Exit"}
        </button>
        
        {!isAnswered ? (
          <button
            onClick={handleConfirmAnswer}
            disabled={selectedAnswer === null}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {language === "fr" ? "Confirmer" : "Confirm"}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
          >
            {currentIndex < questions.length - 1 
              ? (language === "fr" ? "Suivant" : "Next") 
              : (language === "fr" ? "Voir les résultats" : "See Results")}
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;
