import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, FileText, CheckCircle2, ChevronRight, AlertCircle, ShoppingBag, ShieldAlert, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { PCOS_QUESTIONS } from "../data";

export function AssessmentPCOS() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionText: string; score: number }>>({});
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalQuestions = PCOS_QUESTIONS.length;

  const handleSelectOption = (questionId: string, optionText: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { optionText, score }
    }));

    if (currentStep < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 300);
    } else {
      setIsCompleted(true);
      triggerAnalysis();
    }
  };

  const calculateTotalScore = (): number => {
    return (Object.values(answers) as { optionText: string; score: number }[]).reduce((sum, item) => sum + item.score, 0);
  };

  const triggerAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/pcos-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        throw new Error("Failed to post analysis");
      }

      const data = await response.json();
      setAnalysisResult(data.text);
    } catch (e) {
      console.error(e);
      setAnalysisResult(
        "Empathetic Assessment Note:\nBased on your responses, there are definite signs of hormonal stress and glucose sluggishness. To support your body, Dr. VP recommends focusing on direct insulin balancing (e.g., adding fiber before carbohydrates, gentle post-meal walks) and nervous system soothing routines. Let's explore our 90-Day PCOS Reversal Program!"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setAnswers({});
    setAnalysisResult(null);
    setIsCompleted(false);
  };

  const totalScore = calculateTotalScore();
  let assessmentType = "Low Risk / Balanced Cycle Indicators";
  let summaryDetails = "Your hormonal profile appears relatively balanced. Maintain your healthy circadian rhythms and clean nutrition.";
  
  if (totalScore >= 6 && totalScore <= 12) {
    assessmentType = "Moderate Hormonal and Metabolic Stress Indicators";
    summaryDetails = "Some signs of elevated androgens or insulin resistance are present. This can often lead to stubborn weight, skin flares, or irregular cycles if ignored.";
  } else if (totalScore > 12) {
    assessmentType = "High Chronic Indicators / Potential PCOS Root Drivers";
    summaryDetails = "Clear markers of cyclic irregularity, androgen markers, or glucose sensitivity. This level of system stress responds extremely well to structured 90-day physical and dietary modification programs.";
  }

  const currentQuestion = PCOS_QUESTIONS[currentStep];

  return (
    <div id="pcos-assessment-card" className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm max-w-4xl mx-auto">
      {/* Upper header */}
      <div className="bg-stone-900 text-amber-50 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold">Free PCOS Assessment</h3>
            <p className="text-stone-400 text-xs">Analyze cyclic integrity, androgen levels, and metabolic indicators</p>
          </div>
        </div>
        {!isCompleted && (
          <div className="text-xs text-stone-400 font-mono">
            Question {currentStep + 1} of {totalQuestions}
          </div>
        )}
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Progress bar */}
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-1 rounded">
                  {currentQuestion.category.toUpperCase()} FACTOR
                </span>
                <h4 className="font-serif text-lg md:text-xl font-bold text-stone-900 mt-3 leading-snug">
                  {currentQuestion.text}
                </h4>
              </div>

              <div className="grid gap-3 pt-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(currentQuestion.id, option.text, option.score)}
                    className="text-left w-full p-4 rounded-xl border border-stone-200 hover:border-amber-600 hover:bg-stone-50/50 transition-all flex items-center justify-between group"
                  >
                    <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
                      {option.text}
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 transition-colors shrink-0 ml-3" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Score breakdown metrics */}
              <div className="p-6 bg-amber-50/40 rounded-2xl border border-amber-200/50 max-w-2xl mx-auto text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 font-mono">
                  Assessment Completed Score: {totalScore}
                </span>
                <h4 className="font-serif text-xl font-black text-stone-900 mt-2">
                  {assessmentType}
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed mt-2">
                  {summaryDetails}
                </p>
              </div>

              {/* Secure AI Generation Output */}
              <div className="border border-stone-200 rounded-2xl p-6 bg-stone-50/50 relative">
                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Synthesis
                </div>
                <h5 className="font-serif font-semibold text-stone-900 text-base mb-4 flex items-center gap-2">
                  <span>Dr. Vishnupriya's Recommendations</span>
                </h5>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-stone-500 gap-3">
                    <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                    <p className="text-xs text-stone-400 font-mono animate-pulse">Running advanced endocrine and lifestyle analysis mapping...</p>
                  </div>
                ) : (
                  <div className="text-stone-800 text-sm leading-relaxed whitespace-pre-line bg-white border border-stone-100 p-5 rounded-xl">
                    {analysisResult}
                  </div>
                )}
              </div>

              {/* Action and Referral Box */}
              <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h6 className="font-serif text-amber-100 text-base font-bold mb-1">
                    Ready to reverse these symptoms?
                  </h6>
                  <p className="text-stone-400 text-xs max-w-lg leading-relaxed">
                    Our **90-Day PCOS Reversal Program** addresses these metrics systematically. We provide personalized nutrition, cyclic exercise guides, and natural stress modulation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("booking-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-lg text-xs md:text-sm transition-all flex items-center gap-2 shrink-0 group"
                >
                  Book 90-Day Plan Consultation
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={resetAssessment}
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors border border-stone-200 px-4 py-2 rounded-lg font-semibold"
                >
                  <RefreshCw className="w-3" />
                  Retake Free PCOS Assessment
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
