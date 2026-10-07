import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Cpu, 
  ChevronDown, 
  LogOut,
  Sparkles,
  Shield,
  UserCheck,
  Mail,
  X
} from 'lucide-react';
import { AutomatedMailsViewer } from './common/AutomatedMailsViewer';
import { api } from '../services/api';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateToApprovals?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onNavigateToApprovals }) => {
  const { currentUser, activeRole, pendingCount, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isInboxDrawerOpen, setIsInboxDrawerOpen] = useState(false);
  const [unreadMailCount, setUnreadMailCount] = useState<number>(0);

  useEffect(() => {
    if (currentUser?.email) {
      api.getUserMailLogs(currentUser.email)
        .then(logs => setUnreadMailCount(logs.length))
        .catch(() => {});
    }
  }, [currentUser]);

  // If not logged in, render original clean minimal public header banner
  if (!currentUser) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/25 ring-2 ring-white">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-headline font-black tracking-tight text-slate-900 leading-tight">
                  Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-500">Proctor</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200">
                  Secure Portal
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium font-body block leading-tight">
                Online Examination & AI Proctoring Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Institutional Network Active</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name in original fuchsia theme */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/25 ring-2 ring-white">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-headline font-black tracking-tight text-slate-900 leading-tight">
                      Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-500">Proctor</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium font-body block leading-tight">
                    Academic Assessment System
                  </span>
                </div>
              </div>

              {/* STRICT ROLE ISOLATION: Show active user's dedicated portal badge */}
              <div className="hidden sm:flex items-center pl-4 border-l border-slate-200">
                {activeRole === 'student' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-headline font-bold">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student Portal</span>
                    <span className="text-emerald-400">·</span>
                    <span className="text-[11px] font-normal text-emerald-700">Examinations & Scorecards</span>
                  </div>
                )}

                {activeRole === 'faculty' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-50 text-fuchsia-900 border border-fuchsia-200/80 text-xs font-headline font-bold">
                    <BookOpen className="w-3.5 h-3.5 text-fuchsia-600" />
                    <span>Faculty Studio</span>
                    <span className="text-fuchsia-400">·</span>
                    <span className="text-[11px] font-normal text-fuchsia-700">Question Authoring & Cohort Analytics</span>
                  </div>
                )}

                {activeRole === 'admin' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectTab('dashboard')}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-headline font-bold transition-all cursor-pointer ${
                        currentTab === 'dashboard'
                          ? 'bg-fuchsia-600 text-white shadow-xs'
                          : 'bg-fuchsia-50 text-fuchsia-900 hover:bg-fuchsia-100 border border-fuchsia-200'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Console</span>
                    </button>

                    <button
                      onClick={() => onSelectTab('agents')}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-headline font-bold transition-all cursor-pointer ${
                        currentTab === 'agents'
                          ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                      title="Inspect Multi-Agent Architecture"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>AI Architecture</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Action Menu */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Automated Mails Inbox Button */}
              <button
                onClick={() => setIsInboxDrawerOpen(true)}
                className="relative p-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
                title="View Automated Mails & Dispatches"
              >
                <Mail className="w-4 h-4 text-fuchsia-600" />
                {unreadMailCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-fuchsia-600 text-white text-[10px] font-bold font-mono flex items-center justify-center animate-pulse">
                    {unreadMailCount}
                  </span>
                )}
              </button>

              {/* Admin Pending Badge */}
              {activeRole === 'admin' && pendingCount > 0 && (
                <button
                  onClick={() => {
                    onSelectTab('dashboard');
                    onNavigateToApprovals?.();
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-headline font-bold border border-amber-300 transition-all cursor-pointer"
                  title={`${pendingCount} candidates awaiting approval`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  <span>{pendingCount} Pending</span>
                </button>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 pl-2 pr-2.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 shadow-xs cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-200"
                  />
                  <div className="hidden sm:block text-left pr-1">
                    <div className="text-xs font-headline font-bold text-slate-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold leading-tight">
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
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="text-[10px] font-headline font-extrabold text-slate-400 uppercase tracking-wider">
                          AUTHENTICATED SESSION
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-fuchsia-400"
                          />
                          <div className="overflow-hidden">
                            <div className="text-sm font-headline font-bold text-slate-900 truncate">
                              {currentUser.name}
                            </div>
                            <div className="text-xs text-slate-500 font-body truncate">
                              {currentUser.email}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                currentUser.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : currentUser.role === 'faculty'
                                  ? 'bg-fuchsia-100 text-fuchsia-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {currentUser.role}
                              </span>
                              {currentUser.identifier && (
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {currentUser.identifier}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500">
                          Department: <span className="font-semibold text-slate-700">{currentUser.department}</span>
                        </div>
                      </div>

                      <div className="pt-2 px-2 space-y-1">
                        <button
                          onClick={() => {
                            setIsInboxDrawerOpen(true);
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-headline font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                          <Mail className="w-4 h-4 text-fuchsia-500" />
                          <span>My Automated Mails ({unreadMailCount})</span>
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-headline font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out (Return to Login)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Direct Sign Out Button */}
              <button
                onClick={logout}
                className="px-3 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors text-xs font-headline font-semibold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                title="Sign Out to Login Page"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Slide-Over Modal for Automated Mails Inbox */}
      {isInboxDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-fuchsia-600 text-white flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-slate-900">
                    Automated Notifications Inbox
                  </h3>
                  <p className="text-xs text-slate-500 font-body">
                    Official emails dispatched to {currentUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsInboxDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AutomatedMailsViewer
              userEmail={currentUser.email}
              title={`Dispatches for ${currentUser.name}`}
              description="Review all examination invitations, score card dispatches, and proctoring logs delivered to your account."
            />
          </div>
        </div>
      )}
    </>
  );
};
