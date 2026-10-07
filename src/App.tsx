import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/auth/LoginPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ExamRunner } from './components/student/ExamRunner';
import { ExamResultView } from './components/student/ExamResultView';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AgentArchitectureView } from './components/agents/AgentArchitectureView';
import { Exam, ExamAttempt } from './types';
import { Cpu } from 'lucide-react';

function MainAppContent() {
  const { activeRole, currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [adminTab, setAdminTab] = useState<'overview' | 'approvals' | 'users' | 'exams' | 'departments' | 'reports' | 'mails'>('overview');

  // Exam taking state for students
  const [activeTakingExam, setActiveTakingExam] = useState<Exam | null>(null);

  // Exam result view state
  const [activeViewingResult, setActiveViewingResult] = useState<{
    attempt: ExamAttempt;
    exam: Exam;
  } | null>(null);

  // Student starts taking an exam
  const handleStartExam = (exam: Exam) => {
    setActiveTakingExam(exam);
    setActiveViewingResult(null);
  };

  // Student submits the exam
  const handleExamFinished = (attempt: ExamAttempt) => {
    if (activeTakingExam) {
      setActiveViewingResult({
        attempt,
        exam: activeTakingExam
      });
    }
    setActiveTakingExam(null);
  };

  // Student views previous result
  const handleViewResult = (attempt: ExamAttempt, exam: Exam) => {
    setActiveViewingResult({ attempt, exam });
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    setActiveViewingResult(null);
    setActiveTakingExam(null);
    setCurrentTab('dashboard');
  };

  // If in an active exam, render the full-screen ExamRunner
  if (activeTakingExam) {
    return (
      <ExamRunner
        exam={activeTakingExam}
        onExamFinished={handleExamFinished}
        onExit={handleBackToDashboard}
      />
    );
  }

  // If not logged in, render the Login / Registration Portal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
        <Navbar
          currentTab="login"
          onSelectTab={() => {}}
        />
        <main className="flex-1">
          <LoginPage onLoginSuccess={() => setCurrentTab('dashboard')} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setActiveViewingResult(null);
        }}
        onNavigateToApprovals={() => {
          if (activeRole === 'admin') {
            setAdminTab('approvals');
            setCurrentTab('dashboard');
          }
        }}
      />

      {/* Main View Area: STRICT ROLE ISOLATION */}
      <main className="flex-1 pb-16">
        {activeViewingResult ? (
          <ExamResultView
            attempt={activeViewingResult.attempt}
            exam={activeViewingResult.exam}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : activeRole === 'student' ? (
          <StudentDashboard
            onStartExam={handleStartExam}
            onViewResult={handleViewResult}
          />
        ) : activeRole === 'faculty' ? (
          <FacultyDashboard />
        ) : activeRole === 'admin' ? (
          currentTab === 'agents' ? (
            <AgentArchitectureView />
          ) : (
            <AdminDashboard initialTab={adminTab} />
          )
        ) : null}
      </main>

      {/* Institutional Academic Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500 no-print font-body">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-headline font-bold text-slate-900">SmartProctor Academic System</span>
            <span className="text-slate-300">·</span>
            <span>Online Examination & Proctoring Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {activeRole === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('agents')}
                  className="text-fuchsia-700 hover:text-fuchsia-900 font-headline font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Agentic AI Architecture</span>
                </button>
                <span className="text-slate-300">·</span>
              </>
            )}
            <span className="text-emerald-700 font-medium">Session Security Active</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-slate-400">Spring Term 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
