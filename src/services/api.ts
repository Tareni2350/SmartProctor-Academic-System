import {
  Exam,
  ExamAttempt,
  Question,
  QuestionAuditResult,
  PerformanceAnalysis,
  ProctoringReport,
  ClassAnalysis,
  UserAccount,
  SystemStats,
  AutomatedMailLog,
  DatabaseArchitectureInfo
} from '../types';

export const api = {
  // Exams
  async getExams(): Promise<Exam[]> {
    const res = await fetch('/api/exams');
    const data = await res.json();
    return data.exams || [];
  },

  async getExamById(id: string): Promise<Exam> {
    const res = await fetch(`/api/exams/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch exam');
    return data.exam;
  },

  async createExam(examData: Partial<Exam>): Promise<Exam> {
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create exam');
    return data.exam;
  },

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
    const res = await fetch(`/api/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update exam');
    return data.exam;
  },

  async deleteExam(id: string): Promise<void> {
    const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete exam');
  },

  async notifyExamScheduled(id: string): Promise<{ success: boolean; notifiedCount: number; message: string }> {
    const res = await fetch(`/api/exams/${id}/notify-students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to dispatch exam notifications');
    return data;
  },

  // Submissions
  async submitExam(
    examId: string,
    submission: {
      studentId: string;
      studentName: string;
      studentEmail: string;
      answers: any[];
      timeSpentSeconds: number;
      monitoringLog: any[];
      isTerminatedForViolation?: boolean;
      strikeCount?: number;
      terminationReason?: string;
    }
  ): Promise<ExamAttempt> {
    const res = await fetch(`/api/exams/${examId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit exam');
    return data.attempt;
  },

  async getSubmissions(query?: { studentId?: string; examId?: string }): Promise<ExamAttempt[]> {
    const params = new URLSearchParams();
    if (query?.studentId) params.append('studentId', query.studentId);
    if (query?.examId) params.append('examId', query.examId);

    const res = await fetch(`/api/submissions?${params.toString()}`);
    const data = await res.json();
    return data.submissions || [];
  },

  async getSubmissionById(id: string): Promise<{ attempt: ExamAttempt; exam: Exam }> {
    const res = await fetch(`/api/submissions/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch submission');
    return { attempt: data.attempt, exam: data.exam };
  },

  // Question Bank
  async getQuestions(): Promise<Question[]> {
    const res = await fetch('/api/questions');
    const data = await res.json();
    return data.questions || [];
  },

  async addQuestion(question: Partial<Question>): Promise<Question> {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });
    const data = await res.json();
    return data.question;
  },

  // Users & Stats
  async getUsers(): Promise<UserAccount[]> {
    const res = await fetch('/api/users');
    const data = await res.json();
    return data.users || [];
  },

  async login(credentials: { email: string; password?: string }): Promise<{ success: boolean; user?: UserAccount; error?: string; status?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error, status: data.status, user: data.user };
    }
    return { success: true, user: data.user };
  },

  async register(userData: {
    name: string;
    email: string;
    password?: string;
    role: 'student' | 'faculty' | 'admin';
    department: string;
    identifier?: string;
  }): Promise<{ success: boolean; message?: string; user?: UserAccount; error?: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error };
    }
    return { success: true, message: data.message, user: data.user };
  },

  async approveUser(userId: string, action: 'approve' | 'reject', notes?: string): Promise<UserAccount> {
    const res = await fetch('/api/users/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update approval status');
    return data.user;
  },

  async createUser(userData: {
    name: string;
    email: string;
    password?: string;
    role: string;
    department: string;
    identifier?: string;
    autoApprove?: boolean;
  }): Promise<UserAccount> {
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');
    return data.user;
  },

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'pending' | 'rejected'): Promise<UserAccount> {
    const res = await fetch('/api/users/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status })
    });
    const data = await res.json();
    return data.user;
  },

  // Faculty Agent: Parse Question Paper (File / Text)
  async parseQuestionPaper(content: string, options?: { subject?: string; defaultMarks?: number }): Promise<{
    questions: Question[];
    count: number;
    method?: string;
  }> {
    const res = await fetch('/api/agent/parse-question-paper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        subject: options?.subject || 'Curriculum Assessment',
        defaultMarks: options?.defaultMarks || 4
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to parse question paper');
    return {
      questions: data.questions || [],
      count: data.count || 0,
      method: data.method
    };
  },

  async getSystemStats(): Promise<SystemStats> {
    const res = await fetch('/api/system/stats');
    const data = await res.json();
    return data.stats;
  },

  // ==========================
  // AI AGENTS
  // ==========================

  // Agent 1: Question Generation
  async agentGenerateQuestions(params: {
    subject: string;
    topic: string;
    difficulty: string;
    count: number;
    questionType?: string;
  }): Promise<{ questions: Question[]; fallback?: boolean }> {
    const res = await fetch('/api/agent/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Question generation failed');
    return { questions: data.questions, fallback: data.fallback };
  },

  // Agent 2: Question Quality Audit
  async agentAuditQuestions(questions: Question[]): Promise<QuestionAuditResult[]> {
    const res = await fetch('/api/agent/audit-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Audit failed');
    return data.audits || [];
  },

  // Agent 3: Natural Language Exam Creator
  async agentCreateExamFromPrompt(promptText: string, facultyName: string): Promise<Exam> {
    const res = await fetch('/api/agent/exam-creator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptText, facultyName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Exam creation failed');
    return data.exam;
  },

  // Agent 4: Student Performance & Study Plan
  async agentAnalyzePerformance(payload: {
    studentName: string;
    examTitle: string;
    marks: number;
    totalMarks: number;
    answers: any[];
    questions: any[];
    examHistory?: any[];
  }): Promise<PerformanceAnalysis> {
    const res = await fetch('/api/agent/student-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Performance analysis failed');
    return data.analysis;
  },

  // Agent 5: Proctoring Monitoring & Anomaly Evaluator
  async agentEvaluateMonitoring(payload: {
    studentName: string;
    examTitle: string;
    blurCount: number;
    rapidAnswerCount: number;
    timeSpentSeconds: number;
    totalQuestions: number;
    anomalyLog: any[];
  }): Promise<ProctoringReport> {
    const res = await fetch('/api/agent/monitoring-anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Monitoring evaluation failed');
    return data.proctoringReport;
  },

  // Agent 6: Pre-Exam Assistant
  async agentAskExamAssistant(payload: {
    message: string;
    exam: Exam;
    isLiveExam?: boolean;
  }): Promise<string> {
    const res = await fetch('/api/agent/exam-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Assistant failed');
    return data.reply;
  },

  // Agent 7: Class Result Analysis for Faculty
  async agentAnalyzeClassResults(examId: string, examTitle: string): Promise<{
    stats: any;
    insights: ClassAnalysis;
  }> {
    const res = await fetch('/api/agent/result-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId, examTitle })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Class analysis failed');
    return { stats: data.stats, insights: data.insights };
  },

  // Admin Only: Automated Mail Logs
  async getMailLogs(): Promise<AutomatedMailLog[]> {
    const res = await fetch('/api/admin/mail-logs');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch mail logs');
    return data.mailLogs || [];
  },

  // Admin & Faculty: Trigger Manual Automated Mail
  async sendAutomatedMail(payload: {
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    type?: AutomatedMailLog['type'];
    contentSnippet?: string;
    metadata?: any;
  }): Promise<AutomatedMailLog> {
    const res = await fetch('/api/admin/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send mail');
    return data.log;
  },

  // Admin & Faculty: Automated Result Report Dispatch
  async dispatchResultReport(submissionId: string): Promise<{ message: string; mailLog: AutomatedMailLog }> {
    const res = await fetch('/api/admin/dispatch-result-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to dispatch result report');
    return { message: data.message, mailLog: data.mailLog };
  },

  // Admin Only: Database Architecture Specification
  async getDatabaseSpec(): Promise<DatabaseArchitectureInfo> {
    const res = await fetch('/api/admin/database-spec');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch database specification');
    return data.spec;
  }
};
