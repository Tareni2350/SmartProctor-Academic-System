import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  IdCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, register, allUsers, loginAs } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<{
    userName: string;
    role: string;
    email: string;
  } | null>(null);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('password123');
  const [regRole, setRegRole] = useState<'student' | 'faculty'>('student');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regSuccessUser, setRegSuccessUser] = useState<any | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setPendingNotice(null);

    try {
      const result = await login(email, password);
      if (result.success) {
        onLoginSuccess?.();
      } else {
        if (result.status === 'pending') {
          setPendingNotice({
            userName: result.user?.name || 'Applicant',
            role: result.user?.role || 'User',
            email: email
          });
        } else {
          setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRegSuccessUser(null);

    try {
      const result = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        department: regDepartment,
        identifier: regIdentifier || `${regRole === 'student' ? 'STU' : 'FAC'}-${Math.floor(1000 + Math.random() * 9000)}`
      });

      if (result.success) {
        setRegSuccessUser(result.user);
      } else {
        setErrorMessage(result.error || 'Failed to submit registration.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration service unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
    setIsLoading(true);
    setErrorMessage(null);
    setPendingNotice(null);

    const result = await login(userEmail, 'password123');
    setIsLoading(false);
    if (result.success) {
      onLoginSuccess?.();
    } else if (result.status === 'pending') {
      setPendingNotice({
        userName: result.user?.name || 'Applicant',
        role: result.user?.role || 'User',
        email: userEmail
      });
    } else {
      setErrorMessage(result.error || 'Login failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Icon */}
        <div className="inline-flex p-3.5 rounded-3xl bg-gradient-to-tr from-fuchsia-600 via-fuchsia-500 to-cyan-400 text-white shadow-lg shadow-fuchsia-500/25 ring-4 ring-white">
          <Sparkles className="w-8 h-8" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-headline font-black text-slate-900 tracking-tight">
          Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-500">Proctor</span> Portal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-body">
          Unified Multi-Role Online Examination, Automated Reports & Integrity System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg shadow-slate-200/50 border border-slate-200/80 rounded-3xl space-y-6">
          {/* ShopVibe Pill Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100/90 rounded-full border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setPendingNotice(null);
              }}
              className={`flex-1 py-2.5 text-xs font-headline font-bold rounded-full transition-all ${
                mode === 'signin'
                  ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setPendingNotice(null);
              }}
              className={`flex-1 py-2.5 text-xs font-headline font-bold rounded-full transition-all ${
                mode === 'register'
                  ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register New Profile
            </button>
          </div>

          {/* Pending Approval Notice Banner */}
          {pendingNotice && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-headline font-bold text-amber-950 text-sm">
                    Account Awaiting Administrative Approval
                  </div>
                  <p className="text-amber-800 leading-relaxed font-body">
                    The profile for <strong>{pendingNotice.userName}</strong> ({pendingNotice.role.toUpperCase()}) with email <em>{pendingNotice.email}</em> has been submitted and is currently <strong>Pending Verification</strong> by an Academic Administrator.
                  </p>
                  <p className="text-[11px] text-amber-700">
                    To maintain institutional exam integrity, students and faculty must be verified by the admin before signing in.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-amber-700">Want to test approval workflow now?</span>
                <button
                  onClick={() => handleQuickDemoLogin('m.hamilton@university.edu')}
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-full font-headline font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Log in as Admin to Approve</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Registration Success Banner */}
          {regSuccessUser && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-emerald-950 text-sm">
                    Registration Submitted Successfully!
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Profile created for <strong>{regSuccessUser.name}</strong> as a <strong>{regSuccessUser.role.toUpperCase()}</strong> in <em>{regSuccessUser.department}</em>.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>STATUS: PENDING ADMIN APPROVAL</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 pt-1">
                    Your account has been forwarded to the Academic Administrator's Pending Queue. Once approved, you can sign in with your email and password.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => {
                    setEmail(regSuccessUser.email);
                    setMode('signin');
                    setRegSuccessUser(null);
                  }}
                  className="text-emerald-800 hover:text-emerald-950 font-semibold underline"
                >
                  Back to Sign In Form
                </button>

                <button
                  onClick={() => handleQuickDemoLogin('m.hamilton@university.edu')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Log in as Admin to Approve Now</span>
                </button>
              </div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex.rivera@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>Default demo password: <code className="font-mono text-slate-600">password123</code></span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-5 btn-shopvibe-primary text-xs font-headline font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
              >
                {isLoading ? (
                  <span>Authenticating Candidate...</span>
                ) : (
                  <>
                    <span>Sign In to Academic Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && !regSuccessUser && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-headline">
                  Select Academic Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegRole('student')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      regRole === 'student'
                        ? 'border-fuchsia-500 bg-fuchsia-50/70 ring-2 ring-fuchsia-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-headline font-bold text-slate-900">Student Profile</div>
                      <div className="text-[10px] text-slate-500">Exams & Adaptive Tutoring</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('faculty')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      regRole === 'faculty'
                        ? 'border-fuchsia-500 bg-fuchsia-50/70 ring-2 ring-fuchsia-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-headline font-bold text-slate-900">Faculty Studio</div>
                      <div className="text-[10px] text-slate-500">Exam Authoring & Analytics</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. elena.rostova@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Department & Identifier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Department
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Mathematics & Computing">Mathematics & Computing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    {regRole === 'student' ? 'Student Roll Number' : 'Faculty Employee ID'}
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={regIdentifier}
                      onChange={(e) => setRegIdentifier(e.target.value)}
                      placeholder={regRole === 'student' ? 'e.g. CS-2026-114' : 'e.g. FAC-IT-204'}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Approval Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Admin Approval Required:</strong> All newly submitted student and faculty profiles are placed in the Administrative Verification queue. The Academic Administrator must approve your profile before examination access is permitted.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-5 btn-shopvibe-primary text-xs font-headline font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
              >
                {isLoading ? (
                  <span>Submitting Profile for Admin Review...</span>
                ) : (
                  <>
                    <span>Submit Profile for Admin Approval</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* QUICK DEMO PERSONA SELECTOR */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">
                Quick Demo Personas (Instant Access)
              </span>
              <span className="text-[10px] text-slate-400">Pre-configured accounts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex.rivera@university.edu')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Alex"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-900 truncate">Alex Rivera</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">Active Student</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alan.turing@university.edu')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="Alan"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-900 truncate">Dr. Alan Turing</div>
                    <div className="text-[10px] text-indigo-700 font-semibold">Active Faculty</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('m.hamilton@university.edu')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                    alt="Margaret"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-900 truncate">Dean Hamilton</div>
                    <div className="text-[10px] text-amber-700 font-semibold">System Admin</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Test Pending Approval Accounts */}
            <div className="pt-2">
              <div className="text-[11px] text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Test "Pending Approval" Login Gatekeeper:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('samantha.reed@university.edu')}
                  className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left text-amber-900 font-medium truncate"
                >
                  ⏳ Samantha Reed (Pending Student)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('claude.shannon@university.edu')}
                  className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left text-amber-900 font-medium truncate"
                >
                  ⏳ Prof. Shannon (Pending Faculty)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
