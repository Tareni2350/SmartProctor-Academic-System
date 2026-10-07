import {
  Exam,
  ExamAttempt,
  Question,
  UserAccount,
  SystemStats,
  AutomatedMailLog,
  DatabaseArchitectureInfo
} from '../types';

export const SEED_USERS: UserAccount[] = [
  {
    id: 'stud-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    status: 'active',
    identifier: 'CS-2025-042',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2025-08-15'
  },
  {
    id: 'fac-201',
    name: 'Dr. Alan Turing',
    email: 'alan.turing@university.edu',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    status: 'active',
    identifier: 'FAC-CS-001',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2024-01-10'
  },
  {
    id: 'adm-301',
    name: 'Dean Margaret Hamilton',
    email: 'm.hamilton@university.edu',
    role: 'admin',
    department: 'Academic Administration',
    status: 'active',
    identifier: 'ADM-EXEC-01',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2023-06-01'
  },
  {
    id: 'stud-102',
    name: 'Samantha Reed',
    email: 'samantha.reed@university.edu',
    role: 'student',
    department: 'Data Science & Artificial Intelligence',
    status: 'active',
    identifier: 'DS-2026-089',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2025-09-01'
  },
  {
    id: 'stud-103',
    name: 'Liam Chen',
    email: 'liam.chen@university.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    status: 'active',
    identifier: 'CS-2025-103',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2025-08-20'
  },
  {
    id: 'stud-104',
    name: 'Priya Patel',
    email: 'priya.patel@university.edu',
    role: 'student',
    department: 'Information Technology',
    status: 'active',
    identifier: 'IT-2025-055',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2025-08-22'
  },
  {
    id: 'stud-105',
    name: 'Marcus Vance',
    email: 'marcus.vance@university.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    status: 'active',
    identifier: 'CS-2025-078',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2025-08-25'
  },
  {
    id: 'fac-202',
    name: 'Prof. Claude Shannon',
    email: 'claude.shannon@university.edu',
    role: 'faculty',
    department: 'Electrical & Information Theory',
    status: 'pending',
    identifier: 'FAC-EIT-012',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2026-02-10',
    notes: 'Visiting faculty onboarding packet submitted.'
  }
];

