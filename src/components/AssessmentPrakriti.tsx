import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, HelpingHand, CheckCircle2, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { PRAKRITI_QUESTIONS } from "../data";

export function AssessmentPrakriti() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { attribute: string; selection: string; dosha: "Vata" | "Pitta" | "Kapha" }>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const totalQuestions = PRAKRITI_QUESTIONS.length;

  const handleSelectOption = (questionId: string, attribute: string, selection: string, dosha: "Vata" | "Pitta" | "Kapha") => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { attribute, selection, dosha }
    }));

    if (currentStep < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 300);
    } else {
      setIsCompleted(true);
      calculateAndAnalyze();
    }
  };

  const getDoshaScores = () => {
    const scores = { Vata: 0, Pitta: 0, Kapha: 0 };
    (Object.values(answers) as { attribute: string; selection: string; dosha: "Vata" | "Pitta" | "Kapha" }[]).forEach(ans => {
      scores[ans.dosha] += 1;
    });
    return scores;
  };

  const calculateAndAnalyze = async () => {
    setLoading(true);
    const doshaScore = getDoshaScores();
    try {
      const response = await fetch("/api/prakriti-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, doshaScore })
      });

      if (!response.ok) {
        throw new Error("Failed to consult Prakriti analyzer");
      }

      const data = await response.json();
      setAnalysisResult(data.text);
    } catch (e) {
      console.error(e);
      // fallback
      const dominant = getDominantDosha();
      setAnalysisResult(
        `Dynamic Ayurvedic Evaluation:\nYour responses indicate a predominant ${dominant} energy constitution.\n\n1. **Characteristics**: High-contrast physical expression, distinct digestive styles, and deep emotional patterns connected directly to the natural elements (Air, Fire, Water, or Earth).\n\n2. **Dr. VP's Recommendation**: Balance this dosha ratio with warm, cooked whole foods, seasonal routines, and supportive nervous system therapies integrated into our active 90-Day Lifestyle Rehabilitation protocols.`
      );
    } finally {
      setLoading(false);
    }
  };

  const getDominantDosha = (): "Vata" | "Pitta" | "Kapha" => {
    const scores = getDoshaScores();
    let dominant: "Vata" | "Pitta" | "Kapha" = "Vata";
    let max = -1;
    (Object.keys(scores) as Array<"Vata" | "Pitta" | "Kapha">).forEach(key => {
      if (scores[key] > max) {
        max = scores[key];
        dominant = key;
      }
    });
    return dominant;
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setAnswers({});
    setAnalysisResult(null);
    setIsCompleted(false);
  };

  const currentQuestion = PRAKRITI_QUESTIONS[currentStep];
  const doshaScores = getDoshaScores();
  const dominantDosha: "Vata" | "Pitta" | "Kapha" = isCompleted ? getDominantDosha() : "Vata";

  const doshaDescriptions = {
    Vata: "Air and Space elements. Promotes swift movement, creative energy, light skeletal patterns, but can cause digestive gas or restlessness when out of balance.",
    Pitta: "Fire and Water elements. Drives sharp focus, cellular heat, powerful digestive enzymes (Agni), and high drive, but is prone to acidity or inflammation.",
    Kapha: "Water and Earth elements. Provides sturdy cellular foundation, glowing supple skin, high endurance, and deep calm, but can trend towards slower metabolic rates."
  };

  return (
    <div id="prakriti-assessment-card" className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm max-w-4xl mx-auto">
      <div className="bg-emerald-950 text-amber-50 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center">
            <HelpingHand className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold">Discover Your Prakriti</h3>
            <p className="text-stone-300 text-xs">Unveil your unique bio-energetic constitution (Vata, Pitta, and Kapha)</p>
          </div>
        </div>
        {!isCompleted && (
          <div className="text-xs text-stone-300 font-mono">
            Attribute {currentStep + 1} of {totalQuestions}
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
                  className="bg-emerald-800 h-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                  {currentQuestion.attribute}
                </span>
                <h4 className="font-serif text-lg md:text-xl font-bold text-stone-900 mt-3 leading-snug">
                  {currentQuestion.text}
                </h4>
              </div>

              <div className="grid gap-3 pt-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(currentQuestion.id, currentQuestion.attribute, option.text, option.dosha)}
                    className="text-left w-full p-4 rounded-xl border border-stone-200 hover:border-emerald-800 hover:bg-emerald-50/20 transition-all flex items-center justify-between group"
                  >
                    <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
                      {option.text}
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-800 transition-colors shrink-0 ml-3" />
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
              {/* Primary Dosha Output Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-xl border text-center transition-all ${dominantDosha === 'Vata' ? 'border-amber-400 bg-amber-50/50 shadow-sm' : 'border-stone-100 bg-stone-50/40 text-stone-500'}`}>
                  <h4 className="font-serif font-bold text-lg text-amber-900">Vata</h4>
                  <div className="font-mono text-2xl font-bold my-2 text-stone-900">{doshaScores.Vata} / 7</div>
                  <p className="text-xs">Air & Movement</p>
                </div>
                <div className={`p-5 rounded-xl border text-center transition-all ${dominantDosha === 'Pitta' ? 'border-rose-400 bg-rose-50/50 shadow-sm' : 'border-stone-100 bg-stone-50/40 text-stone-500'}`}>
                  <h4 className="font-serif font-bold text-lg text-rose-900">Pitta</h4>
                  <div className="font-mono text-2xl font-bold my-2 text-stone-900">{doshaScores.Pitta} / 7</div>
                  <p className="text-xs">Fire & Transformation</p>
                </div>
                <div className={`p-5 rounded-xl border text-center transition-all ${dominantDosha === 'Kapha' ? 'border-emerald-400 bg-emerald-50/50 shadow-sm' : 'border-stone-100 bg-stone-50/40 text-stone-500'}`}>
                  <h4 className="font-serif font-bold text-lg text-emerald-950">Kapha</h4>
                  <div className="font-mono text-2xl font-bold my-2 text-stone-900">{doshaScores.Kapha} / 7</div>
                  <p className="text-xs">Earth, Water, & Cohesion</p>
                </div>
              </div>

              {/* Informative summary of constitution */}
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                <h5 className="font-serif text-base font-bold text-stone-900 mb-2">
                  Your Primary Energy: <span className="text-emerald-800">{dominantDosha} Constitution</span>
                </h5>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {doshaDescriptions[dominantDosha]}
                </p>
              </div>

              {/* Complete AI Explanation Response */}
              <div className="border border-stone-200 rounded-2xl p-6 bg-stone-50/30 relative">
                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Ayurvedic Translation
                </div>
                <h5 className="font-serif font-semibold text-stone-950 text-base mb-4">
                  Dr. VP's Personalized Constitution Mapping
                </h5>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-stone-500 gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-800 animate-spin" />
                    <p className="text-xs text-stone-400 font-mono animate-pulse">Consulting clinical texts and active element weights...</p>
                  </div>
                ) : (
                  <div className="text-stone-800 text-sm leading-relaxed whitespace-pre-line bg-white border border-stone-100 p-5 rounded-xl">
                    {analysisResult}
                  </div>
                )}
              </div>

              {/* Programs recommendation box */}
              <div className="border border-emerald-900/10 p-6 bg-emerald-50/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h6 className="font-serif text-emerald-900 text-sm font-bold mb-1">
                    Balance Your Prakriti with Target Protocols
                  </h6>
                  <p className="text-stone-600 text-xs max-w-lg leading-relaxed">
                    By understanding your dominant {dominantDosha} elements, we can build custom lifestyle, sleep sequence, and natural circadian eating intervals designed precisely for you in our 90-day reversal programs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("booking-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-brand-spruce hover:bg-brand-sage text-white font-bold px-4 py-2.5 rounded-lg text-xs md:text-sm transition-all shrink-0 uppercase tracking-widest font-mono"
                >
                  Consult Lifestyle Program
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={resetAssessment}
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors border border-stone-200 px-4 py-2 rounded-lg font-semibold"
                >
                  <RefreshCw className="w-3" />
                  Retake Prakriti Assessment
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
