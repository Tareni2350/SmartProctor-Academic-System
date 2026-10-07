import React, { useState } from 'react';
import { Exam } from '../../types';
import { api } from '../../services/api';
import { Bot, Send, X, ShieldAlert, Sparkles, BookOpen, Clock, FileText } from 'lucide-react';

interface ExamAssistantModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  isLiveExam?: boolean;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const ExamAssistantModal: React.FC<ExamAssistantModalProps> = ({
  exam,
  isOpen,
  onClose,
  isLiveExam = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello! I am your AI Exam Assistant for "${exam.title}". You can ask me anything about the syllabus, exam duration, number of questions, grading criteria, or permitted attempt policies before you begin.`,
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setIsLoading(true);

    try {
      const reply = await api.agentAskExamAssistant({
        message: userMsg,
        exam,
        isLiveExam
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Apologies, I encountered a temporary connection issue. Please verify your query or proceed to the exam instructions.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'What specific topics are in the syllabus?',
    'What is the passing score and total marks?',
    'How does the anti-cheating monitoring work?',
    'Can I navigate back and forth between questions?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white font-body">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-headline font-black text-slate-900 leading-tight">
                  AI Exam Tutor & Regulation Assistant
                </h3>
                <span className="badge-pill-fuchsia text-[10px] px-2.5 py-0.5">
                  Guidance
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-body">
                {exam.courseCode} · {exam.title}
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

        {/* Live Exam Notice */}
        {isLiveExam && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-800 font-body">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Integrity Guard Active:</strong> Content answers are disabled during an active exam attempt.
            </span>
          </div>
        )}

        {/* Key Exam Meta Strip */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200/60 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-body">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-fuchsia-600" />
            Duration: <strong className="font-code font-bold text-slate-900">{exam.durationMinutes} mins</strong>
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-fuchsia-600" />
            Total: <strong className="font-code font-bold text-slate-900">{exam.totalMarks} marks</strong> (Pass: {exam.passingMarks})
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-yellow-600" />
            Questions: <strong className="font-code font-bold text-slate-900">{exam.questions.length}</strong>
          </span>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-body">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'btn-shopvibe-primary text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/70'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 font-code">
                {m.time}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 w-fit">
              <Sparkles className="w-4 h-4 text-fuchsia-500 animate-spin" />
              <span>AI Exam Assistant is analyzing syllabus & regulations...</span>
            </div>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="px-6 py-2.5 border-t border-slate-100 bg-slate-50/70 font-body">
          <div className="text-[11px] font-headline font-semibold text-slate-400 mb-1.5">
            Recommended Prompts:
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInputText(q)}
                className="text-[11px] font-body bg-white border border-slate-200 hover:border-fuchsia-300 hover:text-fuchsia-700 px-3 py-1 rounded-full text-slate-600 transition-all text-left shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200/80 bg-white flex items-center gap-2 font-body">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about syllabus, time limit, question count, scoring..."
            className="flex-1 px-4 py-2.5 text-sm rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 text-slate-900 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="btn-shopvibe-primary px-5 py-2.5 text-xs font-headline font-bold flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