export const SEED_QUESTIONS: Question[] = [
  {
    id: 'q-dsa-1',
    subject: 'Data Structures & Algorithms',
    topic: 'Binary Trees',
    type: 'mcq',
    difficulty: 'Medium',
    marks: 4,
    questionText: 'What is the maximum number of nodes at level L in a binary tree (assuming root is level 0)?',
    options: ['2^(L - 1)', '2^L', '2^(L + 1) - 1', 'L^2'],
    correctOptionIndex: 1,
    explanation: 'Level 0 has 2^0 = 1 node, level 1 has 2^1 = 2 nodes, and level L has at most 2^L nodes.'
  },
  {
    id: 'q-dsa-2',
    subject: 'Data Structures & Algorithms',
    topic: 'Sorting & Searching',
    type: 'mcq',
    difficulty: 'Easy',
    marks: 3,
    questionText: 'Which sorting algorithm has a worst-case time complexity of O(n log n) and is stable?',
    options: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Selection Sort'],
    correctOptionIndex: 2,
    explanation: 'Merge sort guarantees O(n log n) worst-case time complexity and preserves the relative order of equal elements.'
  },
  {
    id: 'q-dsa-3',
    subject: 'Data Structures & Algorithms',
    topic: 'Graph Algorithms',
    type: 'mcq',
    difficulty: 'Hard',
    marks: 5,
    questionText: "What is the time complexity of Dijkstra's algorithm implemented with a Min-Heap and Adjacency List for V vertices and E edges?",
    options: ['O(V^2)', 'O(E + V log V)', 'O((V + E) log V)', 'O(V * E)'],
    correctOptionIndex: 2,
    explanation: 'With a min-heap and adjacency list, vertex extraction takes O(log V) and edge relaxations take O(E log V), giving O((V + E) log V).'
  },
  {
    id: 'q-dsa-4',
    subject: 'Data Structures & Algorithms',
    topic: 'Hash Tables',
    type: 'mcq',
    difficulty: 'Medium',
    marks: 4,
    questionText: 'In open addressing with linear probing, primary clustering occurs primarily because:',
    options: [
      'Two different keys hash to different values',
      'Long runs of occupied slots build up, increasing average search time',
      'The hash table load factor exceeds 1.0',
      'Secondary hash functions are poorly chosen'
    ],
    correctOptionIndex: 1,
    explanation: 'Linear probing probes consecutive cells i + 1, causing contiguous occupied blocks that grow with each collision.'
  },
  {
    id: 'q-dbms-1',
    subject: 'Database Management Systems',
    topic: 'SQL Joins & Queries',
    type: 'mcq',
    difficulty: 'Medium',
    marks: 4,
    questionText: 'Which SQL JOIN returns all rows from the left table and matched rows from the right table, filling nulls if no match exists?',
    options: ['INNER JOIN', 'LEFT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'],
    correctOptionIndex: 1,
    explanation: 'LEFT OUTER JOIN preserves all rows from the left table unconditionally.'
  },
  {
    id: 'q-dbms-2',
    subject: 'Database Management Systems',
    topic: 'Normalization',
    type: 'mcq',
    difficulty: 'Hard',
    marks: 5,
    questionText: 'A relation R is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:',
    options: ['Y is a prime attribute', 'X is a superkey', 'X is a candidate key and Y is prime', 'R is in 3NF and has no multivalued dependencies'],
    correctOptionIndex: 1,
    explanation: 'BCNF requires that for every functional dependency X -> Y, X must strictly be a superkey of relation R.'
  },
  {
    id: 'q-dbms-3',
    subject: 'Database Management Systems',
    topic: 'Transactions & ACID',
    type: 'mcq',
    difficulty: 'Easy',
    marks: 3,
    questionText: 'Which property of ACID ensures that once a transaction has committed, its changes survive system crashes?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctOptionIndex: 3,
    explanation: 'Durability ensures committed data persists even in the event of power loss or crash, typically guaranteed through WAL.'
  }
];

export const SEED_EXAMS: Exam[] = [
  {
    id: 'exam-dsa-midterm',
    title: 'Data Structures & Algorithms Midterm Exam',
    courseCode: 'CS201',
    subject: 'Data Structures & Algorithms',
    department: 'Computer Science & Engineering',
    durationMinutes: 45,
    totalMarks: 50,
    passingMarks: 25,
    status: 'published',
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    instructions: [
      'Ensure a quiet, well-lit environment and stable connectivity.',
      'Strict 3-Strike Rule Active: Tab switching or window minimization will trigger immediate integrity warnings.',
      'At 3 strikes, your examination is automatically locked, terminated, and awarded 0 marks.',
      'Use the Question Palette to track Attempted, Not Attempted, and Marked for Review questions.'
    ],
    syllabus: 'Binary Trees, BSTs, Sorting & Searching, Graph Algorithms, Hash Tables.',
    questions: [
      SEED_QUESTIONS[0],
      SEED_QUESTIONS[1],
      SEED_QUESTIONS[2],
      SEED_QUESTIONS[3],
      {
        id: 'q-dsa-extra-1',
        subject: 'Data Structures & Algorithms',
        topic: 'Binary Trees',
        type: 'mcq',
        difficulty: 'Easy',
        marks: 4,
        questionText: 'In a complete binary tree of height H, the minimum number of nodes is:',
        options: ['2^H', '2^(H - 1)', '2^(H + 1) - 1', 'H + 1'],
        correctOptionIndex: 0,
        explanation: 'At height H, the previous levels have 2^H - 1 nodes, plus at least 1 node at level H gives 2^H.'
      }
    ],
    createdBy: 'Dr. Alan Turing',
    createdAt: '2026-03-01T10:00:00Z',
    enrolledStudentsCount: 42
  },
  {
    id: 'exam-dbms-assessment',
    title: 'Database Systems & SQL Optimization',
    courseCode: 'CS302',
    subject: 'Database Management Systems',
    department: 'Computer Science & Engineering',
    durationMinutes: 30,
    totalMarks: 35,
    passingMarks: 18,
    status: 'published',
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    instructions: [
      'Read all SQL schemas and constraint requirements carefully.',
      '3-strike tab/blur rule is strictly enforced by the AI proctor.',
      'Mark for review allows reviewing flagged questions before final submission.'
    ],
    syllabus: 'Relational algebra, SQL queries, Normalization (1NF through BCNF), and ACID transaction mechanics.',
    questions: [
      SEED_QUESTIONS[4],
      SEED_QUESTIONS[5],
      SEED_QUESTIONS[6]
    ],
    createdBy: 'Dr. Alan Turing',
    createdAt: '2026-03-05T14:30:00Z',
    enrolledStudentsCount: 38
  }
];

