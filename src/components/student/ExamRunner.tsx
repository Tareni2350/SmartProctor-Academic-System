import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Exam, Question, StudentAnswer, MonitoringEvent, ExamAttempt } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  ShieldCheck, 
  EyeOff, 
  Info, 
  Sparkles, 
  HelpCircle, 
  FileCheck,
  ShieldAlert,
  Ban,
  AlertOctagon,
  XCircle
} from 'lucide-react';
import { ExamAssistantModal } from './ExamAssistantModal';

interface ExamRunnerProps {
  exam: Exam;
  onExamFinished: (attempt: ExamAttempt) => void;
  onExit: () => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({ exam, onExamFinished, onExit }) => {
  const { currentUser } = useAuth();
  
  // Timer state
  const totalSeconds = exam.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);

  // Active Question
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion: Question = exam.questions[currentIndex] || exam.questions[0];

  // Answers State: questionId -> StudentAnswer
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>(() => {
    const init: Record<string, StudentAnswer> = {};
    exam.questions.forEach(q => {
      init[q.id] = {
        questionId: q.id,
        selectedOptionIndex: undefined,
        descriptiveAnswer: '',
        marksAwarded: 0,
        timeSpentSeconds: 0,
        markedForReview: false
      };
    });
    return init;
  });

  // Visited Tracker
  const [visitedMap, setVisitedMap] = useState<Record<string, boolean>>({
    [exam.questions[0]?.id || '']: true
  });

