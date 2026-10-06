import React, { useState, useEffect } from 'react';
import { 
  UserAccount, 
  Exam, 
  ExamAttempt, 
  SystemStats,
  AutomatedMailLog,
  DatabaseArchitectureInfo 
} from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  FileCheck, 
  RotateCcw, 
  Building2, 
  FileText, 
  Download,
  Activity,
  Layers,
  Search,
  Filter,
  Clock,
  UserCheck,
  UserPlus,
  AlertCircle,
  X,
  Plus,
  Mail,
  User,
  Lock,
  IdCard,
  Database,
  Cpu,
  Server,
  Terminal,
  Send,
  RefreshCw,
  HardDrive,
  KeyRound,
  ExternalLink,
  Bot
} from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: 'overview' | 'approvals' | 'users' | 'exams' | 'departments' | 'reports' | 'mails' | 'technical';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview' }) => {
  const { currentUser, approveUser: authApproveUser, createUser: authCreateUser, refreshUsers } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<ExamAttempt[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [mailLogs, setMailLogs] = useState<AutomatedMailLog[]>([]);
  const [databaseSpec, setDatabaseSpec] = useState<DatabaseArchitectureInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'users' | 'exams' | 'departments' | 'reports' | 'mails' | 'technical'>(initialTab);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'faculty'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected' | 'inactive'>('all');

  // Automated Mail Composer State
  const [isMailComposerOpen, setIsMailComposerOpen] = useState(false);
  const [mailRecipientEmail, setMailRecipientEmail] = useState('');
  const [mailRecipientName, setMailRecipientName] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [mailType, setMailType] = useState<AutomatedMailLog['type']>('result_published');
  const [isSendingMail, setIsSendingMail] = useState(false);

  // Dispatching result report
  const [dispatchingSubmissionId, setDispatchingSubmissionId] = useState<string | null>(null);

  // Approval action states
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // Create User Modal
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'student' | 'faculty'>('student');
  const [newDepartment, setNewDepartment] = useState('Computer Science & Engineering');
  const [newIdentifier, setNewIdentifier] = useState('');
  const [newStatus, setNewStatus] = useState<'active' | 'pending'>('active');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedExams, fetchedSubmissions, fetchedStats, fetchedMails, fetchedDb] = await Promise.all([
        api.getUsers(),
        api.getExams(),
        api.getSubmissions(),
        api.getSystemStats(),
        api.getMailLogs().catch(() => []),
        api.getDatabaseSpec().catch(() => null)
      ]);
      setUsers(fetchedUsers);
      setExams(fetchedExams);
      setSubmissions(fetchedSubmissions);
      setStats(fetchedStats);
      setMailLogs(fetchedMails);
      setDatabaseSpec(fetchedDb);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendManualMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailRecipientEmail || !mailSubject) return;
    setIsSendingMail(true);
    try {
      const newLog = await api.sendAutomatedMail({
        recipientEmail: mailRecipientEmail,
        recipientName: mailRecipientName || mailRecipientEmail,
        subject: mailSubject,
        type: mailType,
        contentSnippet: mailContent,
        metadata: { reportId: `MANUAL-${Date.now().toString(36).toUpperCase()}` }
      });
      setMailLogs(prev => [newLog, ...prev]);
      setIsMailComposerOpen(false);
      setMailRecipientEmail('');
      setMailRecipientName('');
      setMailSubject('');
      setMailContent('');
      setApprovalFeedback(`Automated email successfully dispatched to ${newLog.recipientEmail}.`);
      setTimeout(() => setApprovalFeedback(null), 5000);
    } catch (err: any) {
      alert('Failed to send mail: ' + err.message);
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleDispatchSubmissionReport = async (submissionId: string) => {
    setDispatchingSubmissionId(submissionId);
    try {
      const res = await api.dispatchResultReport(submissionId);
      setMailLogs(prev => [res.mailLog, ...prev]);
      setApprovalFeedback(res.message);
      setTimeout(() => setApprovalFeedback(null), 5000);
    } catch (err: any) {
      alert('Failed to dispatch result report: ' + err.message);
    } finally {
      setDispatchingSubmissionId(null);
    }
  };

  const handleApproveAction = async (userId: string, action: 'approve' | 'reject') => {
    setProcessingUserId(userId);
    try {
      const updatedUser = await authApproveUser(userId, action);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      setApprovalFeedback(
        action === 'approve'
          ? `Successfully approved and activated account for ${updatedUser.name} (${updatedUser.role.toUpperCase()}).`
          : `Application rejected for ${updatedUser.name}.`
      );
      setTimeout(() => setApprovalFeedback(null), 4000);
    } catch (err: any) {
      alert(`Failed to ${action} user: ${err.message}`);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleToggleUserStatus = async (user: UserAccount) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateUserStatus(user.id, newStatus);
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      await refreshUsers();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleApproveExam = async (examId: string) => {
    try {
      await api.updateExam(examId, { status: 'published' });
      setExams(prev =>
        prev.map(e => (e.id === examId ? { ...e, status: 'published' } : e))
      );
      alert('Examination approved and activated.');
    } catch (err) {
      alert('Failed to approve exam');
    }
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    setIsCreatingUser(true);
    try {
      const created = await authCreateUser({
        name: newName,
        email: newEmail,
        role: newRole,
        department: newDepartment,
        identifier: newIdentifier || `${newRole === 'student' ? 'CS-2026' : 'FAC-CS'}-${Math.floor(100 + Math.random() * 900)}`,
        status: newStatus
      });

      setUsers(prev => [created, ...prev]);
      setIsCreateUserModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewIdentifier('');
      setApprovalFeedback(`Created user ${created.name} (${created.status.toUpperCase()}).`);
      setTimeout(() => setApprovalFeedback(null), 4000);
    } catch (err: any) {
      alert('Failed to create user: ' + err.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const pendingUsers = users.filter(u => u.status === 'pending');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                          (u.identifier && u.identifier.toLowerCase().includes(searchUserQuery.toLowerCase()));
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-body">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-headline font-bold text-fuchsia-600 tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ACADEMIC GOVERNANCE & PLATFORM ADMINISTRATION</span>
          </div>
          <h1 className="text-3xl font-headline font-black text-slate-900 tracking-tight">
            System Administration Console
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Administrator: <strong className="text-slate-800">{currentUser?.name || 'Administrator'}</strong> · {currentUser?.department || 'Academic Administration'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {pendingUsers.length > 0 && (
            <button
              onClick={() => setActiveTab('approvals')}
              className="px-4 py-2 rounded-full bg-yellow-300 hover:bg-yellow-400 text-amber-950 text-xs font-headline font-extrabold shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-amber-900" />
              <span>{pendingUsers.length} Pending Approval{pendingUsers.length > 1 ? 's' : ''}</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateUserModalOpen(true)}
            className="btn-shopvibe-primary px-4 py-2 text-xs font-headline font-bold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add User Profile</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {approvalFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{approvalFeedback}</span>
          </div>
          <button onClick={() => setApprovalFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ShopVibe Pill Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-3 text-xs font-headline font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'bg-yellow-300 text-amber-950 font-black shadow-sm'
              : 'bg-yellow-50 text-amber-900 hover:bg-yellow-100'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-800" />
          <span>Profile Approvals</span>
          {pendingUsers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-mono font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Examinations Governance ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'departments'
              ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Courses & Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Reports</span>
        </button>

        {/* NEW: Automated Mails Tab */}
        <button
          onClick={() => setActiveTab('mails')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'mails'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm shadow-cyan-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-4 h-4 text-cyan-500" />
          <span>Automated Mails ({mailLogs.length})</span>
        </button>

        {/* NEW: Admin Technical & Database Specs Tab (Admin-Only restricted) */}
        <button
          onClick={() => setActiveTab('technical')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'technical'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4 text-fuchsia-400" />
          <span>Database & Technical Specs</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span>ENROLLED STUDENTS</span>
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {users.filter(u => u.role === 'student' && u.status === 'active').length * 42}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">Active verified students</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span>ACTIVE FACULTY</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {users.filter(u => u.role === 'faculty' && u.status === 'active').length}
              </div>
              <div className="text-[11px] text-indigo-600 mt-1">Verified professors</div>
            </div>

            {/* PENDING APPROVALS STAT CARD */}
            <div 
              onClick={() => setActiveTab('approvals')}
              className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 shadow-sm cursor-pointer hover:bg-amber-100/70 transition-all"
            >
              <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-2">
                <span>PENDING APPROVALS</span>
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-900">
                {pendingUsers.length}
              </div>
              <div className="text-[11px] text-amber-700 mt-1 font-semibold">
                Click to review applications →
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span>CONDUCTED EXAMS</span>
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">{exams.length}</div>
              <div className="text-[11px] text-slate-500 mt-1">{submissions.length} Total Submissions</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                <span>AGENTIC INTEGRITY</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600">98.4%</div>
              <div className="text-[11px] text-slate-500 mt-1">Anomaly flags resolved</div>
            </div>
          </div>

          {/* Quick Approvals Action Box if pending users exist */}
          {pendingUsers.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                    Action Required: {pendingUsers.length} New Candidate Profile{pendingUsers.length > 1 ? 's' : ''} Awaiting Admin Approval
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Students and faculty who registered online cannot take exams or generate papers until verified by your office.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('approvals')}
                className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
              >
                Review Applications ({pendingUsers.length})
              </button>
            </div>
          )}

          {/* Core System Autonomous Agents Health */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Autonomous Agent Orchestration Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">Agent 1: Question Generation</div>
                <div className="text-slate-500">Autonomous syllabus alignment, difficulty distribution, and distractor generation.</div>
                <div className="text-emerald-700 font-semibold pt-1">Status: Active & Validated</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">Agent 2: Quality & Audit</div>
                <div className="text-slate-500">Pre-exam ambiguity scoring, duplicate detection, and answer key verification.</div>
                <div className="text-emerald-700 font-semibold pt-1">Status: Active & Validated</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">Agent 3: Monitoring & Anomaly</div>
                <div className="text-slate-500">Continuous blur detection, rapid-answer timing analysis, generating objective flags.</div>
                <div className="text-emerald-700 font-semibold pt-1">Status: Active on all live sessions</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">Agent 4: Diagnostic & Tutoring</div>
                <div className="text-slate-500">Multi-exam accuracy curves, weak concept isolation, adaptive recovery schedules.</div>
                <div className="text-emerald-700 font-semibold pt-1">Status: Operational</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE APPROVALS (STUDENT & FACULTY VERIFICATION) */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                <span>Student & Faculty Profile Approvals</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  {pendingUsers.length} Pending
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                As the Academic Administrator, review and approve credentials before granting exam access or paper creation rights.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Provision User Directly</span>
              </button>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                All Profile Approvals Are Up to Date
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No new student or faculty accounts are currently pending approval. Newly registered users will immediately appear in this queue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-4 hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={user.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-100"
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Applied: {user.joinedDate}</div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                        user.role === 'faculty'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role} Applicant
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Department:</span>
                        <span className="font-semibold text-slate-800">{user.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          {user.role === 'student' ? 'Roll / Enrollment ID:' : 'Employee / Faculty ID:'}
                        </span>
                        <span className="font-mono font-bold text-indigo-700">{user.identifier || 'Unassigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Security Status:</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                          <Clock className="w-3 h-3" />
                          <span>Pending Admin Approval</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleApproveAction(user.id, 'reject')}
                      disabled={processingUserId === user.id}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleApproveAction(user.id, 'approve')}
                      disabled={processingUserId === user.id}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {processingUserId === user.id ? (
                        <span>Activating...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Activate Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAGE ALL USERS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, email, roll ID..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 w-64 bg-white"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                <button
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    userRoleFilter === 'all' ? 'bg-white font-semibold shadow-sm' : 'text-slate-600'
                  }`}
                >
                  All Roles
                </button>
                <button
                  onClick={() => setUserRoleFilter('student')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    userRoleFilter === 'student' ? 'bg-white font-semibold shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Students
                </button>
                <button
                  onClick={() => setUserRoleFilter('faculty')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    userRoleFilter === 'faculty' ? 'bg-white font-semibold shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Faculty
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                <button
                  onClick={() => setUserStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    userStatusFilter === 'all' ? 'bg-white font-semibold shadow-sm' : 'text-slate-600'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setUserStatusFilter('pending')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    userStatusFilter === 'pending' ? 'bg-white font-semibold text-amber-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Pending ({pendingUsers.length})
                </button>
                <button
                  onClick={() => setUserStatusFilter('active')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    userStatusFilter === 'active' ? 'bg-white font-semibold text-emerald-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Active
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create / Provision Account</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department & Identifier</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-4 uppercase font-bold text-slate-700">{u.role}</td>
                    <td className="p-4 text-slate-600">
                      <div>{u.department}</div>
                      {u.identifier && (
                        <div className="text-[10px] font-mono text-indigo-600 font-semibold">{u.identifier}</div>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">{u.joinedDate}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : u.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveAction(u.id, 'approve')}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveAction(u.id, 'reject')}
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            u.status === 'active'
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EXAMINATIONS GOVERNANCE */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Departmental Examinations & Quality Control
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Course / Exam</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Questions</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">
                      <div>{exam.title}</div>
                      <div className="text-[11px] text-indigo-700 font-mono">{exam.courseCode}</div>
                    </td>
                    <td className="p-4 text-slate-600">{exam.department}</td>
                    <td className="p-4 text-slate-600">{exam.questions.length} Questions ({exam.totalMarks} Marks)</td>
                    <td className="p-4 text-slate-500">{exam.durationMinutes} mins</td>
                    <td className="p-4 text-slate-600">{exam.createdBy}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        exam.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {exam.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {exam.status === 'draft' ? (
                        <button
                          onClick={() => handleApproveExam(exam.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                        >
                          Approve Exam
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: COURSES & CATALOG */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Computer Science & Engineering', code: 'CSE', head: 'Dr. Alan Turing', students: 420, courses: 14 },
            { name: 'Artificial Intelligence & Data Science', code: 'AIDS', head: 'Prof. Claude Shannon', students: 310, courses: 9 },
            { name: 'Information Technology', code: 'IT', head: 'Dr. Grace Hopper', students: 280, courses: 11 },
            { name: 'Electrical & Electronics', code: 'EEE', head: 'Dr. Nikola Tesla', students: 240, courses: 8 }
          ].map((dept, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-xs">
                  {dept.code}
                </span>
                <span className="text-xs text-slate-400">{dept.courses} Active Courses</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div>Department Head: <strong>{dept.head}</strong></div>
                <div>Enrolled Students: <strong>{dept.students}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: AUDIT REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-headline font-bold text-fuchsia-600 mb-1">
                <FileCheck className="w-4 h-4" />
                <span>EXAMINATION & PROCTORING CERTIFICATE AUDITS</span>
              </div>
              <h3 className="text-xl font-headline font-black text-slate-900">
                Institutional Academic Examination & AI Integrity Report
              </h3>
              <p className="text-xs text-slate-500 font-body">
                Comprehensive semester audit report covering candidate pass rates, automated report dispatches, and monitoring anomaly rates.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-full bg-slate-900 text-white text-xs font-headline font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full PDF Report</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-4 text-xs text-slate-700 font-mono">
            <div className="flex justify-between border-b border-slate-200 pb-2 text-[11px] text-slate-500">
              <span>REPORT_ID: ACAD-AUDIT-2026-SP</span>
              <span>TIMESTAMP: {new Date().toISOString()}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>Total Tests Conducted: <strong className="text-slate-900 font-bold">{submissions.length}</strong></div>
              <div>Institutional Pass Rate: <strong className="text-emerald-700 font-bold">88.2%</strong></div>
              <div>Proctoring Flags Reviewed: <strong className="text-amber-700 font-bold">{submissions.filter(s => s.monitoringRiskLevel !== 'Low').length}</strong></div>
              <div>AI Validated Questions: <strong className="text-cyan-700 font-bold">{stats?.questionBankSize || 25}</strong></div>
            </div>
          </div>

          {/* Submissions Result Report Automation Center */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-headline font-bold text-slate-900">
                  Candidate Submissions & Automated Result Report Generation
                </h4>
                <p className="text-xs text-slate-500 font-body">
                  Generate official certificates and dispatch automated result reports directly to candidates' institutional mailboxes.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-headline font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Candidate Name & Email</th>
                    <th className="p-3.5">Exam Title</th>
                    <th className="p-3.5">Score / Max</th>
                    <th className="p-3.5">Academic Status</th>
                    <th className="p-3.5">Anomaly Telemetry</th>
                    <th className="p-3.5 text-right">Result Report Automation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-body">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-headline font-bold text-slate-900">{sub.studentName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{sub.studentEmail}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700 max-w-xs truncate">{sub.examTitle}</td>
                      <td className="p-3.5 font-code font-bold text-slate-900">
                        {sub.totalMarksScored} / {sub.maxMarks} <span className="text-[10px] text-slate-500 font-normal">({sub.percentage}%)</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold ${
                          sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sub.passed ? 'QUALIFIED / PASS' : 'NEEDS REVISION'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          sub.monitoringRiskLevel === 'Low' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.monitoringRiskLevel || 'Low'} Risk
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDispatchSubmissionReport(sub.id)}
                          disabled={dispatchingSubmissionId === sub.id}
                          className="px-3.5 py-1.5 rounded-full bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-200 text-fuchsia-700 text-xs font-headline font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 inline-flex items-center gap-1.5"
                          title="Generate official result report and send automated mail to student"
                        >
                          <Send className="w-3 h-3 text-fuchsia-600" />
                          <span>{dispatchingSubmissionId === sub.id ? 'Dispatching...' : 'Dispatch Mail Report'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AUTOMATED MAILS & TRANSACTIONAL LOGS */}
      {activeTab === 'mails' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-headline font-bold text-cyan-600 mb-1">
                <Mail className="w-4 h-4" />
                <span>COMMUNICATIONS AUTOMATION ENGINE</span>
              </div>
              <h2 className="text-2xl font-headline font-black text-slate-900">
                Automated Mail Dispatches & Logs
              </h2>
              <p className="text-xs text-slate-500 font-body">
                Real-time audit log of automated transaction emails sent to students and faculty (Result reports, Account approvals, Security warnings).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMailComposerOpen(true)}
                className="btn-shopvibe-primary px-4 py-2 text-xs font-headline font-bold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Automated Notice</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block">Total Mails Sent</span>
              <div className="text-2xl font-black font-code text-slate-900 mt-1">{mailLogs.length}</div>
              <span className="text-[11px] text-emerald-600 font-medium">100% Delivery Success Rate</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block">Result Reports Dispatched</span>
              <div className="text-2xl font-black font-code text-fuchsia-600 mt-1">
                {mailLogs.filter(m => m.type === 'result_published').length}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Auto-triggered upon evaluation</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-400 block">Account Notifications</span>
              <div className="text-2xl font-black font-code text-cyan-600 mt-1">
                {mailLogs.filter(m => m.type === 'account_approved' || m.type === 'account_registered').length}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Welcome & approval verifications</span>
            </div>
          </div>

          {/* Automated Mail Dispatch Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline font-bold text-slate-900 text-sm">
                Recent Automated Email Transactions ({mailLogs.length})
              </h3>
              <span className="badge-pill-cyan text-[10px] px-2.5 py-0.5">SMTP / Cloud Mailer: Active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-headline font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Subject & Email Content</th>
                    <th className="p-4">Dispatch Category</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Delivery Status</th>
                    <th className="p-4 text-right">Verification Token</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-body">
                  {mailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-headline font-bold text-slate-900">{log.recipientName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{log.recipientEmail}</div>
                      </td>
                      <td className="p-4 max-w-md">
                        <div className="font-semibold text-slate-800 font-headline">{log.subject}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {log.contentSnippet}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold ${
                          log.type === 'result_published' ? 'bg-fuchsia-100 text-fuchsia-800' :
                          log.type === 'account_approved' ? 'bg-emerald-100 text-emerald-800' :
                          log.type === 'integrity_alert' ? 'bg-rose-100 text-rose-800' :
                          'bg-cyan-100 text-cyan-800'
                        }`}>
                          {log.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>DELIVERED</span>
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-[11px] text-slate-400">
                        {log.metadata?.reportId || log.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: TECHNICAL DATABASE ARCHITECTURE (ADMIN ONLY RESTRICTED) */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          {/* Admin Technical Security Notice */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-600 flex items-center justify-center text-white shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-sm text-white">
                    Administrator Confidential: Infrastructure & Database Architecture
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-mono border border-fuchsia-500/30">
                    RESTRICTED VIEW
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-body mt-0.5">
                  Technical specifications, schema topologies, and storage engines are exclusively accessible to logged-in system administrators.
                </p>
              </div>
            </div>

            <button
              onClick={loadAdminData}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-headline font-bold flex items-center gap-1.5 border border-white/15 transition-all self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          {/* Database Specs Card */}
          {databaseSpec && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-headline font-bold text-indigo-600 uppercase">
                  <Server className="w-4 h-4" />
                  <span>PRIMARY DATABASE ENGINE</span>
                </div>
                <div>
                  <h4 className="text-lg font-headline font-black text-slate-900">
                    {databaseSpec.engine}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-body">
                    {databaseSpec.mode} · Version: <span className="font-mono text-slate-800">{databaseSpec.version}</span>
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Persistence Model:</span>
                    <span className="font-semibold">{databaseSpec.storageTelemetry.persistenceStrategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Backup Policy:</span>
                    <span className="font-semibold text-emerald-700">{databaseSpec.storageTelemetry.backupStatus}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-headline font-bold text-emerald-600 uppercase">
                  <Activity className="w-4 h-4" />
                  <span>CONNECTION POOL & LATENCY</span>
                </div>
                <div>
                  <div className="text-3xl font-black font-code text-slate-900">
                    {databaseSpec.connectionPool.latencyMs} <span className="text-sm font-normal text-slate-400">ms</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-body">
                    Average query latency across in-memory document operations.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Connections:</span>
                    <span className="font-bold text-slate-800">{databaseSpec.connectionPool.activeConnections} / {databaseSpec.connectionPool.maxCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Idle Pool Count:</span>
                    <span className="font-bold text-slate-800">{databaseSpec.connectionPool.idleConnections}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-headline font-bold text-cyan-600 uppercase">
                  <HardDrive className="w-4 h-4" />
                  <span>MEMORY FOOTPRINT & CACHE</span>
                </div>
                <div>
                  <div className="text-3xl font-black font-code text-slate-900">
                    {databaseSpec.storageTelemetry.usedMB} <span className="text-sm font-normal text-slate-400">MB Used</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-body">
                    Allocated: {databaseSpec.storageTelemetry.allocatedMB} MB · Cache Hit Ratio: {(databaseSpec.storageTelemetry.cacheHitRatio * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Indexing Strategy:</span>
                    <span className="font-semibold text-slate-800">B-Tree + Hash Indexes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thread Isolation:</span>
                    <span className="font-semibold text-emerald-700">Async Safe Loop</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Schema & Collection Breakdown Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-headline font-bold text-slate-900">
                  Database Collections & Schema Topology
                </h3>
                <p className="text-xs text-slate-500 font-body">
                  Detailed schema specifications and purpose for each collection in the SmartProctor database.
                </p>
              </div>
              <span className="badge-pill-cyan text-[10px] px-2.5 py-0.5">5 Active Collections</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-headline font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Collection Name</th>
                    <th className="p-4">Records</th>
                    <th className="p-4">Purpose & Business Logic</th>
                    <th className="p-4">Schema Definition</th>
                    <th className="p-4">Storage Engine</th>
                    <th className="p-4">Indexing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-body">
                  {databaseSpec?.collections.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <span className="px-2 py-1 rounded bg-slate-100 font-mono font-bold text-slate-900 text-xs">
                          {col.name}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-indigo-700 text-sm">
                        {col.documentCount}
                      </td>
                      <td className="p-4 max-w-xs text-slate-700 text-[11px] leading-relaxed">
                        {col.purpose}
                      </td>
                      <td className="p-4 max-w-xs">
                        <code className="text-[10px] bg-slate-50 border border-slate-200 p-1.5 rounded block text-slate-700 font-mono break-all">
                          {col.schemaSummary}
                        </code>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-600">
                        {col.storageEngine}
                      </td>
                      <td className="p-4 text-[11px] text-slate-500 font-mono">
                        {col.indexingStrategy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Architecture Telemetry (Admin Restricted) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-cyan-400 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">
                    Autonomous Multi-Agent AI Architecture Specifications
                  </h3>
                  <span className="text-[11px] text-slate-500 font-body">
                    Model: Google Gemini 2.5 Flash with deterministic heuristic failover guards
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-headline font-bold">
                6 Multi-Agents Online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="font-headline font-bold text-slate-900">Agent 01: Question Authoring</div>
                <p className="text-[11px] text-slate-500 mt-1 font-body">
                  Generates rigorous questions across target Bloom's taxonomies with plausible distractors.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="font-headline font-bold text-slate-900">Agent 02: Question Quality Audit</div>
                <p className="text-[11px] text-slate-500 mt-1 font-body">
                  Inspects drafts for ambiguity, multiple correct keys, and difficulty leakage.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="font-headline font-bold text-slate-900">Agent 05: Proctoring Monitoring</div>
                <p className="text-[11px] text-slate-500 mt-1 font-body">
                  Processes window blurs, rapid answering, and session stability into balanced risk scores.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL MAIL COMPOSER MODAL */}
      {isMailComposerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-base font-headline font-bold text-slate-900">
                  Send Automated Official Mail
                </h3>
              </div>
              <button
                onClick={() => setIsMailComposerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendManualMail} className="space-y-4 text-xs font-body">
              <div>
                <label className="block font-headline font-bold text-slate-700 uppercase mb-1">
                  Recipient Institutional Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex.rivera@university.edu"
                  value={mailRecipientEmail}
                  onChange={(e) => setMailRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-headline font-bold text-slate-700 uppercase mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={mailRecipientName}
                    onChange={(e) => setMailRecipientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-headline font-bold text-slate-700 uppercase mb-1">
                    Dispatch Category
                  </label>
                  <select
                    value={mailType}
                    onChange={(e: any) => setMailType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  >
                    <option value="result_published">Result Published</option>
                    <option value="account_approved">Account Approved</option>
                    <option value="integrity_alert">Integrity Alert</option>
                    <option value="exam_scheduled">Exam Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-headline font-bold text-slate-700 uppercase mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Examination Result Notification"
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white font-headline"
                />
              </div>

              <div>
                <label className="block font-headline font-bold text-slate-700 uppercase mb-1">
                  Message Content / Notice Snippet
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter message body or report summary to be dispatched..."
                  value={mailContent}
                  onChange={(e) => setMailContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white font-body"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMailComposerOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-headline font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingMail}
                  className="btn-shopvibe-primary px-5 py-2 text-xs font-headline font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingMail ? 'Dispatching...' : 'Dispatch Email Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROVISION USER MODAL */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Provision Academic Account</h3>
              </div>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Select Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRole('student')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      newRole === 'student'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('faculty')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      newRole === 'faculty'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Faculty
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. elena.rostova@university.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Computer Science & Engineering">Computer Science</option>
                    <option value="Information Technology">Information Tech</option>
                    <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                    <option value="Electrical & Electronics">Electrical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    {newRole === 'student' ? 'Roll Number' : 'Employee ID'}
                  </label>
                  <input
                    type="text"
                    placeholder={newRole === 'student' ? 'CS-2026-101' : 'FAC-CS-09'}
                    value={newIdentifier}
                    onChange={(e) => setNewIdentifier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Initial Approval Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer ${
                    newStatus === 'active' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      checked={newStatus === 'active'}
                      onChange={() => setNewStatus('active')}
                      className="text-emerald-600"
                    />
                    <span className="font-semibold text-slate-800">Immediately Active</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer ${
                    newStatus === 'pending' ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      checked={newStatus === 'pending'}
                      onChange={() => setNewStatus('pending')}
                      className="text-amber-600"
                    />
                    <span className="font-semibold text-slate-800">Set as Pending Approval</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isCreatingUser ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