export const SEED_MAILS: AutomatedMailLog[] = [
  {
    id: 'mail-init-1',
    recipientEmail: 'alex.rivera@university.edu',
    recipientName: 'Alex Rivera',
    subject: '[Exam Scheduled] CS201: Data Structures & Algorithms Midterm Exam is Ready to Attempt',
    type: 'exam_scheduled',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    contentSnippet: 'Your examination "Data Structures & Algorithms Midterm Exam" (CS201) has been scheduled by faculty instructor Dr. Alan Turing. Duration: 45 min, 5 Questions (50 Marks). 3-Strike Rule Active: 3 infractions (tab switches, webcam lost, background noise) will automatically submit your exam.',
    metadata: {
      examTitle: 'Data Structures & Algorithms Midterm Exam',
      maxMarks: 50,
      reportId: 'SCHED-CS201'
    }
  },
  {
    id: 'mail-init-2',
    recipientEmail: 'alex.rivera@university.edu',
    recipientName: 'Alex Rivera',
    subject: '[Official Exam Result] CS301: Advanced Data Structures Midterm Score Card',
    type: 'result_published',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    contentSnippet: 'Dear Alex Rivera, your official examination result for CS301 has been evaluated. Score: 22/26 (85%) · QUALIFIED. AI Diagnostic Feedback: Excellent mastery of Graph algorithms and Dynamic Programming. Weakness identified in AVL Tree double rotations.',
    metadata: {
      examTitle: 'CS301: Advanced Data Structures & Algorithms',
      score: 22,
      maxMarks: 26,
      percentage: 85,
      passed: true,
      reportId: 'REP-CS301-RIV'
    }
  },
  {
    id: 'mail-init-3',
    recipientEmail: 'alex.rivera@university.edu',
    recipientName: 'Alex Rivera',
    subject: '[Proctoring Audit] Live Camera & Environment Verification Verified',
    type: 'proctoring_clearance',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    contentSnippet: 'System notice: Environment audio/video pre-flight test passed. Zero proctoring strikes recorded for your test session.',
    metadata: {
      reportId: 'AUD-ENV-091'
    }
  },
  {
    id: 'mail-init-4',
    recipientEmail: 'samantha.reed@university.edu',
    recipientName: 'Samantha Reed',
    subject: '[Account Status] Welcome to SmartProctor Portal · Student Profile Active',
    type: 'account_approved',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    contentSnippet: 'Welcome Samantha Reed! Your student credentials have been confirmed by Academic Administration. You may now access enrolled tests and practice sessions.',
    metadata: {
      reportId: 'ACC-DS-089'
    }
  },
  {
    id: 'mail-init-5',
    recipientEmail: 'samantha.reed@university.edu',
    recipientName: 'Samantha Reed',
    subject: '[Exam Scheduled] CS201: Data Structures & Algorithms Midterm Exam is Ready to Attempt',
    type: 'exam_scheduled',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    contentSnippet: 'Your examination "Data Structures & Algorithms Midterm Exam" (CS201) has been scheduled. Duration: 45 min, 5 Questions (50 Marks). Proctoring rules and AI anomaly monitoring active.',
    metadata: {
      examTitle: 'Data Structures & Algorithms Midterm Exam',
      maxMarks: 50,
      reportId: 'SCHED-CS201'
    }
  },
  {
    id: 'mail-init-6',
    recipientEmail: 'liam.chen@university.edu',
    recipientName: 'Liam Chen',
    subject: '[Exam Scheduled] CS201: Data Structures & Algorithms Midterm Exam is Ready to Attempt',
    type: 'exam_scheduled',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    contentSnippet: 'Your examination "Data Structures & Algorithms Midterm Exam" has been scheduled for your enrolled section.',
    metadata: {
      examTitle: 'Data Structures & Algorithms Midterm Exam',
      maxMarks: 50
    }
  },
  {
    id: 'mail-init-7',
    recipientEmail: 'alan.turing@university.edu',
    recipientName: 'Dr. Alan Turing',
    subject: '[Faculty Dispatch] Automated Exam Notifications Sent to 5 Enrolled Candidates',
    type: 'faculty_notification',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    contentSnippet: 'Instructor Confirmation: Examination notification emails containing syllabus, 3-strike rules, and attempt link were automatically dispatched to all 5 verified enrolled students in CS201.',
    metadata: {
      examTitle: 'Data Structures & Algorithms Midterm Exam',
      enrolledCount: 5
    }
  },
  {
    id: 'mail-init-8',
    recipientEmail: 'alan.turing@university.edu',
    recipientName: 'Dr. Alan Turing',
    subject: '[AI Agent Audit] Question Paper Quality Check: 100% Validated',
    type: 'faculty_notification',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    contentSnippet: 'AI Question Quality & Audit Agent has verified your midterm paper. Ambiguity score: 0%, Distractor quality: High, Answer key validated.',
    metadata: {
      examTitle: 'Data Structures & Algorithms Midterm Exam'
    }
  },
  {
    id: 'mail-init-9',
    recipientEmail: 'm.hamilton@university.edu',
    recipientName: 'Dean Margaret Hamilton',
    subject: '[Admin Telemetry] Daily Examination & Academic Audit Digest',
    type: 'admin_notification',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    contentSnippet: 'System summary: 5 enrolled candidates, 2 faculty members, 2 examinations conducted with 0 critical security breaches.',
    metadata: {
      reportId: 'SYS-AUDIT-TODAY'
    }
  }
];

