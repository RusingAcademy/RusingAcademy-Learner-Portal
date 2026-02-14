import { useState } from "react";

interface ConfidenceCheckProps {
  lessonId: number;
  courseId: number;
  lessonTitle: string;
  onComplete: (data: { level: number; feedback?: string; needsReview: string[] }) => void;
  onSkip: () => void;
}

const CONFIDENCE_LEVELS = [
  { level: 1, emoji: "😟", label: "Not confident", labelFr: "Pas confiant", color: "bg-red-100 border-red-300 hover:bg-red-200" },
  { level: 2, emoji: "😕", label: "Slightly confident", labelFr: "Peu confiant", color: "bg-orange-100 border-orange-300 hover:bg-orange-200" },
  { level: 3, emoji: "😐", label: "Somewhat confident", labelFr: "Assez confiant", color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200" },
  { level: 4, emoji: "🙂", label: "Confident", labelFr: "Confiant", color: "bg-green-100 border-green-300 hover:bg-green-200" },
  { level: 5, emoji: "😄", label: "Very confident", labelFr: "Très confiant", color: "bg-teal-100 border-teal-300 hover:bg-teal-200" },
];

const REVIEW_TOPICS = [
  { id: "vocabulary", label: "Vocabulary", labelFr: "Vocabulaire", icon: "📚" },
  { id: "grammar", label: "Grammar", labelFr: "Grammaire", icon: "📝" },
  { id: "pronunciation", label: "Pronunciation", labelFr: "Prononciation", icon: "🎤" },
  { id: "comprehension", label: "Comprehension", labelFr: "Compréhension", icon: "👂" },
  { id: "writing", label: "Writing", labelFr: "Écriture", icon: "✍️" },
  { id: "speaking", label: "Speaking", labelFr: "Expression orale", icon: "💬" },
];

export function ConfidenceCheck({ lessonId, courseId, lessonTitle, onComplete, onSkip }: ConfidenceCheckProps) {
  const [step, setStep] = useState<"confidence" | "review" | "feedback">("confidence");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [needsReview, setNeedsReview] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  
  const handleConfidenceSelect = (level: number) => {
    setSelectedLevel(level);
    if (level <= 3) {
      setStep("review");
    } else {
      setStep("feedback");
    }
  };
  
  const handleToggleReview = (topic: string) => {
    setNeedsReview(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };
  
  const handleSubmit = () => {
    if (selectedLevel === null) return;
    onComplete({
      level: selectedLevel,
      feedback: feedback.trim() || undefined,
      needsReview,
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎯</span>
            <h2 className="text-xl font-bold">Quick Check-In</h2>
          </div>
          <p className="text-teal-100 text-sm">
            Help us personalize your learning experience
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {step === "confidence" && (
            <div>
              <p className="text-gray-700 mb-4">
                How confident do you feel about <span className="font-medium">"{lessonTitle}"</span>?
              </p>
              
              <div className="grid grid-cols-5 gap-2">
                {CONFIDENCE_LEVELS.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => handleConfidenceSelect(level.level)}
                    className={`p-3 rounded-xl border-2 transition-all ${level.color} ${
                      selectedLevel === level.level ? "ring-2 ring-offset-2 ring-teal-500" : ""
                    }`}
                  >
                    <div className="text-3xl mb-1">{level.emoji}</div>
                    <div className="text-xs text-gray-600">{level.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {step === "review" && (
            <div>
              <p className="text-gray-700 mb-4">
                What areas would you like to review?
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {REVIEW_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleToggleReview(topic.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      needsReview.includes(topic.id)
                        ? "bg-teal-50 border-teal-500 text-teal-700"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl mr-2">{topic.icon}</span>
                    <span className="font-medium">{topic.label}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setStep("feedback")}
                className="w-full py-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                Continue →
              </button>
            </div>
          )}
          
          {step === "feedback" && (
            <div>
              <p className="text-gray-700 mb-4">
                Any additional feedback? (Optional)
              </p>
              
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts about this lesson..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                rows={3}
              />
              
              {/* Summary */}
              <div className="mt-4 p-3 bg-white rounded-xl">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Your confidence:</span>{" "}
                  {CONFIDENCE_LEVELS.find(l => l.level === selectedLevel)?.emoji}{" "}
                  {CONFIDENCE_LEVELS.find(l => l.level === selectedLevel)?.label}
                </p>
                {needsReview.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Review areas:</span>{" "}
                    {needsReview.map(r => REVIEW_TOPICS.find(t => t.id === r)?.label).join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-between">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            Skip
          </button>
          
          {step === "feedback" && (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfidenceCheck;
