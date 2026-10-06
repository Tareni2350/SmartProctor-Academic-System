import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/auth/LoginPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ExamRunner } from './components/student/ExamRunner';
import { ExamResultView } from './components/student/ExamResultView';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AgentArchitectureView } from './components/agents/AgentArchitectureView';
import { Exam, ExamAttempt } from './types';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

function MainAppContent() {
  const { activeRole, currentUser, setRole } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [adminTab, setAdminTab] = useState<'overview' | 'approvals' | 'users' | 'exams' | 'departments' | 'reports' | 'mails' | 'technical'>('overview');

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

  // If in an active exam, render the full-screen ExamRunner without distractions
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
          setRole('admin');
          setAdminTab('approvals');
          setCurrentTab('dashboard');
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {/* If viewing an exam result & diagnostic report */}
        {activeViewingResult ? (
          <ExamResultView
            attempt={activeViewingResult.attempt}
            exam={activeViewingResult.exam}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : currentTab === 'agents' && activeRole === 'admin' ? (
          <AgentArchitectureView />
        ) : activeRole === 'student' ? (
          <StudentDashboard
            onStartExam={handleStartExam}
            onViewResult={handleViewResult}
          />
        ) : activeRole === 'faculty' ? (
          <FacultyDashboard />
        ) : (
          <AdminDashboard initialTab={adminTab} />
        )}
      </main>

      {/* Institutional Academic Footer with ShopVibe Accents */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-xs text-slate-500 no-print font-body">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-headline font-bold text-slate-900">SmartProctor Academic System</span>
            <span className="text-slate-300">·</span>
            <span>Multi-Agent Online Examination & Automated Result Verification Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {activeRole === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('agents')}
                  className="text-fuchsia-600 hover:text-fuchsia-800 font-headline font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Admin Technical Architecture</span>
                </button>
                <span className="text-slate-300">·</span>
              </>
            )}
            <span className="badge-pill-cyan text-[10px] px-2 py-0.5">Automated Mail Dispatch: Online</span>
            <span className="text-slate-300">·</span>
            <span className="font-code text-slate-400">Spring Term 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
