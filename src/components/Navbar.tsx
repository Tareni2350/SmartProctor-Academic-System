import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Cpu, 
  ChevronDown, 
  Check, 
  LogOut,
  Sparkles,
  Layers,
  Zap,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateToApprovals?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onNavigateToApprovals }) => {
  const { currentUser, activeRole, setRole, switchUser, allUsers, pendingCount, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  if (!currentUser) {
    return (
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-fuchsia-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/25 ring-2 ring-white">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-headline font-black tracking-tight text-slate-900 leading-tight">
                  Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-500">Proctor</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  AI Core v2.8
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium font-body block leading-tight">
                Online Examination & Automated Proctoring Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Institutional Secure Network</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const roleLabels: Record<UserRole, { title: string; subtitle: string; icon: React.ReactNode }> = {
    student: { title: 'Student Portal', subtitle: 'Exams & Study Plans', icon: <GraduationCap className="w-4 h-4 text-emerald-500" /> },
    faculty: { title: 'Faculty Studio', subtitle: 'Questions & Analytics', icon: <BookOpen className="w-4 h-4 text-fuchsia-500" /> },
    admin: { title: 'Admin Console', subtitle: 'System & Governance', icon: <ShieldCheck className="w-4 h-4 text-cyan-600" /> },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 rounded-xl group transition-transform active:scale-95"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-fuchsia-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/25 ring-2 ring-white group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-headline font-black tracking-tight text-slate-900 leading-tight">
                    Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-500">Proctor</span>
                  </span>
                  <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                    Proctor+
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium font-body block leading-tight">
                  Autonomous Multi-Agent Academic Portal
                </span>
              </div>
            </button>

            {/* ShopVibe Pill Nav Tabs */}
            <nav className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-slate-200" aria-label="Portal Selection">
              <button
                onClick={() => {
                  setRole('student');
                  onSelectTab('dashboard');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-headline font-bold rounded-full transition-all ${
                  activeRole === 'student' && currentTab !== 'agents'
                    ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className={`w-3.5 h-3.5 ${activeRole === 'student' && currentTab !== 'agents' ? 'text-white' : 'text-emerald-500'}`} />
                <span>Student</span>
              </button>

              <button
                onClick={() => {
                  setRole('faculty');
                  onSelectTab('dashboard');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-headline font-bold rounded-full transition-all ${
                  activeRole === 'faculty' && currentTab !== 'agents'
                    ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className={`w-3.5 h-3.5 ${activeRole === 'faculty' && currentTab !== 'agents' ? 'text-white' : 'text-fuchsia-500'}`} />
                <span>Faculty</span>
              </button>

              <button
                onClick={() => {
                  setRole('admin');
                  onSelectTab('dashboard');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-headline font-bold rounded-full transition-all ${
                  activeRole === 'admin' && currentTab !== 'agents'
                    ? 'bg-fuchsia-500 text-white shadow-sm shadow-fuchsia-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${activeRole === 'admin' && currentTab !== 'agents' ? 'text-white' : 'text-cyan-500'}`} />
                <span>Admin</span>
              </button>

              {/* Technical AI Agents Hub - Admin Only! */}
              {activeRole === 'admin' && (
                <button
                  onClick={() => onSelectTab('agents')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-headline font-bold rounded-full transition-all ${
                    currentTab === 'agents'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm shadow-cyan-500/30'
                      : 'bg-cyan-50/80 text-cyan-900 hover:bg-cyan-100 border border-cyan-200/60'
                  }`}
                  title="Technical Architecture & Multi-Agent Telemetry (Admin Restricted)"
                >
                  <Cpu className={`w-3.5 h-3.5 ${currentTab === 'agents' ? 'text-white' : 'text-cyan-600'}`} />
                  <span>AI Technical Hub</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {/* Admin Pending Approvals Notification Badge - ShopVibe Tertiary Yellow Highlight */}
            {currentUser.role === 'admin' && pendingCount > 0 && (
              <button
                onClick={() => {
                  onSelectTab('dashboard');
                  onNavigateToApprovals?.();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-yellow-300 hover:bg-yellow-400 text-amber-950 text-xs font-headline font-black shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse"
                title={`${pendingCount} profiles awaiting approval`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-700" />
                <span>{pendingCount} Pending{pendingCount > 1 ? 's' : ''}</span>
              </button>
            )}

            {/* AI Status Badge */}
            <div className="hidden xl:flex items-center gap-2 text-xs font-bold font-headline px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>5 Agents Active</span>
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1 pl-2 pr-2.5 rounded-full border border-slate-200 hover:border-fuchsia-300 bg-white transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 shadow-xs hover:shadow-sm"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-fuchsia-500/40"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <div className="text-xs font-headline font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-fuchsia-600 font-semibold uppercase tracking-wider leading-tight">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-76 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-[10px] font-headline font-extrabold text-slate-400 uppercase tracking-wider">
                        ACTIVE PROFILE
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-fuchsia-400"
                        />
                        <div className="overflow-hidden">
                          <div className="text-sm font-headline font-bold text-slate-900 truncate">{currentUser.name}</div>
                          <div className="text-xs text-slate-500 font-body truncate">{currentUser.email}</div>
                          {currentUser.identifier && (
                            <div className="text-[10px] font-mono text-fuchsia-600 font-bold bg-fuchsia-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                              {currentUser.identifier}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2 border-b border-slate-100 text-[10px] text-slate-400 font-headline font-extrabold uppercase tracking-wider">
                      SWITCH ACTIVE ACCOUNT
                    </div>

                    <div className="p-2 space-y-1 max-h-56 overflow-y-auto">
                      {allUsers.map((user) => {
                        const isCurrent = user.id === currentUser.id;
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              switchUser(user.id);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                              isCurrent ? 'bg-fuchsia-50 text-fuchsia-950 border border-fuchsia-200' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                              />
                              <div>
                                <div className="text-xs font-headline font-bold text-slate-900 flex items-center gap-1.5">
                                  {user.name}
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                    user.status === 'pending'
                                      ? 'bg-amber-100 text-amber-900'
                                      : user.role === 'admin'
                                      ? 'bg-cyan-100 text-cyan-800'
                                      : user.role === 'faculty'
                                      ? 'bg-fuchsia-100 text-fuchsia-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {user.status === 'pending' ? 'Pending' : user.role}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-body truncate max-w-[150px]">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-fuchsia-600" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 mt-2 pt-2 px-2 space-y-1">
                      <button
                        onClick={() => {
                          onSelectTab('agents');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-headline font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 rounded-xl transition-colors"
                      >
                        <Cpu className="w-4 h-4 text-cyan-600" />
                        <span>Inspect 5 Agentic Workflows</span>
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-headline font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out (Return to Login)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Sign Out Pill */}
            <button
              onClick={logout}
              className="p-2 sm:px-3 sm:py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors text-xs font-headline font-semibold flex items-center gap-1.5"
              title="Sign Out to Login Page"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

