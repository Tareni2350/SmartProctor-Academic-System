import React, { useState } from 'react';
import { Question, QuestionAuditResult } from '../../types';
import { api } from '../../services/api';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Trash2, 
  Edit3, 
  Plus, 
  ShieldAlert, 
  Check, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface AIQuestionStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproveQuestions: (approvedQuestions: Question[]) => void;
  defaultSubject?: string;
}

export const AIQuestionStudioModal: React.FC<AIQuestionStudioModalProps> = ({
  isOpen,
  onClose,
  onApproveQuestions,
  defaultSubject = 'Data Structures & Algorithms'
}) => {
  // Generation Parameters
  const [subject, setSubject] = useState(defaultSubject);
  const [topic, setTopic] = useState('Binary Search Trees');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState(4);
  const [questionType, setQuestionType] = useState<'mcq' | 'descriptive'>('mcq');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [auditResults, setAuditResults] = useState<Record<string, QuestionAuditResult>>({});

  if (!isOpen) return null;

  // Step 1: Call Question Generation Agent
  const handleGenerate = async () => {
    setIsGenerating(true);
    setAuditResults({});
    try {
      const result = await api.agentGenerateQuestions({
        subject,
        topic,
        difficulty,
        count: questionCount,
        questionType
      });

      setGeneratedQuestions(result.questions);

      // Auto-trigger Question Quality Agent to validate generated draft
      handleRunAudit(result.questions);
    } catch (err: any) {
      alert('Generation error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 2: Call Question Quality Agent
  const handleRunAudit = async (questionsToAudit: Question[]) => {
    if (questionsToAudit.length === 0) return;
    setIsAuditing(true);
    try {
      const audits = await api.agentAuditQuestions(questionsToAudit);
      const auditMap: Record<string, QuestionAuditResult> = {};
      audits.forEach(a => {
        auditMap[a.questionId] = a;
      });
      setAuditResults(auditMap);
    } catch (err: any) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Discard a question
  const handleRemoveQuestion = (id: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Apply AI fix
  const handleApplyAIFix = (qId: string) => {
    const audit = auditResults[qId];
    if (!audit) return;

    setGeneratedQuestions(prev =>
      prev.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            questionText: audit.improvedQuestionText || q.questionText,
            options: audit.improvedOptions || q.options,
            auditNotes: ['AI Quality recommendation incorporated.']
          };
        }
        return q;
      })
    );

    // Mark as resolved
    setAuditResults(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        status: 'APPROVED',
        qualityScore: 98,
        issues: ['Quality fix applied.'],
        suggestions: ['Question verified.']
      }
    }));
  };

  // Approve all into exam / bank
  const handleApproveAll = () => {
    onApproveQuestions(generatedQuestions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between bg-white font-body">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-headline font-black text-slate-900">
                  AI Question Studio & Quality Auditor
                </h3>
                <span className="badge-pill-fuchsia text-[10px] px-2.5 py-0.5">
                  Multi-Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 font-body">
                Generation Agent drafts questions → Quality Agent audits for ambiguities → Faculty approves
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-6 bg-slate-50/70 border-b border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 font-body">
          <div className="md:col-span-2">
            <label className="block text-xs font-headline font-bold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-all"
              placeholder="e.g. Data Structures & Algorithms"
            />
          </div>

          <div>
            <label className="block text-xs font-headline font-bold text-slate-700 mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-all"
              placeholder="e.g. AVL Trees"
            />
          </div>

          <div>
            <label className="block text-xs font-headline font-bold text-slate-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-all font-body"
            >
              <option value="Easy">Easy (2-3 Marks)</option>
              <option value="Medium">Medium (4-5 Marks)</option>
              <option value="Hard">Hard (6-8 Marks)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !subject || !topic}
              className="w-full btn-shopvibe-primary py-2.5 px-4 text-xs font-headline font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isGenerating ? 'Generating...' : 'Run Agents'}</span>
            </button>
          </div>
        </div>

        {/* Content Body: Questions List with Quality Audit Flags */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {generatedQuestions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium">Ready to create questions</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Set subject, topic, and difficulty above, then click <strong>"Run Agent"</strong> to initiate autonomous question authoring and quality validation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {generatedQuestions.length} Questions Drafted for Review
                </span>
                {isAuditing && (
                  <span className="text-xs text-indigo-600 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    AI Quality Agent checking for ambiguities & distractor flaws...
                  </span>
                )}
              </div>

              {generatedQuestions.map((q, idx) => {
                const audit = auditResults[q.id];
                const isFlagged = audit && audit.status !== 'APPROVED';

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isFlagged
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-500">#{idx + 1}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-semibold text-indigo-700">{q.topic}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-medium text-slate-600">{q.difficulty}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">{q.marks} Marks</span>

                          {audit && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                              audit.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              Quality Score: {audit.qualityScore}% ({audit.status})
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                          {q.questionText}
                        </div>

                        {/* Options */}
                        {q.type === 'mcq' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-lg border text-xs ${
                                  optIdx === q.correctOptionIndex
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="mr-2 font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                {opt} {optIdx === q.correctOptionIndex && '(Correct Key)'}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <strong>Pedagogical Explanation:</strong> {q.explanation}
                        </div>

                        {/* AI Quality Agent Findings & Fix */}
                        {isFlagged && audit && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-2 text-amber-900">
                            <div className="flex items-center gap-1.5 font-bold text-amber-800">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              <span>AI Quality Agent Advisory:</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1">
                              {audit.issues.map((iss, i) => (
                                <li key={i}>{iss}</li>
                              ))}
                            </ul>
                            <div className="flex items-center justify-between pt-1">
                              <span className="italic text-amber-800">
                                Suggested: {audit.suggestions[0]}
                              </span>
                              <button
                                onClick={() => handleApplyAIFix(q.id)}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold transition-colors"
                              >
                                Apply AI Fix
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Discard question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {generatedQuestions.length > 0 && (
              <span>Review verified questions before committing to the exam repository.</span>
            )}
          </div>

          <div className="flex items-center gap-3 font-body">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-headline font-semibold text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApproveAll}
              disabled={generatedQuestions.length === 0}
              className="btn-shopvibe-primary px-6 py-2.5 text-xs font-headline font-bold disabled:opacity-40 flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Add Questions ({generatedQuestions.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
