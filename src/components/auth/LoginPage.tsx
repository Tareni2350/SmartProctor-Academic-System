import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Lock, 
  Mail, 
  User, 
  IdCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, register } = useAuth();

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

  // Helper to fill credentials for testing without bypassing the normal sign-in flow
  const handleFillCredentials = (fillEmail: string) => {
    setEmail(fillEmail);
    setPassword('password123');
    setErrorMessage(null);
    setPendingNotice(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setPendingNotice(null);

    try {
      const result = await login(email.trim(), password);
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
      setErrorMessage(err.message || 'Unable to connect to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRegSuccessUser(null);

    try {
      const result = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        department: regDepartment,
        identifier: regIdentifier.trim() || `${regRole === 'student' ? 'STU' : 'FAC'}-${Math.floor(1000 + Math.random() * 9000)}`
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Brand Icon */}
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-fuchsia-500 to-pink-500 text-white shadow-md shadow-fuchsia-500/25 ring-4 ring-white">
          <Sparkles className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-headline font-black text-slate-900 tracking-tight">
          Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-500">Proctor</span> Portal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-body">
          Institutional Examination, Proctoring & Result System
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg shadow-slate-200/50 border border-slate-200 rounded-3xl space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-full border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setPendingNotice(null);
              }}
              className={`flex-1 py-2 text-xs font-headline font-bold rounded-full transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-fuchsia-600 text-white shadow-xs'
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
              className={`flex-1 py-2 text-xs font-headline font-bold rounded-full transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-fuchsia-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register New Profile
            </button>
          </div>

          {/* Pending Approval Notice Banner */}
          {pendingNotice && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2.5 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-headline font-bold text-amber-950 text-sm">
                    Account Awaiting Administrative Approval
                  </div>
                  <p className="text-amber-800 leading-relaxed font-body">
                    The profile for <strong>{pendingNotice.userName}</strong> ({pendingNotice.role.toUpperCase()}) with email <em>{pendingNotice.email}</em> has been submitted and is currently <strong>Pending Verification</strong> by an Academic Administrator.
                  </p>
                  <p className="text-[11px] text-amber-700">
                    To maintain exam integrity, all candidates and faculty must be approved before access is granted.
                  </p>
                </div>
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
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-emerald-950 text-sm">
                    Registration Submitted Successfully!
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Profile created for <strong>{regSuccessUser.name}</strong> as a <strong>{regSuccessUser.role.toUpperCase()}</strong>.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>STATUS: PENDING ADMIN APPROVAL</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 pt-1">
                    Your profile has been forwarded to the Administrative Verification queue. Once approved, you can sign in with your email and password.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SIGN IN FORM (Normal Sign In Flow) */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-headline">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-headline">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Default demo password: <code className="font-mono text-slate-600">password123</code>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white rounded-xl text-xs font-headline font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
              >
                {isLoading ? (
                  <span>Authenticating Account...</span>
                ) : (
                  <>
                    <span>Sign In to Academic Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Convenient Quick-Fill Chips for Form Testing */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block mb-2">
                  Auto-fill demo credentials into form:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('alex.rivera@university.edu')}
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-headline font-bold text-emerald-950 truncate">Alex Rivera</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">Student</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFillCredentials('alan.turing@university.edu')}
                    className="p-2 rounded-xl border border-fuchsia-200 bg-fuchsia-50/60 hover:bg-fuchsia-100/70 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-headline font-bold text-fuchsia-950 truncate">Dr. Turing</div>
                    <div className="text-[10px] text-fuchsia-700 font-semibold">Faculty</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFillCredentials('m.hamilton@university.edu')}
                    className="p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-headline font-bold text-purple-950 truncate">Dean Hamilton</div>
                    <div className="text-[10px] text-purple-700 font-semibold">Admin</div>
                  </button>
                </div>
              </div>
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
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      regRole === 'student'
                        ? 'border-fuchsia-500 bg-fuchsia-50/70 ring-2 ring-fuchsia-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-headline font-bold text-slate-900">Student</div>
                      <div className="text-[10px] text-slate-500">Exams & Scorecards</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('faculty')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      regRole === 'faculty'
                        ? 'border-fuchsia-500 bg-fuchsia-50/70 ring-2 ring-fuchsia-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-headline font-bold text-slate-900">Faculty</div>
                      <div className="text-[10px] text-slate-500">Authoring & Analytics</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-headline">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-headline">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Department & Identifier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-headline">
                    Department
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Mathematics & Computing">Mathematics & Computing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-headline">
                    {regRole === 'student' ? 'Roll Number' : 'Employee ID'}
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={regIdentifier}
                      onChange={(e) => setRegIdentifier(e.target.value)}
                      placeholder={regRole === 'student' ? 'e.g. CS-2026-114' : 'e.g. FAC-IT-204'}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 font-headline">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Approval Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Admin Approval Required:</strong> All newly submitted profiles require administrative approval before exam access is permitted.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white rounded-xl text-xs font-headline font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
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
        </div>
      </div>
    </div>
  );
};