// Local Storage Keys
const KEY_USERS = 'smartproctor_users_v2';
const KEY_EXAMS = 'smartproctor_exams_v2';
const KEY_SUBMISSIONS = 'smartproctor_submissions_v2';
const KEY_MAILS = 'smartproctor_mails_v2';

export function getLocalUsers(): UserAccount[] {
  try {
    const data = localStorage.getItem(KEY_USERS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  localStorage.setItem(KEY_USERS, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

export function saveLocalUsers(users: UserAccount[]): void {
  localStorage.setItem(KEY_USERS, JSON.stringify(users));
}

export function getLocalExams(): Exam[] {
  try {
    const data = localStorage.getItem(KEY_EXAMS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  localStorage.setItem(KEY_EXAMS, JSON.stringify(SEED_EXAMS));
  return SEED_EXAMS;
}

export function saveLocalExams(exams: Exam[]): void {
  localStorage.setItem(KEY_EXAMS, JSON.stringify(exams));
}

export function getLocalSubmissions(): ExamAttempt[] {
  try {
    const data = localStorage.getItem(KEY_SUBMISSIONS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveLocalSubmissions(subs: ExamAttempt[]): void {
  localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(subs));
}

export function getLocalMailLogs(): AutomatedMailLog[] {
  try {
    const data = localStorage.getItem(KEY_MAILS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  localStorage.setItem(KEY_MAILS, JSON.stringify(SEED_MAILS));
  return SEED_MAILS;
}

export function addLocalMailLog(mail: Omit<AutomatedMailLog, 'id' | 'timestamp' | 'status'>): AutomatedMailLog {
  const current = getLocalMailLogs();
  const newLog: AutomatedMailLog = {
    id: `mail-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    ...mail,
    status: 'delivered',
    timestamp: new Date().toISOString()
  };
  current.unshift(newLog);
  localStorage.setItem(KEY_MAILS, JSON.stringify(current));
  return newLog;
}
