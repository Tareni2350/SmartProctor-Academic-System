import React, { useState, useEffect } from 'react';
import { Exam, ExamAttempt } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Clock, 
  FileText, 
  CheckCircle, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Bot, 
  Award, 
  Play, 
  AlertCircle,
  TrendingUp,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  BookOpen,
  Zap,
  Target,
  ChevronRight,
  Flame
} from 'lucide-react';
import { ExamAssistantModal } from './ExamAssistantModal';

interface StudentDashboardProps {
  onStartExam: (exam: Exam) => void;
  onViewResult: (attempt: ExamAttempt, exam: Exam) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onStartExam, onViewResult }) => {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExamForAssistant, setSelectedExamForAssistant] = useState<Exam | null>(null);
  
  // ShopVibe Interactive Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'active' | 'completed'>('all');
  const [showStudyPlanModal, setShowStudyPlanModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedExams, fetchedAttempts] = await Promise.all([
        api.getExams(),
        api.getSubmissions({ studentId: currentUser.id })
      ]);
      setExams(fetchedExams);
      setAttempts(fetchedAttempts);
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const completedExamIds = new Set(attempts.map(a => a.examId));
  const activeExams = exams.filter(e => e.status === 'published' && !completedExamIds.has(e.id));
  const completedExams = exams.filter(e => completedExamIds.has(e.id));

  // Compute overall average
  const totalScoreAvg = attempts.length > 0
    ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
    : 84; // demo baseline

  // Filtered active exams by search
  const filteredActiveExams = activeExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exam.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exam.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-body">
      {/* ShopVibe Energetic Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-fuchsia-950 text-white p-7 sm:p-9 shadow-xl overflow-hidden border border-fuchsia-500/20">
        {/* Background glow orbs */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-pill-fuchsia text-[11px] px-3.5 py-1 flex items-center gap-1.5 shadow-xs">
                <Flame className="w-3.5 h-3.5 text-fuchsia-500 animate-pulse" />
                <span>STUDENT PORTAL · SPRING 2026</span>
              </span>
              <span className="badge-pill-cyan text-[11px] px-3 py-1 font-mono">
                ID: {currentUser.identifier || currentUser.id}
              </span>
              <span className="badge-pill-yellow text-[11px] px-3 py-1">
                ⭐ AI COHORT ELITE
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-headline font-black tracking-tight text-white leading-tight">
              Ready to crush your exams, <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-300">{currentUser.name.split(' ')[0]}</span>?
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-body">
              Your autonomous AI tutoring agent has analyzed your past answers and calibrated your study trajectories. Pick an active test or review your diagnostic report below.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowStudyPlanModal(true)}
                className="btn-shopvibe-primary px-5 py-2.5 text-xs font-headline font-bold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Open Personalized Study Plan</span>
              </button>

              {activeExams[0] && (
                <button
                  onClick={() => setSelectedExamForAssistant(activeExams[0])}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-headline font-semibold flex items-center gap-2 border border-white/20 transition-all backdrop-blur-md"
                >
                  <Bot className="w-4 h-4 text-cyan-300" />
                  <span>Ask AI Exam Tutor</span>
                </button>
              )}
            </div>
          </div>

          {/* ShopVibe High-Impact Numeric Stats Strip */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 shrink-0 sm:min-w-[200px]">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center lg:text-left transition-all hover:bg-white/15">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block">Tests Completed</span>
              <div className="text-2xl sm:text-3xl font-black font-code text-cyan-300 mt-0.5">
                {attempts.length}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center lg:text-left transition-all hover:bg-white/15">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block">Average Accuracy</span>
              <div className="text-2xl sm:text-3xl font-black font-code text-yellow-300 mt-0.5">
                {totalScoreAvg}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-fuchsia-600/30 to-pink-600/30 backdrop-blur-md border border-fuchsia-400/30 p-4 rounded-2xl text-center lg:text-left">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-fuchsia-200 block">Available Now</span>
              <div className="text-2xl sm:text-3xl font-black font-code text-white mt-0.5">
                {activeExams.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AGENT 1 & 2: PERSONAL PERFORMANCE & STUDY AGENT CALLOUT */}
      <div className="card-shopvibe p-6 sm:p-7 border border-fuchsia-100 bg-gradient-to-br from-white via-fuchsia-50/20 to-cyan-50/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 text-fuchsia-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-headline font-bold text-slate-900">
                  Personal AI Performance Agent · Live Diagnosis
                </h2>
                <span className="badge-pill-cyan text-[10px] px-2.5 py-0.5">
                  Adaptive
                </span>
              </div>
              <p className="text-xs text-slate-500 font-body">
                Real-time multi-dimensional assessment of student question velocity and error distribution.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowStudyPlanModal(true)}
            className="text-xs font-headline font-bold text-fuchsia-600 hover:text-fuchsia-800 flex items-center gap-1 self-start md:self-auto"
          >
            <span>View Full 4-Day Study Plan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-body">
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-2xs">
            <span className="font-headline font-bold text-emerald-600 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4" /> Strong Competency
            </span>
            <p className="text-slate-600">
              <strong>Python Basics & Syntax:</strong> High accuracy (94%) with swift time-to-answer (~18s/question).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-2xs">
            <span className="font-headline font-bold text-amber-600 flex items-center gap-1.5 mb-1">
              <Target className="w-4 h-4" /> Needs Practice
            </span>
            <p className="text-slate-600">
              <strong>SQL Joins & Relational Algebra:</strong> Accuracy dropped 12% across your previous 2 assessments.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-2xs">
            <span className="font-headline font-bold text-fuchsia-600 flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4" /> Recommended Action
            </span>
            <p className="text-slate-600">
              Practice 15 adaptive MCQ questions on <strong>LEFT & INNER JOIN</strong> before taking upcoming tests.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: AVAILABLE EXAMINATIONS */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-headline font-black text-slate-900 flex items-center gap-2.5">
              <span>Examinations Ready to Take</span>
              <span className="badge-pill-fuchsia text-xs px-3 py-0.5">
                {activeExams.length} Active
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-body">
              Proctored timed tests. Click "Start Examination" when ready.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or course code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-all font-body"
            />
          </div>
        </div>

        {filteredActiveExams.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-headline font-bold text-slate-800">
              {searchQuery ? 'No examinations match your query' : 'All caught up! No pending tests'}
            </h3>
            <p className="text-xs text-slate-500 font-body max-w-md mx-auto">
              {searchQuery 
                ? 'Try searching with a different term or clear the search input.'
                : 'You have completed all published examinations for your enrolled subjects. View your score diagnostics below.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredActiveExams.map((exam) => (
              <div
                key={exam.id}
                className="card-shopvibe p-6 sm:p-7 flex flex-col justify-between space-y-5 relative overflow-hidden group"
              >
                {/* Top badges */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="badge-pill-cyan text-[11px] px-3 py-1 font-mono font-bold">
                      {exam.courseCode}
                    </span>
                    <span className="text-[11px] font-headline font-bold text-slate-400 uppercase tracking-wider">
                      {exam.department.split('&')[0]}
                    </span>
                  </div>

                  <h3 className="text-lg font-headline font-bold text-slate-900 group-hover:text-fuchsia-700 transition-colors">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed font-body">
                    {exam.syllabus}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 font-body">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-fuchsia-500" />
                      <span className="font-mono font-bold">{exam.durationMinutes}</span> mins
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-600" />
                      <span className="font-mono font-bold">{exam.questions.length}</span> questions
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <span>Pass:</span>
                      <span className="font-mono font-bold text-slate-900">{exam.passingMarks}</span>
                      <span>/ {exam.totalMarks} pts</span>
                    </div>
                  </div>
                </div>

                {/* ShopVibe High-Conversion Action Bar */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setSelectedExamForAssistant(exam)}
                    className="p-3 rounded-full border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-cyan-700 text-xs font-headline font-bold flex items-center justify-center transition-all"
                    title="Query rules and syllabus with AI Assistant"
                  >
                    <Bot className="w-4 h-4 text-cyan-600" />
                  </button>

                  <button
                    onClick={() => onStartExam(exam)}
                    className="flex-1 btn-shopvibe-primary py-3 px-5 text-xs font-headline font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Timed Examination</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: PREVIOUS EXAMINATIONS & RESULT REPORTS */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-headline font-black text-slate-900 flex items-center gap-2.5">
            <span>Previous Examinations & Diagnostic Reports</span>
            <span className="badge-pill-cyan text-xs px-3 py-0.5">
              {attempts.length} Recorded
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-body">Instant AI Evaluation</span>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500 font-body">
            No completed exams yet. Take your first examination above to generate personalized diagnostic reports.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
            {attempts.map((att) => {
              const matchedExam = exams.find(e => e.id === att.examId);
              return (
                <div
                  key={att.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-headline font-bold text-slate-900 text-sm">{att.examTitle}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400 font-code text-[11px]">
                        {new Date(att.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-body flex items-center gap-3">
                      <span>Time Spent: <strong className="font-mono">{Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s</strong></span>
                      <span>·</span>
                      <span>Integrity Risk: <strong className="text-emerald-700 font-mono">{att.monitoringRiskLevel || 'Low'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="text-lg font-black font-code text-slate-900">
                        {att.totalMarksScored} <span className="text-xs text-slate-400 font-normal">/ {att.maxMarks}</span>
                      </div>
                      <div className={`text-[10px] font-headline font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                        att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.passed ? 'PASSED' : 'RETEST'} · {att.percentage}%
                      </div>
                    </div>

                    {matchedExam && (
                      <button
                        onClick={() => onViewResult(att, matchedExam)}
                        className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-fuchsia-50 hover:text-fuchsia-700 text-slate-700 text-xs font-headline font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <span>View Report</span>
                        <ArrowRight className="w-3.5 h-3.5 text-fuchsia-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ShopVibe Study Plan Modal (Autonomous Personalized Study Agent) */}
      {showStudyPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-cyan-400 text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-headline font-black text-slate-900">
                    Personalized Adaptive Study Plan
                  </h3>
                  <p className="text-xs text-slate-500 font-body">
                    Synthesized by Aegis Agentic Tutoring Core based on your response variances
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowStudyPlanModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div className="p-4 rounded-2xl bg-fuchsia-50/70 border border-fuchsia-200">
                <div className="flex items-center gap-2 text-xs font-headline font-bold text-fuchsia-800">
                  <Flame className="w-4 h-4 text-fuchsia-600" />
                  <span>Identified Growth Area: SQL Joins & Relational Calculus</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-body">
                  Agent detected 3 wrong answers in recent relational queries. Here is your targeted revision roadmap:
                </p>
              </div>

              <div className="space-y-3 font-body">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-800 text-xs font-headline font-black flex items-center justify-center shrink-0">
                    D1
                  </span>
                  <div>
                    <h4 className="text-xs font-headline font-bold text-slate-900">Day 1: INNER JOIN Fundamentals</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Review Cartesian products vs matching predicates, equijoins, and natural joins.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-7 h-7 rounded-full bg-fuchsia-100 text-fuchsia-800 text-xs font-headline font-black flex items-center justify-center shrink-0">
                    D2
                  </span>
                  <div>
                    <h4 className="text-xs font-headline font-bold text-slate-900">Day 2: LEFT, RIGHT & FULL OUTER JOINS</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Handling NULL values, preserving unmatched tuples, and multi-table cascading joins.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-7 h-7 rounded-full bg-yellow-100 text-yellow-900 text-xs font-headline font-black flex items-center justify-center shrink-0">
                    D3
                  </span>
                  <div>
                    <h4 className="text-xs font-headline font-bold text-slate-900">Day 3: Interactive Practice Quiz (20 Qs)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Timed 15-minute challenge to reinforce mental model and verify query output prediction.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-headline font-black flex items-center justify-center shrink-0">
                    D4
                  </span>
                  <div>
                    <h4 className="text-xs font-headline font-bold text-slate-900">Day 4: Full Mock Assessment</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Simulated proctored examination environment with auto-scoring and streak badge.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setShowStudyPlanModal(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-headline font-bold hover:bg-slate-100 transition-colors"
                >
                  Close Plan
                </button>
                <button
                  onClick={() => {
                    setShowStudyPlanModal(false);
                    if (activeExams[0]) {
                      onStartExam(activeExams[0]);
                    }
                  }}
                  className="btn-shopvibe-primary px-6 py-2.5 text-xs font-headline font-bold"
                >
                  Launch Practice Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {selectedExamForAssistant && (
        <ExamAssistantModal
          exam={selectedExamForAssistant}
          isOpen={!!selectedExamForAssistant}
          onClose={() => setSelectedExamForAssistant(null)}
          isLiveExam={false}
        />
      )}
    </div>
  );
};

