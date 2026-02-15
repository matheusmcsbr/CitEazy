import React, { useState, useEffect } from 'react';
import { Question, QuizResult } from '../types';
import { generateQuizQuestions } from '../services/geminiService';
import { Loader2, CheckCircle2, XCircle, ChevronRight, Home, Search, ShieldCheck } from 'lucide-react';

interface QuizProps {
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onComplete, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);
  
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const data = await generateQuizQuestions(128);
        const shuffledQuestions = shuffleArray(data.questions);
        setQuestions(shuffledQuestions);
        setGroundingMetadata(data.groundingMetadata);
      } catch (err) {
        console.error("Civics generation failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswerSelect = (optionIndex: number) => {
    if (showExplanation) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const endTime = Date.now();
    const correctCount = questions.reduce((acc, q, idx) => {
      return acc + (selectedAnswers[idx] === q.correctAnswerIndex ? 1 : 0);
    }, 0);
    const score = Math.round((correctCount / questions.length) * 100);
    const result: QuizResult = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      correctCount,
      timeSpentSeconds: Math.floor((endTime - startTime) / 1000),
      questions,
      userAnswers: selectedAnswers
    };
    onComplete(result);
  };

  const getSources = () => {
    if (!groundingMetadata?.groundingChunks) return null;
    const sources = new Set<string>();
    groundingMetadata.groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri) sources.add(chunk.web.uri);
    });
    if (sources.size === 0) return null;
    return Array.from(sources).map((uri) => {
      try {
        return { display: new URL(uri).hostname, href: uri };
      } catch {
        return { display: uri, href: uri };
      }
    });
  };

  const sources = getSources();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="relative w-16 h-16 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Preparing Official Question Set</h2>
        <p className="text-slate-500 mt-3 max-w-md font-medium">Syncing with 2025 government data to verify current officials (Governor, Speaker, Justices)...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
  const isCorrect = isAnswered && selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswerIndex;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <div className="flex justify-between text-sm font-bold text-slate-500 mb-3 tracking-wide uppercase">
          <span>Question {currentQuestionIndex + 1} / {questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg shadow-blue-200" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500"></div>
        
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-start mb-6">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-lg uppercase tracking-wider">
              {currentQuestion.category}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-snug">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              let btnClass = "w-full text-left p-5 rounded-2xl border-2 transition-all flex justify-between items-center group ";
              if (!isAnswered) {
                btnClass += "border-slate-100 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer shadow-sm hover:shadow-md";
              } else {
                if (idx === currentQuestion.correctAnswerIndex) btnClass += "border-green-500 bg-green-50 text-green-900 shadow-md ring-1 ring-green-500/20";
                else if (idx === selectedAnswers[currentQuestionIndex]) btnClass += "border-rose-500 bg-rose-50 text-rose-900 shadow-sm";
                else btnClass += "border-slate-100 opacity-40 bg-slate-50";
              }

              return (
                <button key={idx} onClick={() => !isAnswered && handleAnswerSelect(idx)} disabled={isAnswered} className={btnClass}>
                  <span className="font-semibold text-lg">{option}</span>
                  {isAnswered && idx === currentQuestion.correctAnswerIndex && <CheckCircle2 className="text-green-600 w-6 h-6 shrink-0" />}
                  {isAnswered && idx === selectedAnswers[currentQuestionIndex] && idx !== currentQuestion.correctAnswerIndex && <XCircle className="text-rose-600 w-6 h-6 shrink-0" />}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className={`mt-8 p-6 rounded-2xl ${isCorrect ? 'bg-green-50/80 border border-green-100' : 'bg-rose-50/80 border border-rose-100'} animate-fade-in`}>
              <h4 className={`font-extrabold mb-2 text-sm uppercase tracking-wider flex items-center gap-2 ${isCorrect ? 'text-green-800' : 'text-rose-800'}`}>
                {isCorrect ? <ShieldCheck size={18}/> : null}
                {isCorrect ? 'Correct Answer' : 'Incorrect'}
              </h4>
              <p className="text-slate-800 text-base leading-relaxed font-medium">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
          <button onClick={onExit} className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-200/50 transition-colors">
            <Home size={18} /> Quit
          </button>
          
          <button onClick={handleNext} disabled={!isAnswered} className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:-translate-y-0.5 ${isAnswered ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            {currentQuestionIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'} <ChevronRight size={20} />
          </button>
        </div>
      </div>

       {sources && sources.length > 0 && (
        <div className="mt-8 px-6">
            <div className="flex items-start gap-3 text-xs text-slate-500 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <Search size={16} className="mt-0.5 shrink-0 text-blue-500" />
                <div>
                    <span className="font-bold block mb-1 text-slate-700">Verified 2025 Data:</span>
                    <div className="flex flex-wrap gap-3">
                        {sources.map((source, i) => (
                            <a key={i} href={source.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium">
                                {source.display}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;