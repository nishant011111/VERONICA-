import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AIRouter } from '../../services/ai/AIRouter';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  X,
  Award,
  AlertTriangle,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';
import { PracticeQuestion, AnswerEvaluation, PracticeQuestionParams } from '../../types';

interface PracticeQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
  defaultSubjectId?: string;
}

export const PracticeQuestionsModal: React.FC<PracticeQuestionsModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = '',
  defaultSubjectId
}) => {
  const { subjects, settings, showToast } = useApp();

  // Generator Config State
  const [topic, setTopic] = useState(defaultTopic || 'Newtonian Mechanics');
  const [subjectId, setSubjectId] = useState(defaultSubjectId || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [questionType, setQuestionType] = useState<'mcq' | 'short_answer' | 'numerical' | 'conceptual' | 'long_answer'>('short_answer');

  // Interactive Quiz State
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-Question Student Responses & Evaluations
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<Record<string, AnswerEvaluation>>({});
  const [evaluatingQuestionId, setEvaluatingQuestionId] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please specify a topic or subject for the practice questions.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setQuestions([]);
    setEvaluations({});

    try {
      const selectedSubject = subjects.find(s => s.id === subjectId);
      const params: PracticeQuestionParams = {
        subjectId,
        topic: selectedSubject ? `${selectedSubject.name}: ${topic}` : topic,
        difficulty,
        count: questionCount,
        type: questionType
      };

      const result = await AIRouter.generateQuestions(params, settings.ai, {
        academicMode: 'general',
        explanationLevel: settings.ai.explanationLevel
      });

      setQuestions(result);
      if (result.length === 0) {
        setError('No questions returned. Please try again.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate practice questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateAnswer = async (q: PracticeQuestion) => {
    const answer = userAnswers[q.id]?.trim();
    if (!answer) {
      showToast('Please type your answer before checking.', 'warning');
      return;
    }

    setEvaluatingQuestionId(q.id);
    try {
      const evalResult = await AIRouter.evaluateAnswer(
        q.question,
        answer,
        q.explanation || q.correctAnswer,
        settings.ai,
        { explanationLevel: settings.ai.explanationLevel }
      );
      setEvaluations(prev => ({ ...prev, [q.id]: evalResult }));
      setShowExplanations(prev => ({ ...prev, [q.id]: true }));
    } catch (e: any) {
      showToast(e.message || 'Evaluation failed.', 'error');
    } finally {
      setEvaluatingQuestionId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <Card glass className="w-full max-w-3xl p-6 relative flex flex-col max-h-[90vh] shadow-2xl border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Practice Questions Generator
                <Badge variant="emerald">AI Assessment</Badge>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate tailored exam & revision questions with real AI scoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5 overflow-y-auto flex-1">
          {/* Controls Config Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Topic / Subject
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Thermodynamics, Calculus Integrals"
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject Context
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- General Topic --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="easy">Easy (Fundamentals)</option>
                <option value="medium">Medium (Standard Exam)</option>
                <option value="hard">Hard (Advanced Challenge)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="short_answer">Short Answer</option>
                <option value="numerical">Numerical / Quantitative</option>
                <option value="conceptual">Conceptual Proof</option>
                <option value="long_answer">Long Essay / Derivation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={1}>1 Question</option>
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleGenerate}
                disabled={isLoading}
                icon={isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              >
                {isLoading ? 'Generating...' : 'Generate Practice Set'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Questions View */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Practice Set ({questions.length} questions)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Mode: {settings.ai?.aiMode || 'automatic'}
                </span>
              </div>

              {questions.map((q, idx) => {
                const evalData = evaluations[q.id];
                const isEval = evaluatingQuestionId === q.id;

                return (
                  <Card key={q.id || idx} glass className="p-4 border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Q{idx + 1}. ({(q.type || 'QUESTION').toUpperCase()})
                      </span>
                      {evalData && (
                        <Badge variant={evalData.correctness === 'correct' ? 'emerald' : evalData.correctness === 'partially_correct' ? 'amber' : 'rose'}>
                          Score: {evalData.score}% ({evalData.correctness.replace('_', ' ')})
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                              userAnswers[q.id] === opt
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-semibold'
                                : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Answer Input area for Non-MCQ or written text */}
                    {(!q.options || q.options.length === 0) && (
                      <textarea
                        rows={2}
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Type your answer or solution steps here..."
                        className="w-full p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    )}

                    {/* Action Bar for question */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEvaluateAnswer(q)}
                        disabled={isEval}
                        icon={isEval ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5 text-emerald-500" />}
                      >
                        {isEval ? 'Evaluating...' : 'Check My Answer'}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowExplanations(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        icon={<ChevronRight className={`w-3.5 h-3.5 transition-transform ${showExplanations[q.id] ? 'rotate-90' : ''}`} />}
                      >
                        {showExplanations[q.id] ? 'Hide Solution' : 'View Solution & Explanation'}
                      </Button>
                    </div>

                    {/* Evaluation Feedback Panel */}
                    {evalData && (
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>AI Evaluation Feedback</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{evalData.summary}</p>
                        
                        {evalData.missingConcepts?.length > 0 && (
                          <div className="text-amber-600 dark:text-amber-400">
                            <strong>Missing Concepts:</strong> {evalData.missingConcepts.join(', ')}
                          </div>
                        )}
                        {evalData.suggestedImprovement && (
                          <div className="text-emerald-600 dark:text-emerald-400">
                            <strong>Suggested Improvement:</strong> {evalData.suggestedImprovement}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reference Solution / Explanation Box */}
                    {showExplanations[q.id] && (
                      <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                        <span className="font-bold block">Reference Solution & Explanation:</span>
                        <p className="leading-relaxed">{q.explanation || q.correctAnswer}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};