  // Real-time Proctoring Monitoring Telemetry & 3-STRIKE TERMINATION RULE
  const [monitoringLog, setMonitoringLog] = useState<MonitoringEvent[]>([]);
  const [latestWarning, setLatestWarning] = useState<string | null>(null);
  const [strikeCount, setStrikeCount] = useState<number>(0);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);
  const [showStrikeModal, setShowStrikeModal] = useState<boolean>(false);
  const [currentStrikeNotice, setCurrentStrikeNotice] = useState<string>('');

  // Timing tracking per question
  const questionStartTimeRef = useRef<number>(Date.now());
  const handleImmediateTerminationRef = useRef<((finalStrikes: number, reason: string) => Promise<void>) | null>(null);

  // Trigger violation strike
  const recordViolationStrike = useCallback((reason: string) => {
    setStrikeCount(prev => {
      const nextStrikes = prev + 1;
      const strikeMsg = nextStrikes >= 3 
        ? `STRIKE 3/3 REACHED: Maximum permitted academic integrity violations exceeded. Examination session is permanently terminated.`
        : `STRIKE ${nextStrikes}/3 WARNING: ${reason}. (Exceeding 3 strikes will automatically terminate your exam session).`;

      setLatestWarning(strikeMsg);
      setCurrentStrikeNotice(strikeMsg);
      setShowStrikeModal(true);

      const evt: MonitoringEvent = {
        timestamp: new Date().toISOString(),
        type: 'tab_switch',
        details: `Strike #${nextStrikes}: ${reason}`
      };
      setMonitoringLog(log => [...log, evt]);

      if (nextStrikes >= 3) {
        setIsTerminated(true);
        // Automatic immediate termination submit
        setTimeout(() => {
          if (handleImmediateTerminationRef.current) {
            handleImmediateTerminationRef.current(nextStrikes, reason);
          }
        }, 2500);
      } else {
        setTimeout(() => setLatestWarning(null), 8000);
      }

      return nextStrikes;
    });
  }, []);

  // Log monitoring event
  const logMonitoringEvent = useCallback((type: MonitoringEvent['type'], details: string) => {
    const evt: MonitoringEvent = {
      timestamp: new Date().toISOString(),
      type,
      details
    };
    setMonitoringLog(prev => [...prev, evt]);
    if (type === 'tab_switch' || type === 'window_blur') {
      recordViolationStrike(details);
    }
  }, [recordViolationStrike]);

  // Listen to Window Blur and Visibility Change
  useEffect(() => {
    if (isTerminated || isSubmitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logMonitoringEvent('tab_switch', 'Window visibility lost / Candidate switched browser tab or minimized window');
      } else {
        logMonitoringEvent('session_reconnect', 'Candidate returned focus to examination window');
      }
    };

    const handleBlur = () => {
      logMonitoringEvent('window_blur', 'Window focus lost (potential split screen or secondary display detected)');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [logMonitoringEvent, isTerminated, isSubmitting]);

  // Immediate termination handler
  const handleImmediateTermination = async (finalStrikes: number, reason: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    recordQuestionTime();

    try {
      const timeSpentTotal = totalSeconds - secondsRemaining;
      const formattedAnswers = Object.values(answers);

      const attempt = await api.submitExam(exam.id, {
        studentId: currentUser?.id || 'stud-101',
        studentName: currentUser?.name || 'Student Candidate',
        studentEmail: currentUser?.email || 'student@university.edu',
        answers: formattedAnswers,
        timeSpentSeconds: Math.max(30, timeSpentTotal),
        monitoringLog,
        isTerminatedForViolation: true,
        strikeCount: finalStrikes,
        terminationReason: `3-Strike Integrity Rule Triggered: ${reason}`
      });

      onExamFinished(attempt);
    } catch (err: any) {
      console.error('Termination submission failed:', err);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    handleImmediateTerminationRef.current = handleImmediateTermination;
  });

  // Mark current question for review and advance to next question
  const handleMarkAndNext = () => {
    recordQuestionTime();
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        markedForReview: !prev[currentQuestion.id]?.markedForReview
      }
    }));
    if (currentIndex < exam.questions.length - 1) {
      handleSelectQuestion(currentIndex + 1);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleFinalSubmit('time_expired');
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  // Update question time spent when changing question
  const recordQuestionTime = () => {
    const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          timeSpentSeconds: (prev[currentQuestion.id]?.timeSpentSeconds || 0) + elapsed
        }
      }));
    }
    questionStartTimeRef.current = Date.now();
  };

  const handleSelectQuestion = (index: number) => {
    recordQuestionTime();
    setCurrentIndex(index);
    const targetQ = exam.questions[index];
    if (targetQ) {
      setVisitedMap(prev => ({ ...prev, [targetQ.id]: true }));
    }
  };

  // Option select for MCQ
  const handleSelectOption = (optionIndex: number) => {
    const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    // Rapid answer detection (under 3 seconds on a question)
    if (elapsed < 3) {
      logMonitoringEvent('rapid_answer', `Rapid answer recorded on question #${currentIndex + 1} (${elapsed}s elapsed)`);
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptionIndex: optionIndex
      }
    }));
  };

  // Descriptive text change
  const handleDescriptiveChange = (text: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        descriptiveAnswer: text
      }
    }));
  };

  // Toggle Mark for Review
  const handleToggleMarkForReview = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        markedForReview: !prev[currentQuestion.id]?.markedForReview
      }
    }));
  };

  // Clear current response
  const handleClearResponse = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptionIndex: undefined,
        descriptiveAnswer: ''
      }
    }));
  };

  // Final submit handler
  const handleFinalSubmit = async (reason?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    recordQuestionTime();

    try {
      const timeSpentTotal = totalSeconds - secondsRemaining;
      const formattedAnswers = Object.values(answers);

      const attempt = await api.submitExam(exam.id, {
        studentId: currentUser?.id || 'stud-101',
        studentName: currentUser?.name || 'Student Candidate',
        studentEmail: currentUser?.email || 'student@university.edu',
        answers: formattedAnswers,
        timeSpentSeconds: Math.max(30, timeSpentTotal),
        monitoringLog
      });

      onExamFinished(attempt);
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert('Submission error. Please retry.');
      setIsSubmitting(false);
    }
  };

  // Comprehensive Stats for palette and indicators
  // 1. Attempted (Answered and not marked for review)
  // 2. Not Attempted (Visited or current, but no answer chosen and not marked)
  // 3. Marked for Review without Answering
  // 4. Marked for Review with Answering
  // 5. Not Visited
  const attemptedCount = Object.values(answers).filter(
    a => !a.markedForReview && (a.selectedOptionIndex !== undefined || (a.descriptiveAnswer && a.descriptiveAnswer.trim().length > 0))
  ).length;

  const markedWithAnswerCount = Object.values(answers).filter(
    a => a.markedForReview && (a.selectedOptionIndex !== undefined || (a.descriptiveAnswer && a.descriptiveAnswer.trim().length > 0))
  ).length;

  const markedWithoutAnswerCount = Object.values(answers).filter(
    a => a.markedForReview && a.selectedOptionIndex === undefined && (!a.descriptiveAnswer || a.descriptiveAnswer.trim().length === 0)
  ).length;

  const notVisitedCount = exam.questions.filter(q => !visitedMap[q.id]).length;

  const notAttemptedCount = exam.questions.filter(q => {
    const ans = answers[q.id];
    const hasAnswer = ans?.selectedOptionIndex !== undefined || (ans?.descriptiveAnswer && ans.descriptiveAnswer.trim().length > 0);
    return visitedMap[q.id] && !hasAnswer && !ans?.markedForReview;
  }).length;

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const isTimerCritical = secondsRemaining <= 120; // under 2 mins

  const currentAnswer = answers[currentQuestion.id] || {
    questionId: currentQuestion.id,
    marksAwarded: 0,
    timeSpentSeconds: 0
  };

  const isCurrentAnswered =
    currentAnswer.selectedOptionIndex !== undefined ||
    (currentAnswer.descriptiveAnswer && currentAnswer.descriptiveAnswer.trim().length > 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col select-none font-body">
      {/* Top Test Banner Bar */}
      <header className="bg-slate-950 text-white border-b border-fuchsia-900/30 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-cyan-400 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-headline font-black text-white tracking-wide truncate max-w-xs sm:max-w-md">
                  {exam.courseCode}: {exam.title}
                </h1>
                <span className="badge-pill-cyan text-[10px] px-2.5 py-0.5 font-mono">
                  LIVE EXAM
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-body">
                Candidate: <strong className="text-slate-200">{currentUser?.name || 'Student Candidate'}</strong> · ID: {currentUser?.identifier || 'STU-2026'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 3-Strike Integrity Indicator in Header */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-headline font-bold border transition-all ${
              strikeCount === 0
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                : strikeCount === 1
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 animate-pulse'
                : strikeCount === 2
                ? 'bg-orange-950/90 border-orange-600 text-orange-300 animate-bounce'
                : 'bg-rose-950 border-rose-600 text-rose-300'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>STRIKES: {strikeCount} / 3</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(s => (
                  <span
                    key={s}
                    className={`w-2 h-2 rounded-full ${
                      s <= strikeCount ? 'bg-rose-500 ring-1 ring-white' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => recordViolationStrike('Simulated window blur or tab defocus')}
                className="ml-1 text-[10px] text-slate-400 hover:text-white underline font-mono cursor-pointer"
                title="Test 3-Strike Violation Termination Rule"
              >
                Test Strike
              </button>
            </div>

            {/* AI Assistant Help */}
            <button
              onClick={() => setShowAssistantModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-xs text-cyan-300 font-headline font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exam Tutor</span>
            </button>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-code font-bold text-sm tracking-wider shadow-inner ${
                isTimerCritical
                  ? 'bg-rose-950/90 text-rose-300 border border-rose-600 animate-pulse'
                  : 'bg-slate-900 text-yellow-300 border border-yellow-500/30'
              }`}
            >
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={isSubmitting || isTerminated}
              className="btn-shopvibe-primary px-5 py-2 text-xs font-headline font-bold tracking-wide transition-all shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>Submit Test</span>
            </button>
          </div>
        </div>

        {/* Warning Toast if focus is lost */}
        {latestWarning && (
          <div className="bg-rose-600/90 text-white text-xs px-4 py-2.5 flex items-center justify-center gap-2 text-center animate-in slide-in-from-top-1 duration-200 shadow-md">
            <AlertOctagon className="w-4 h-4 text-yellow-300 shrink-0" />
            <span className="font-headline font-bold">{latestWarning}</span>
          </div>
        )}
      </header>

      {/* Main Examination Viewport */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Area */}
        <main className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Question Sub-header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Question {currentIndex + 1} of {exam.questions.length}</span>
              <span className="text-slate-300">·</span>
              <span className="capitalize">{currentQuestion.difficulty}</span>
              <span className="text-slate-300">·</span>
              <span>{currentQuestion.marks} Marks</span>
              <span className="text-slate-300">·</span>
              <span className="text-indigo-600 font-semibold">{currentQuestion.topic}</span>
            </div>

            <button
              onClick={handleToggleMarkForReview}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                currentAnswer.markedForReview
                  ? 'bg-amber-100 text-amber-800 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{currentAnswer.markedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>
          </div>

          {/* Question Body */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed mb-6">
              {currentQuestion.questionText}
            </h2>

            {/* MCQ Options */}
            {currentQuestion.type === 'mcq' && currentQuestion.options && (
              <div className="space-y-3 font-body">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = currentAnswer.selectedOptionIndex === optIdx;
                  const label = String.fromCharCode(65 + optIdx); // A, B, C, D
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-fuchsia-500 bg-fuchsia-50/70 ring-2 ring-fuchsia-500/25 text-fuchsia-950 font-semibold shadow-xs'
                          : 'border-slate-200/90 hover:border-fuchsia-200 hover:bg-slate-50/80 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-headline font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-fuchsia-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {label}
                      </div>
                      <span className="text-sm pt-1 leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Descriptive Answer Textarea */}
            {currentQuestion.type === 'descriptive' && (
              <div className="space-y-3 font-body">
                <label className="block text-xs font-headline font-bold text-slate-700 uppercase tracking-wider">
                  Type your detailed academic response:
                </label>
                <textarea
                  rows={8}
                  value={currentAnswer.descriptiveAnswer || ''}
                  onChange={(e) => handleDescriptiveChange(e.target.value)}
                  placeholder="Provide structured technical explanation, algorithm proofs, or system reasoning..."
                  className="w-full p-4 text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 text-slate-900 font-body transition-all"
                />
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Formatting: Plain text with technical terms</span>
                  <span className="font-code font-bold">Words: {(currentAnswer.descriptiveAnswer || '').trim().split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Question Footer Navigation Controls */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={handleClearResponse}
              disabled={!isCurrentAnswered}
              className="text-xs font-headline font-bold text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors cursor-pointer"
            >
              Clear Choice
            </button>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => handleSelectQuestion(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 text-xs font-headline font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleMarkAndNext}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-headline font-bold transition-all cursor-pointer ${
                  currentAnswer.markedForReview
                    ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                    : 'border-purple-200 bg-white text-purple-700 hover:bg-purple-50'
                }`}
                title="Mark this question for later review and advance to next question"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-600" />
                <span>{currentAnswer.markedForReview ? 'Unmark & Next' : 'Mark for Review & Next'}</span>
              </button>

              {currentIndex < exam.questions.length - 1 ? (
                <button
                  onClick={() => handleSelectQuestion(currentIndex + 1)}
                  className="btn-shopvibe-primary flex items-center gap-1.5 px-5 py-2 text-xs font-headline font-bold shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="btn-shopvibe-secondary flex items-center gap-1.5 px-5 py-2 text-xs font-headline font-bold shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Review & Finish</span>
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Right Column: Question Palette & Proctoring Status */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Question Matrix Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs card-shopvibe">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-headline font-black text-slate-900 tracking-wider uppercase">
                Question Palette ({exam.questions.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Live Status</span>
            </div>

            {/* Status Legend with all 5 distinct states requested */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pb-3 mb-4 border-b border-slate-100 font-body">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-xs" />
                <span>Attempted ({attemptedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs" />
                <span>Not Attempted ({notAttemptedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative inline-flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-purple-700 inline-block shadow-xs" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span>Marked (Answered) ({markedWithAnswerCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-600 inline-block shadow-xs" />
                <span>Marked (Unanswered) ({markedWithoutAnswerCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300 inline-block" />
                <span>Not Visited ({notVisitedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full ring-2 ring-fuchsia-500 bg-white inline-block" />
                <span>Current</span>
              </div>
            </div>

            {/* Question Number Buttons Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
              {exam.questions.map((q, idx) => {
                const ans = answers[q.id];
                const hasAnswer =
                  ans?.selectedOptionIndex !== undefined ||
                  (ans?.descriptiveAnswer && ans.descriptiveAnswer.trim().length > 0);
                const isMarked = !!ans?.markedForReview;
                const isVisited = !!visitedMap[q.id];
                const isCurrent = idx === currentIndex;

                let btnBg = 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
                let indicatorDot = null;
                let stateLabel = 'Not Visited';

                if (isMarked && hasAnswer) {
                  // Marked for Review WITH Answer
                  btnBg = 'bg-purple-700 text-white border-purple-800 font-bold';
                  stateLabel = 'Marked for Review (With Answer)';
                  indicatorDot = (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-1 ring-white" title="Answered & Marked for Review" />
                  );
                } else if (isMarked && !hasAnswer) {
                  // Marked for Review WITHOUT Answer
                  btnBg = 'bg-purple-600 text-white border-purple-700 font-bold';
                  stateLabel = 'Marked for Review (Without Answer)';
                  indicatorDot = (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 ring-1 ring-white" title="Marked for Review (Unanswered)" />
                  );
                } else if (hasAnswer) {
                  // Attempted
                  btnBg = 'bg-emerald-600 text-white border-emerald-700 font-bold';
                  stateLabel = 'Attempted';
                } else if (isVisited) {
                  // Not Attempted (visited, left blank)
                  btnBg = 'bg-amber-500 text-white border-amber-600 font-bold';
                  stateLabel = 'Not Attempted';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(idx)}
                    title={`Question ${idx + 1}: ${stateLabel}`}
                    className={`h-9 rounded-xl text-xs font-code border transition-all flex items-center justify-center relative cursor-pointer ${btnBg} ${
                      isCurrent ? 'ring-2 ring-offset-2 ring-fuchsia-500 scale-105 font-black z-10' : ''
                    }`}
                  >
                    {idx + 1}
                    {indicatorDot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Proctoring / Monitoring Telemetry Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">
                AI Monitoring Agent
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Permitted session signals are recorded to prevent academic integrity discrepancies:
            </p>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-mono">
              <div className="flex justify-between items-center">
                <span>Tab Focus Retention:</span>
                <span className="font-semibold text-emerald-700">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Window Blur Count:</span>
                <span className="font-semibold text-slate-800">
                  {monitoringLog.filter(e => e.type === 'window_blur' || e.type === 'tab_switch').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rapid Answering Flags:</span>
                <span className="font-semibold text-slate-800">
                  {monitoringLog.filter(e => e.type === 'rapid_answer').length}
                </span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-400">
              * Flags generate a review summary for faculty rather than automated disqualification.
            </div>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Ready to submit your examination?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please review your summary before finalizing. Once submitted, answers cannot be modified.
            </p>

            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs text-slate-700 mb-6 border border-slate-200/70">
              <div className="flex justify-between font-medium">
                <span>Total Questions:</span>
                <span className="font-bold">{exam.questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Attempted (Answered):</span>
                <span className="font-bold">{attemptedCount}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Not Attempted (Blank):</span>
                <span className="font-bold">{notAttemptedCount}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span>Marked for Review (With Answer):</span>
                <span className="font-bold">{markedWithAnswerCount}</span>
              </div>
              <div className="flex justify-between text-purple-600">
                <span>Marked for Review (Without Answer):</span>
                <span className="font-bold">{markedWithoutAnswerCount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Not Visited:</span>
                <span className="font-bold">{notVisitedCount}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1.5 border-t border-slate-200">
                <span>Time Remaining:</span>
                <span className="font-mono font-bold">{formatTime(secondsRemaining)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Back to Exam
              </button>
              <button
                onClick={() => handleFinalSubmit('user_action')}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm cursor-pointer"
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strike Warning & 3-Strike Auto-Termination Modal */}
      {showStrikeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 ${
            strikeCount >= 3 ? 'border-rose-500' : 'border-amber-500'
          }`}>
            <div className="flex items-center gap-3.5 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                strikeCount >= 3 ? 'bg-rose-600' : 'bg-amber-500'
              }`}>
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase text-white ${
                    strikeCount >= 3 ? 'bg-rose-600' : 'bg-amber-600'
                  }`}>
                    {strikeCount >= 3 ? 'SESSION TERMINATED' : `STRIKE ${strikeCount} OF 3`}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">3-STRIKE INTEGRITY RULE</span>
                </div>
                <h2 className="text-lg font-headline font-black text-slate-900 mt-0.5">
                  {strikeCount >= 3 ? '3-Strike Rule Triggered: Exam Terminated' : 'Academic Integrity Warning'}
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mb-6">
              <p className="text-xs text-slate-700 font-medium leading-relaxed font-body">
                {currentStrikeNotice || latestWarning || (
                  strikeCount >= 3
                    ? 'Candidate reached 3 strikes for window defocus / tab switching. Under institutional proctoring regulations, your examination has been automatically terminated and submitted with 0 marks.'
                    : 'Switching browser tabs, minimizing the exam window, or clicking outside the test viewport is prohibited. Please stay focused on the test interface.'
                )}
              </p>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-mono">
                <span>Integrity Strikes Recorded:</span>
                <strong className={`font-bold ${strikeCount >= 3 ? 'text-rose-600' : 'text-amber-600'}`}>
                  {strikeCount} / 3 Strikes
                </strong>
              </div>
            </div>

            {strikeCount >= 3 ? (
              <div className="space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-rose-600 text-xs font-bold font-mono">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
                  <span>Auto-disqualifying session & logging incident audit report...</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 font-body">
                  Reaching 3 strikes triggers immediate automatic termination.
                </span>
                <button
                  onClick={() => setShowStrikeModal(false)}
                  className="btn-shopvibe-primary px-6 py-2.5 text-xs font-headline font-bold shadow-md cursor-pointer hover:scale-105 active:scale-95"
                >
                  I Understand & Return to Exam
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assistant Modal */}
      <ExamAssistantModal
        exam={exam}
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
        isLiveExam={true}
      />
    </div>
  );
};
