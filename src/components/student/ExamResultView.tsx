import React, { useState, useEffect } from 'react';
import { ExamAttempt, Exam, PerformanceAnalysis } from '../../types';
import { api } from '../../services/api';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Printer, 
  ArrowLeft, 
  Calendar, 
  HelpCircle,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Check,
  ChevronRight,
  Mail,
  Send,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface ExamResultViewProps {
  attempt: ExamAttempt;
  exam: Exam;
  onBackToDashboard: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({ attempt, exam, onBackToDashboard }) => {
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'study_agent'>('overview');

  // Mini-quiz state for Study Agent practice
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, number>>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState<Record<number, boolean>>({});

  // Automated Mail Result Dispatch State
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailSentSuccess, setMailSentSuccess] = useState<string | null>(null);

  const handleResendReportEmail = async () => {
    setIsSendingMail(true);
    setMailSentSuccess(null);
    try {
      const res = await api.dispatchResultReport(attempt.id);
      setMailSentSuccess(`Automated result report dispatched to ${attempt.studentEmail}! (Log #${res.mailLog.id})`);
      setTimeout(() => setMailSentSuccess(null), 6000);
    } catch (err: any) {
      alert('Failed to send automated report: ' + err.message);
    } finally {
      setIsSendingMail(false);
    }
  };

  useEffect(() => {
    // Automatically trigger Personal Performance Agent upon viewing result
    const runPerformanceAgent = async () => {
      setIsLoadingAgent(true);
      try {
        const analysis = await api.agentAnalyzePerformance({
          studentName: attempt.studentName,
          examTitle: attempt.examTitle,
          marks: attempt.totalMarksScored,
          totalMarks: attempt.maxMarks,
          answers: attempt.answers,
          questions: exam.questions
        });
        setPerformanceAnalysis(analysis);
      } catch (err) {
        console.error('Agent analysis error:', err);
      } finally {
        setIsLoadingAgent(false);
      }
    };

    runPerformanceAgent();
  }, [attempt, exam]);

  const handlePrint = () => {
    window.print();
  };

  const handlePracticeOptionSelect = (qIdx: number, optIdx: number) => {
    if (practiceSubmitted[qIdx]) return;
    setPracticeAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCheckPractice = (qIdx: number) => {
    setPracticeSubmitted(prev => ({ ...prev, [qIdx]: true }));
  };

  const passed = attempt.passed;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-body">
      {/* Back and Print Bar */}
      <div className="flex items-center justify-between no-print gap-3 flex-wrap">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-headline font-bold text-slate-600 hover:text-fuchsia-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResendReportEmail}
            disabled={isSendingMail}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-fuchsia-200 bg-fuchsia-50 hover:bg-fuchsia-100 text-xs font-headline font-bold text-fuchsia-700 shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Dispatch official result report email to student mailbox"
          >
            <Mail className="w-3.5 h-3.5 text-fuchsia-600" />
            <span>{isSendingMail ? 'Sending Automated Mail...' : 'Email Result Report'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-headline font-bold text-slate-700 shadow-xs transition-all hover:scale-105"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Official Result</span>
          </button>
        </div>
      </div>

      {/* Automated Mail Sent Banner */}
      {mailSentSuccess && (
        <div className="p-4 rounded-2xl bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-fuchsia-600 shrink-0" />
          <span>{mailSentSuccess}</span>
        </div>
      )}

      {/* 3-Strike Violation Termination Banner */}
      {attempt.isTerminatedForViolation && (
        <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-400 text-rose-950 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-headline font-black text-rose-900 tracking-wide uppercase">
                  Exam Terminated: 3-Strike Academic Integrity Rule
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-200 text-rose-900 border border-rose-300">
                  {attempt.strikeCount || 3} Strikes Recorded
                </span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed font-body">
                {attempt.terminationReason || 'This candidate examination was automatically terminated and disqualified after exceeding the permitted limit of 3 window focus/tab switch strikes.'}
              </p>
              <div className="text-[11px] text-rose-700/90 font-mono mt-1">
                Automated Incident Audit Token logged · Candidate disqualified (0 Marks) · Integrity Report sent to Academic Council.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Score Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs card-shopvibe">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-headline font-bold text-fuchsia-600 mb-1">
              <span className="badge-pill-cyan text-[10px] px-2.5 py-0.5 font-mono">{exam.courseCode}</span>
              <span className="text-slate-300">·</span>
              <span className="uppercase tracking-wider">{exam.department}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-black text-slate-900">
              {attempt.examTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-body">
              Candidate: <strong className="text-slate-800">{attempt.studentName}</strong> ({attempt.studentEmail}) · Submitted: <span className="font-mono">{new Date(attempt.submittedAt).toLocaleDateString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-5 py-3 rounded-2xl text-center border shadow-xs ${
              passed
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              <div className="text-[10px] font-headline font-extrabold tracking-wider uppercase">
                {passed ? 'QUALIFIED / PASS' : 'NEEDS REVISION'}
              </div>
              <div className="text-3xl font-black font-code mt-0.5">
                {attempt.percentage}%
              </div>
            </div>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block">Total Score</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-code">
              {attempt.totalMarksScored} <span className="text-xs text-slate-400 font-normal font-body">/ {attempt.maxMarks}</span>
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block">Time Taken</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-code">
              {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block">Pass Threshold</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-code">
              {exam.passingMarks} <span className="text-xs text-slate-400 font-normal font-body">marks</span>
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block">Integrity Risk</span>
            <span className={`text-xl sm:text-2xl font-black font-code ${
              attempt.monitoringRiskLevel === 'High' ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {attempt.monitoringRiskLevel || 'Low'}
            </span>
          </div>
        </div>
      </div>

      {/* AGENT 1 & 2: PERSONAL PERFORMANCE AGENT & PERSONALIZED STUDY AGENT BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-fuchsia-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-fuchsia-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-fuchsia-300 text-xs font-headline font-bold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <span>Agentic AI Student Layer · Personal Performance & Study Agent</span>
          </div>

          {isLoadingAgent ? (
            <div className="py-6 flex items-center gap-3 text-indigo-200 text-sm">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
              <span>Analyzing historical marks, answer timing, and topic variances...</span>
            </div>
          ) : performanceAnalysis ? (
            <>
              {/* Insight Quote Callout */}
              <div className="bg-white/10 rounded-xl p-4 sm:p-5 border border-white/15 backdrop-blur-sm">
                <div className="text-xs font-semibold text-indigo-200 mb-1">
                  AI Performance Agent Diagnostic:
                </div>
                <blockquote className="text-sm sm:text-base font-medium text-slate-100 italic leading-relaxed">
                  "{performanceAnalysis.agentSummary}"
                </blockquote>
                <div className="text-[11px] text-indigo-300 mt-2">
                  {performanceAnalysis.timeManagementInsight}
                </div>
              </div>

              {/* Weak and Strong Topics Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Focus Areas Identified:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {performanceAnalysis.weakTopics.map((t, idx) => (
                      <span key={idx} className="bg-rose-500/20 text-rose-200 px-2 py-0.5 rounded text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mastered Topics:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {performanceAnalysis.strongTopics.map((t, idx) => (
                      <span key={idx} className="bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* ShopVibe Pill Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 no-print overflow-x-auto text-xs font-headline font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'overview'
              ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Subject Breakdown
        </button>

        <button
          onClick={() => setActiveTab('study_agent')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
            activeTab === 'study_agent'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm shadow-cyan-500/30'
              : 'bg-cyan-50 text-cyan-900 hover:bg-cyan-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personalized Study Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'questions'
              ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Question Review ({exam.questions.length})
        </button>
      </div>

      {/* Tab 1: Subject / Topic Breakdown */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900">
            Topic & Concept Mastery Breakdown
          </h3>

          <div className="space-y-4">
            {attempt.topicBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.topic}</span>
                  <span className="font-mono text-slate-600">
                    {item.correctQuestions} / {item.totalQuestions} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.percentage >= 70
                        ? 'bg-emerald-500'
                        : item.percentage >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Personalized Study Agent Plan */}
      {activeTab === 'study_agent' && performanceAnalysis && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Targeted Revision Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Tailored by the Personalized Study Agent based on your performance in this assessment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceAnalysis.studyPlan.map((plan, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                      {plan.day}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {plan.focus}
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                    {plan.tasks.map((task, tidx) => (
                      <li key={tidx}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Questions from Agent */}
          {performanceAnalysis.practiceQuestions && performanceAnalysis.practiceQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Difficulty-Adjusted Quick Practice
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Reinforce your identified weak areas with these immediate practice exercises generated by the agent:
              </p>

              <div className="space-y-6">
                {performanceAnalysis.practiceQuestions.map((pq, qIdx) => {
                  const selectedOpt = practiceAnswers[qIdx];
                  const isSubmitted = practiceSubmitted[qIdx];
                  const isCorrect = selectedOpt === pq.correctOptionIndex;

                  return (
                    <div key={qIdx} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                      <div className="text-sm font-semibold text-slate-900">
                        Practice #{qIdx + 1}: {pq.questionText}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pq.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let optStyle = 'border-slate-200 bg-white hover:border-indigo-300';

                          if (isSubmitted) {
                            if (optIdx === pq.correctOptionIndex) {
                              optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                            } else if (isOptionSelected) {
                              optStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                            }
                          } else if (isOptionSelected) {
                            optStyle = 'border-indigo-600 bg-indigo-50 font-medium text-indigo-900';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handlePracticeOptionSelect(qIdx, optIdx)}
                              className={`p-3 rounded-lg text-left text-xs border transition-all ${optStyle}`}
                            >
                              <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {!isSubmitted ? (
                        <button
                          onClick={() => handleCheckPractice(qIdx)}
                          disabled={selectedOpt === undefined}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Check Answer
                        </button>
                      ) : (
                        <div className={`p-3 rounded-lg text-xs ${isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                          <div className="font-bold mb-1">
                            {isCorrect ? '✓ Correct Answer!' : '✗ Incorrect choice.'}
                          </div>
                          <p>{pq.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Question-by-Question Review */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {exam.questions.map((q, idx) => {
            const ans = attempt.answers.find(a => a.questionId === q.id);
            const isCorrect = ans?.isCorrect;
            const marksAwarded = ans?.marksAwarded || 0;

            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-700">{q.topic}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 capitalize">{q.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">
                      Time: {ans?.timeSpentSeconds || 0}s
                    </span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {marksAwarded} / {q.marks} Marks
                    </span>
                  </div>
                </div>

                <div className="text-sm font-medium text-slate-900 leading-relaxed">
                  {q.questionText}
                </div>

                {q.type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isStudentChoice = ans?.selectedOptionIndex === optIdx;
                      const isCorrectChoice = q.correctOptionIndex === optIdx;

                      let style = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isCorrectChoice) {
                        style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                      } else if (isStudentChoice && !isCorrect) {
                        style = 'bg-rose-50 border-rose-300 text-rose-800';
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-lg border ${style} flex items-center justify-between`}>
                          <span>
                            <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                          </span>
                          {isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                          {isStudentChoice && !isCorrectChoice && <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === 'descriptive' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Your Submission:</div>
                      <p className="text-slate-800 leading-relaxed">{ans?.descriptiveAnswer || '(No response provided)'}</p>
                    </div>
                    {q.modelAnswer && (
                      <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200">
                        <div className="text-[11px] font-bold text-indigo-700 uppercase mb-1">Model Solution:</div>
                        <p className="text-indigo-950 leading-relaxed">{q.modelAnswer}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation */}
                <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700 border border-slate-200/80">
                  <span className="font-bold text-slate-800">Pedagogical Explanation: </span>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
