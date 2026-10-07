import React, { useState, useEffect } from 'react';
import { AutomatedMailLog } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Calendar, 
  RefreshCw, 
  Eye, 
  X, 
  ShieldCheck, 
  Award, 
  ExternalLink,
  Inbox,
  AlertCircle
} from 'lucide-react';

interface AutomatedMailsViewerProps {
  userEmail?: string;
  title?: string;
  description?: string;
  canRefresh?: boolean;
}

export const AutomatedMailsViewer: React.FC<AutomatedMailsViewerProps> = ({
  userEmail,
  title = 'Automated Notifications & Official Mail Inbox',
  description = 'Transactional emails automatically dispatched by the SmartProctor platform (exam scheduling, verified score cards, proctoring warnings).',
  canRefresh = true
}) => {
  const { currentUser } = useAuth();
  const targetEmail = userEmail || currentUser?.email || '';

  const [mails, setMails] = useState<AutomatedMailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMail, setSelectedMail] = useState<AutomatedMailLog | null>(null);

  const fetchMails = async () => {
    setIsLoading(true);
    try {
      if (targetEmail) {
        const data = await api.getUserMailLogs(targetEmail);
        setMails(data);
      } else {
        const data = await api.getMailLogs();
        setMails(data);
      }
    } catch (err) {
      console.error('Failed to load user automated mails:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMails();
  }, [targetEmail]);

  const filteredMails = mails.filter(m => {
    const matchesSearch = 
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.contentSnippet && m.contentSnippet.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.metadata?.examTitle && m.metadata.examTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: AutomatedMailLog['type']) => {
    switch (type) {
      case 'exam_scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Calendar className="w-3 h-3" /> Exam Scheduled
          </span>
        );
      case 'result_published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Award className="w-3 h-3" /> Score Card
          </span>
        );
      case 'strike_warning':
      case 'exam_terminated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3" /> Proctoring Flag
          </span>
        );
      case 'account_approved':
      case 'account_registered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3 h-3" /> Account Notice
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Mail className="w-3 h-3" /> Notification
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-headline font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300 text-xs font-bold font-mono border border-fuchsia-200 dark:border-fuchsia-800">
                {mails.length} {mails.length === 1 ? 'Message' : 'Messages'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-body">
              {description}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Recipient Email:</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-fuchsia-700 dark:text-fuchsia-300">
                {targetEmail}
              </span>
            </div>
          </div>
        </div>

        {canRefresh && (
          <button
            onClick={fetchMails}
            disabled={isLoading}
            className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-headline flex items-center gap-2 transition-colors self-start sm:self-center shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Inbox</span>
          </button>
        )}
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search email subject, syllabus, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Mails' },
            { id: 'exam_scheduled', label: 'Scheduled Exams' },
            { id: 'result_published', label: 'Score Cards' },
            { id: 'strike_warning', label: 'Strike Warnings' },
            { id: 'account_approved', label: 'Account Notices' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mails List View */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-fuchsia-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-body">Retrieving automated email logs...</p>
        </div>
      ) : filteredMails.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Mail className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No automated emails found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery 
              ? 'No notifications match your current search query.' 
              : `No automated mails have been dispatched to ${targetEmail} yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMails.map((mail) => (
            <div
              key={mail.id}
              onClick={() => setSelectedMail(mail)}
              className="group bg-white dark:bg-slate-900 hover:bg-fuchsia-50/30 dark:hover:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-fuchsia-100 dark:group-hover:bg-fuchsia-950 text-slate-600 dark:text-slate-400 group-hover:text-fuchsia-600 flex items-center justify-center shrink-0 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                        SmartProctor Notification System &lt;noreply@smartproctor.edu&gt;
                      </span>
                      {getTypeBadge(mail.type)}
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    </div>
                    <h4 className="text-sm font-headline font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {mail.subject}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto text-xs text-slate-400 dark:text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(mail.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button className="text-fuchsia-600 dark:text-fuchsia-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-xs font-semibold">
                    <span>Read</span>
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {mail.contentSnippet && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 font-body pl-12 border-l-2 border-slate-100 dark:border-slate-800 group-hover:border-fuchsia-300">
                  {mail.contentSnippet}
                </p>
              )}

              {/* Quick metadata pill preview */}
              {mail.metadata && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pl-12">
                  {mail.metadata.examTitle && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      Exam: {mail.metadata.examTitle}
                    </span>
                  )}
                  {mail.metadata.score !== undefined && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold font-mono">
                      Score: {mail.metadata.score}/{mail.metadata.maxMarks} ({mail.metadata.percentage}%)
                    </span>
                  )}
                  {mail.metadata.reportId && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono">
                      Ref: {mail.metadata.reportId}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detailed Email View Modal */}
      {selectedMail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Email Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getTypeBadge(selectedMail.type)}
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Delivered to inbox
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-headline font-bold text-slate-900 dark:text-white">
                  {selectedMail.subject}
                </h3>
              </div>

              <button
                onClick={() => setSelectedMail(null)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Metadata Strip */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">From:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  SmartProctor Academic System &lt;noreply@smartproctor.edu&gt;
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">To:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedMail.recipientName} &lt;{selectedMail.recipientEmail}&gt;
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span>{new Date(selectedMail.timestamp).toLocaleString()}</span>
              </div>
              {selectedMail.metadata?.reportId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Certificate ID:</span>
                  <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold">{selectedMail.metadata.reportId}</span>
                </div>
              )}
            </div>

            {/* Email Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-sm text-slate-800 dark:text-slate-200 font-body leading-relaxed">
              {/* Institutional Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div className="text-xs text-indigo-950 dark:text-indigo-200">
                  <strong>Official University Transactional Dispatch:</strong> This automated correspondence has been verified and registered on the institutional academic examination ledger.
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 whitespace-pre-line text-slate-700 dark:text-slate-300">
                {selectedMail.contentSnippet || 'No additional content provided.'}
              </div>

              {/* Structured Metadata Card if Available */}
              {selectedMail.metadata && Object.keys(selectedMail.metadata).length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-headline font-bold text-slate-500 uppercase tracking-wider">
                    Official Exam Dispatch Data
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    {selectedMail.metadata.examTitle && (
                      <div className="col-span-2">
                        <span className="text-slate-400">Course / Examination:</span>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedMail.metadata.examTitle}</div>
                      </div>
                    )}
                    {selectedMail.metadata.score !== undefined && (
                      <div>
                        <span className="text-slate-400">Candidate Score:</span>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {selectedMail.metadata.score} / {selectedMail.metadata.maxMarks} ({selectedMail.metadata.percentage}%)
                        </div>
                      </div>
                    )}
                    {selectedMail.metadata.passed !== undefined && (
                      <div>
                        <span className="text-slate-400">Qualification:</span>
                        <div className={`font-bold mt-0.5 ${selectedMail.metadata.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {selectedMail.metadata.passed ? 'QUALIFIED · PASSED' : 'NOT QUALIFIED'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Email Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedMail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold font-headline hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
              >
                Close Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
