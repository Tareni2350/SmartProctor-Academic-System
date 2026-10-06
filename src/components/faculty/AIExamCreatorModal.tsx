import React, { useState } from 'react';
import { Exam } from '../../types';
import { api } from '../../services/api';
import { Sparkles, X, Wand2, BookOpen, Clock, FileCheck, Check } from 'lucide-react';

interface AIExamCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: (newExam: Exam) => void;
  facultyName: string;
}

export const AIExamCreatorModal: React.FC<AIExamCreatorModalProps> = ({
  isOpen,
  onClose,
  onExamCreated,
  facultyName
}) => {
  const [promptText, setPromptText] = useState(
    'Create a 30-minute Machine Learning Midterm exam with 4 MCQs, covering Regression, Decision Trees, and Clustering, with 30% Easy, 50% Medium, 20% Hard.'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftExam, setDraftExam] = useState<Exam | null>(null);

  if (!isOpen) return null;

  const handleGenerateBlueprint = async () => {
    if (!promptText.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const generated = await api.agentCreateExamFromPrompt(promptText, facultyName);
      setDraftExam(generated);
    } catch (err: any) {
      alert('Blueprint generation failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveExam = () => {
    if (draftExam) {
      onExamCreated(draftExam);
      onClose();
    }
  };

  const samplePresets = [
    'Create a 50-mark DBMS exam with 6 MCQs and 1 descriptive, medium difficulty, covering normalization, SQL and transactions.',
    'Draft a 20-minute Data Structures quiz on Binary Trees and Heaps, 4 questions, medium difficulty with explanations.',
    'Build an introductory Python programming diagnostic test with 5 multiple-choice questions on OOP, inheritance, and recursion.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between bg-white font-body">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/20">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-headline font-black text-slate-900">
                  AI Exam Blueprint Agent
                </h3>
                <span className="badge-pill-fuchsia text-[10px] px-2.5 py-0.5">
                  Natural Language
                </span>
              </div>
              <p className="text-xs text-slate-500 font-body">
                Specify syllabus or exam requirements in natural language to construct a complete test blueprint
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

        {/* Prompt Input Section */}
        <div className="p-6 border-b border-slate-200/80 space-y-3 bg-slate-50/70 font-body">
          <label className="block text-xs font-headline font-bold text-slate-700 uppercase tracking-wide">
            Faculty Natural-Language Exam Specification:
          </label>
          <textarea
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="e.g. Create a 40-minute Cloud Computing test with 5 MCQs on AWS, Docker, and Kubernetes with 50% medium difficulty..."
            className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 bg-white text-slate-900 transition-all font-body"
          />

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-headline font-semibold text-slate-400">Quick Prompt Templates:</span>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(preset)}
                  className="text-[11px] font-body bg-white hover:bg-fuchsia-50 hover:text-fuchsia-700 text-slate-600 px-3 py-1 rounded-full text-left transition-all border border-slate-200 hover:border-fuchsia-300 shadow-2xs"
                >
                  {preset.slice(0, 48)}...
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateBlueprint}
              disabled={isProcessing || !promptText.trim()}
              className="btn-shopvibe-primary px-6 py-2.5 text-xs font-headline font-bold flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{isProcessing ? 'Agent Drafting Blueprint...' : 'Draft Examination'}</span>
            </button>
          </div>
        </div>

        {/* Blueprint Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!draftExam ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs">No exam blueprint drafted yet.</p>
              <p className="text-[11px] text-slate-400">
                Click "Draft Examination" to let the agent parse constraints and construct questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">{draftExam.courseCode} · {draftExam.subject}</span>
                  <span className="text-xs font-medium text-indigo-700">{draftExam.durationMinutes} mins · {draftExam.totalMarks} Marks</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{draftExam.title}</h4>
                <p className="text-xs text-slate-600"><strong>Syllabus:</strong> {draftExam.syllabus}</p>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Generated Questions ({draftExam.questions.length})
                </h5>
                {draftExam.questions.map((q, i) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>Question #{i + 1} ({q.difficulty})</span>
                      <span>{q.marks} Marks</span>
                    </div>
                    <div className="text-slate-900 font-semibold">{q.questionText}</div>
                    {q.options && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded border ${
                              oIdx === q.correctOptionIndex
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                : 'bg-slate-50 border-slate-100 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/80 flex items-center justify-between font-body">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-headline font-semibold text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApproveExam}
            disabled={!draftExam}
            className="btn-shopvibe-primary px-6 py-2.5 text-xs font-headline font-bold disabled:opacity-40 flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Publish Examination</span>
          </button>
        </div>
      </div>
    </div>
  );
};
