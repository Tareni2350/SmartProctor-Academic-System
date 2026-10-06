import React, { useState, useEffect } from 'react';
import { Exam, Question, ExamAttempt, ClassAnalysis } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Plus, 
  Sparkles, 
  Wand2, 
  Users, 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  Eye, 
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  UploadCloud
} from 'lucide-react';
import { AIQuestionStudioModal } from './AIQuestionStudioModal';
import { AIExamCreatorModal } from './AIExamCreatorModal';
import { UploadQuestionPaperModal } from './UploadQuestionPaperModal';

export const FacultyDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'exams' | 'question_bank' | 'submissions' | 'ai_insights' | 'proctoring'>('exams');

  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isQuestionStudioOpen, setIsQuestionStudioOpen] = useState(false);
  const [isExamCreatorOpen, setIsExamCreatorOpen] = useState(false);
  const [isUploadQuestionPaperOpen, setIsUploadQuestionPaperOpen] = useState(false);

  // Manual Exam Creation State
  const [isManualExamModalOpen, setIsManualExamModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualCourseCode, setManualCourseCode] = useState('');
  const [manualSubject, setManualSubject] = useState('Data Structures & Algorithms');
  const [manualDuration, setManualDuration] = useState(30);
  const [manualPassingMarks, setManualPassingMarks] = useState(15);
  const [manualSyllabus, setManualSyllabus] = useState('');

  // AI Performance Analysis Agent State
  const [selectedExamForAnalysis, setSelectedExamForAnalysis] = useState<string>('');
  const [classAnalysisData, setClassAnalysisData] = useState<{ stats: any; insights: ClassAnalysis } | null>(null);
  const [isLoadingClassAnalysis, setIsLoadingClassAnalysis] = useState(false);

  useEffect(() => {
    loadFacultyData();
  }, []);

  if (!currentUser) {
    return null;
  }

  const loadFacultyData = async () => {
    setIsLoading(true);
    try {
      const [fetchedExams, fetchedQuestions, fetchedSubmissions] = await Promise.all([
        api.getExams(),
        api.getQuestions(),
        api.getSubmissions()
      ]);
      setExams(fetchedExams);
      setQuestions(fetchedQuestions);
      setSubmissions(fetchedSubmissions);
      if (fetchedExams.length > 0) {
        setSelectedExamForAnalysis(fetchedExams[0].id);
      }
    } catch (err) {
      console.error('Failed to load faculty data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run AI Result Analysis Agent
  const runClassAnalysis = async (examId: string) => {
    const targetExam = exams.find(e => e.id === examId);
    if (!targetExam) return;

    setIsLoadingClassAnalysis(true);
    try {
      const res = await api.agentAnalyzeClassResults(examId, targetExam.title);
      setClassAnalysisData(res);
    } catch (err) {
      console.error('Class analysis failed:', err);
    } finally {
      setIsLoadingClassAnalysis(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai_insights' && selectedExamForAnalysis && !classAnalysisData) {
      runClassAnalysis(selectedExamForAnalysis);
    }
  }, [activeTab, selectedExamForAnalysis]);

  // Handle Question Studio approvals
  const handleApproveStudioQuestions = async (approved: Question[]) => {
    // Add to state and save
    setQuestions(prev => [...approved, ...prev]);
    for (const q of approved) {
      await api.addQuestion(q);
    }
    alert(`Successfully verified and incorporated ${approved.length} questions.`);
  };

  // Handle Exam Creator approval
  const handleApproveDraftExam = (newExam: Exam) => {
    setExams(prev => [newExam, ...prev]);
    alert(`Examination "${newExam.title}" is published and available to students!`);
  };

  // Create Manual Exam
  const handleCreateManualExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Pick 3 default questions from bank matching subject
      const matchingQuestions = questions.slice(0, 3);
      const totalMarks = matchingQuestions.reduce((s, q) => s + q.marks, 0) || 15;

      const created = await api.createExam({
        title: manualTitle,
        courseCode: manualCourseCode,
        subject: manualSubject,
        department: currentUser.department,
        durationMinutes: Number(manualDuration),
        totalMarks,
        passingMarks: Number(manualPassingMarks),
        syllabus: manualSyllabus,
        questions: matchingQuestions,
        createdBy: currentUser.name
      });

      setExams(prev => [created, ...prev]);
      setIsManualExamModalOpen(false);
      setManualTitle('');
      setManualCourseCode('');
      setManualSyllabus('');
    } catch (err: any) {
      alert('Failed to create exam: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-body">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-headline font-bold text-fuchsia-600 tracking-wider uppercase mb-1">
            <BookOpen className="w-4 h-4" />
            <span>FACULTY EXAMINATION STUDIO · SPRING 2026</span>
          </div>
          <h1 className="text-3xl font-headline font-black text-slate-900 tracking-tight">
            Academic Assessment & AI Proctoring
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Lead Instructor: <strong className="text-slate-800">{currentUser.name}</strong> · {currentUser.department}
          </p>
        </div>

        {/* Primary ShopVibe Agent CTAs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsUploadQuestionPaperOpen(true)}
            className="px-4 py-2.5 rounded-full bg-cyan-50 border border-cyan-300 hover:border-cyan-400 text-cyan-800 text-xs font-headline font-bold flex items-center gap-2 shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-600" />
            <span>Upload Question Paper</span>
          </button>

          <button
            onClick={() => setIsQuestionStudioOpen(true)}
            className="px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:border-fuchsia-400 text-slate-700 text-xs font-headline font-bold flex items-center gap-2 shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-600" />
            <span>AI Question Studio</span>
          </button>

          <button
            onClick={() => setIsExamCreatorOpen(true)}
            className="btn-shopvibe-primary px-5 py-2.5 text-xs font-headline font-bold flex items-center gap-2 shadow-md hover:scale-105 active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Exam Generator</span>
          </button>
        </div>
      </div>

      {/* ShopVibe Pill Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-3 text-xs font-headline font-bold">
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Examinations ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('question_bank')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'question_bank'
              ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Question Bank ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Submissions ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_insights')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'ai_insights'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm shadow-cyan-500/30'
              : 'bg-cyan-50 text-cyan-900 hover:bg-cyan-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-cyan-600" />
          <span>AI Class Analytics Agent</span>
        </button>

        <button
          onClick={() => setActiveTab('proctoring')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'proctoring'
              ? 'bg-yellow-300 text-amber-950 font-black shadow-sm'
              : 'bg-yellow-50 text-amber-900 hover:bg-yellow-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>AI Monitoring Anomaly Flags</span>
        </button>
      </div>

      {/* TAB 1: EXAMINATIONS */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Department Examinations Schedule
            </h2>
            <button
              onClick={() => setIsManualExamModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Exam</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700 font-mono">{exam.courseCode}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px] uppercase">
                      {exam.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {exam.syllabus}
                  </p>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>Duration: <strong>{exam.durationMinutes} mins</strong></div>
                    <div>Questions: <strong>{exam.questions.length}</strong></div>
                    <div>Total Marks: <strong>{exam.totalMarks}</strong></div>
                    <div>Passing: <strong>{exam.passingMarks}</strong></div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <span>Enrolled: {exam.enrolledStudentsCount || 40} students</span>
                  <button
                    onClick={() => {
                      setSelectedExamForAnalysis(exam.id);
                      setActiveTab('ai_insights');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <span>Analyze Cohort</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: QUESTION BANK */}
      {activeTab === 'question_bank' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Central Academic Question Bank
              </h2>
              <p className="text-xs text-slate-500">
                Categorized questions verified by faculty and audited by the AI Question Quality Agent.
              </p>
            </div>

            <button
              onClick={() => setIsQuestionStudioOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Question Studio</span>
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">#{idx + 1}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-indigo-700">{q.subject}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-700 font-medium">{q.topic}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {q.difficulty}
                    </span>
                    <span className="font-bold text-slate-700">{q.marks} Marks</span>
                  </div>
                </div>

                <div className="text-sm font-medium text-slate-900 leading-relaxed">
                  {q.questionText}
                </div>

                {q.type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-lg border ${
                          oIdx === q.correctOptionIndex
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                        {opt} {oIdx === q.correctOptionIndex && '(Correct Key)'}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Candidate Submissions & Grading Ledger
            </h2>
            <span className="text-xs text-slate-500">{submissions.length} Total Evaluated</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Examination</th>
                  <th className="p-4">Time Spent</th>
                  <th className="p-4">Score / Max</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Anomaly Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">
                      {sub.studentName}
                      <div className="text-[11px] text-slate-400 font-normal">{sub.studentEmail}</div>
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs truncate">{sub.examTitle}</td>
                    <td className="p-4 font-mono text-slate-600">
                      {Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {sub.totalMarksScored} / {sub.maxMarks} ({sub.percentage}%)
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sub.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        sub.monitoringRiskLevel === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : sub.monitoringRiskLevel === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {sub.monitoringRiskLevel || 'Low'} Risk ({sub.monitoringAnomalyScore || 0}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AI CLASS PERFORMANCE ANALYSIS AGENT */}
      {activeTab === 'ai_insights' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                AI Performance Analysis Agent · Cohort Diagnostics
              </h2>
              <p className="text-xs text-slate-500">
                Analyzes average marks, question-wise accuracy, difficult topics, and students at risk.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedExamForAnalysis}
                onChange={(e) => {
                  setSelectedExamForAnalysis(e.target.value);
                  runClassAnalysis(e.target.value);
                }}
                className="text-xs p-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.courseCode}: {ex.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => runClassAnalysis(selectedExamForAnalysis)}
                disabled={isLoadingClassAnalysis}
                className="p-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                title="Re-run Agent"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoadingClassAnalysis ? (
            <div className="p-12 text-center text-slate-500 space-y-2 bg-white rounded-2xl border border-slate-200">
              <Sparkles className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-medium">AI Result Analysis Agent processing cohort answers...</p>
            </div>
          ) : classAnalysisData ? (
            <div className="space-y-6">
              {/* Highlight Quote Box */}
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md space-y-3">
                <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI Insight & Cohort Diagnosis:</span>
                </div>
                <blockquote className="text-sm sm:text-base font-medium leading-relaxed italic text-slate-100">
                  "{classAnalysisData.insights.classInsight}"
                </blockquote>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium block">Class Average</span>
                  <span className="text-xl font-bold font-mono text-slate-900">{classAnalysisData.stats.avgScore}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium block">Highest Mark</span>
                  <span className="text-xl font-bold font-mono text-emerald-600">{classAnalysisData.stats.highestScore}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium block">Lowest Mark</span>
                  <span className="text-xl font-bold font-mono text-rose-600">{classAnalysisData.stats.lowestScore}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium block">Overall Pass Rate</span>
                  <span className="text-xl font-bold font-mono text-indigo-600">{classAnalysisData.stats.passRate}%</span>
                </div>
              </div>

              {/* Difficult Topics & Students at Risk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Difficult Topics with Low Accuracy</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classAnalysisData.insights.difficultTopics.map((dt, i) => (
                      <span key={i} className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
                        {dt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>Students Requiring Remedial Attention</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classAnalysisData.insights.studentsAtRisk.length === 0 ? (
                      <span className="text-xs text-slate-500">No students currently in critical risk bracket.</span>
                    ) : (
                      classAnalysisData.insights.studentsAtRisk.map((st, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
                          {st}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Pedagogical Recommendations */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Agentic Pedagogical Recommendations for Faculty:
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {classAnalysisData.insights.pedagogicalRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 5: AI MONITORING ANOMALY FLAGS */}
      {activeTab === 'proctoring' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                AI Exam Monitoring Agent · Anomaly Audit Log
              </h2>
              <p className="text-xs text-slate-500">
                Audits window switches, rapid answering, and session stability to produce non-punitive review flags for instructor discretion.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {submissions.map((sub) => {
              const isHigh = sub.monitoringRiskLevel === 'High';
              const isModerate = sub.monitoringRiskLevel === 'Moderate';

              return (
                <div
                  key={sub.id}
                  className={`bg-white rounded-2xl border p-5 space-y-4 ${
                    isHigh
                      ? 'border-rose-300 bg-rose-50/10'
                      : isModerate
                      ? 'border-amber-300 bg-amber-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{sub.studentName}</h4>
                      <p className="text-xs text-slate-500">
                        {sub.examTitle} · Score: {sub.totalMarksScored} / {sub.maxMarks}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : isModerate
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sub.monitoringRiskLevel || 'Low'} Risk ({sub.monitoringAnomalyScore || 0}% score)
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong>AI Monitoring Summary:</strong> {sub.monitoringSummary || 'Normal interactions throughout the session.'}
                  </div>

                  {sub.monitoringLog && sub.monitoringLog.length > 0 && (
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="font-semibold text-slate-500 uppercase text-[10px]">
                        Recorded Telemetry Events ({sub.monitoringLog.length}):
                      </div>
                      <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                        {sub.monitoringLog.map((log, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-2 p-1.5 bg-slate-100 rounded text-slate-700">
                            <span className="text-slate-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className="font-bold text-slate-800 uppercase">{log.type}:</span>
                            <span>{log.details}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Studio Modal */}
      <AIQuestionStudioModal
        isOpen={isQuestionStudioOpen}
        onClose={() => setIsQuestionStudioOpen(false)}
        onApproveQuestions={handleApproveStudioQuestions}
      />

      {/* AI Exam Creator Modal */}
      <AIExamCreatorModal
        isOpen={isExamCreatorOpen}
        onClose={() => setIsExamCreatorOpen(false)}
        onExamCreated={handleApproveDraftExam}
        facultyName={currentUser.name}
      />

      {/* Manual Exam Creation Modal */}
      {isManualExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateManualExam}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">
              Create New Examination
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. CS204 Final Examination"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={manualCourseCode}
                    onChange={(e) => setManualCourseCode(e.target.value)}
                    placeholder="e.g. CS204"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Syllabus Overview</label>
                <textarea
                  rows={2}
                  value={manualSyllabus}
                  onChange={(e) => setManualSyllabus(e.target.value)}
                  placeholder="Topics covered..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsManualExamModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
              >
                Publish Exam
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upload Question Paper Modal */}
      <UploadQuestionPaperModal
        isOpen={isUploadQuestionPaperOpen}
        onClose={() => setIsUploadQuestionPaperOpen(false)}
        onExamCreated={(newExam) => {
          setExams(prev => [newExam, ...prev]);
        }}
        onQuestionsAddedToBank={(newQuestions) => {
          setQuestions(prev => [...newQuestions, ...prev]);
        }}
      />
    </div>
  );
};
