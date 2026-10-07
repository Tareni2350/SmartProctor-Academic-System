export type UserRole = 'student' | 'faculty' | 'admin';
export type UserStatus = 'active' | 'pending' | 'rejected' | 'inactive';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  avatar: string;
  joinedDate: string;
  identifier?: string;
  notes?: string;
}

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'mcq' | 'descriptive';

export interface Question {
  id: string;
  subject: string;
  topic: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  marks: number;
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  modelAnswer?: string;
  explanation: string;
  auditNotes?: string[];
  flaggedForReview?: boolean;
}

export interface Exam {
  id: string;
  title: string;
  courseCode: string;
  subject: string;
  department: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: 'draft' | 'published' | 'archived';
  scheduledDate: string;
  instructions: string[];
  syllabus: string;
  questions: Question[];
  createdBy: string;
  createdAt: string;
  enrolledStudentsCount: number;
}

export interface StudentAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  descriptiveAnswer?: string;
  isCorrect?: boolean;
  marksAwarded: number;
  timeSpentSeconds: number;
  markedForReview?: boolean;
}

export interface MonitoringEvent {
  timestamp: string;
  type: 'tab_switch' | 'window_blur' | 'rapid_answer' | 'clipboard_attempt' | 'session_reconnect';
  details: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  startedAt: string;
  submittedAt: string;
  timeSpentSeconds: number;
  totalMarksScored: number;
  maxMarks: number;
  percentage: number;
  passed: boolean;
  answers: StudentAnswer[];
  topicBreakdown: {
    topic: string;
    totalQuestions: number;
    correctQuestions: number;
    percentage: number;
  }[];
  monitoringLog: MonitoringEvent[];
  monitoringAnomalyScore?: number;
  monitoringRiskLevel?: 'Low' | 'Moderate' | 'High';
  monitoringSummary?: string;
  isTerminatedForViolation?: boolean;
  strikeCount?: number;
  terminationReason?: string;
}

export interface QuestionAuditResult {
  questionId: string;
  status: 'APPROVED' | 'FLAGGED_WITH_WARNING' | 'CRITICAL_ISSUE';
  qualityScore: number;
  issues: string[];
  suggestions: string[];
  improvedQuestionText?: string;
  improvedOptions?: string[];
}

export interface PerformanceAnalysis {
  agentSummary: string;
  weakTopics: string[];
  strongTopics: string[];
  timeManagementInsight: string;
  studyPlan: {
    day: string;
    focus: string;
    tasks: string[];
  }[];
  practiceQuestions?: {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }[];
}

export interface ProctoringReport {
  anomalyScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  summary: string;
  signalBreakdown: {
    signal: string;
    status: string;
    observation: string;
  }[];
  recommendationForFaculty: string;
}

export interface ClassAnalysis {
  classInsight: string;
  difficultTopics: string[];
  studentsAtRisk: string[];
  pedagogicalRecommendations: string[];
}

export interface SystemStats {
  totalStudents: number;
  totalFaculty: number;
  totalExams: number;
  activeExams: number;
  totalCompletedAttempts: number;
  questionBankSize: number;
  departments: string[];
  aiAgentsActive: number;
}

export interface AutomatedMailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  type: 
    | 'result_published' 
    | 'account_approved' 
    | 'account_registered' 
    | 'exam_scheduled' 
    | 'integrity_alert'
    | 'strike_warning'
    | 'exam_terminated'
    | 'proctoring_clearance'
    | 'faculty_notification'
    | 'admin_notification';
  status: 'delivered' | 'queued' | 'simulated';
  timestamp: string;
  contentSnippet: string;
  metadata?: {
    examTitle?: string;
    score?: number;
    maxMarks?: number;
    percentage?: number;
    passed?: boolean;
    reportId?: string;
    enrolledCount?: number;
    [key: string]: any;
  };
}

export interface DatabaseArchitectureInfo {
  engine: string;
  version: string;
  mode: string;
  collections: {
    name: string;
    documentCount: number;
    purpose: string;
    schemaSummary: string;
    storageEngine: string;
    indexingStrategy: string;
  }[];
  connectionPool: {
    activeConnections: number;
    idleConnections: number;
    maxCapacity: number;
    latencyMs: number;
  };
  storageTelemetry: {
    allocatedMB: number;
    usedMB: number;
    cacheHitRatio: number;
    backupStatus: string;
    persistenceStrategy: string;
  };
}

