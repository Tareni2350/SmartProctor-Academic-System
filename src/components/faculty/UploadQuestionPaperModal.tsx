import React, { useState } from 'react';
import { Question, Exam } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  FileCode, 
  BookOpen, 
  Layers, 
  Clock, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';

interface UploadQuestionPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: (exam: Exam) => void;
  onQuestionsAddedToBank?: (questions: Question[]) => void;
}

const SAMPLE_QUESTION_PAPERS: Record<string, string> = {
  standard_academic: `DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
ANNUAL SEMESTER EXAMINATION 2026
Course: CS301 - Advanced Data Structures & Algorithms
Time Allowed: 45 Minutes | Maximum Marks: 20

1. What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?
A) O(1)
B) O(log n)
C) O(n)
D) O(n log n)
Answer: C
Explanation: In an unbalanced skewed binary search tree, all elements degrade into a linked list, leading to O(n) worst-case traversal time.

2. Which self-balancing binary search tree guarantees that the heights of two child subtrees of any node differ by at most one?
A) Red-Black Tree
B) AVL Tree
C) B-Tree
D) Splay Tree
Answer: B
Explanation: The strict AVL balance criterion states that the balance factor (height(left) - height(right)) must be in {-1, 0, +1}.

3. In Dijkstra's single-source shortest path algorithm using a Min-Heap priority queue, what is the overall time complexity for a graph with V vertices and E edges?
A) O(V^2)
B) O((V + E) log V)
C) O(E log E)
D) O(V * E)
Answer: B
Explanation: Min-heap operations take O(log V), extracted V times and edges relaxed up to E times, yielding O((V + E) log V).

4. Which algorithm design paradigm is utilized in the Floyd-Warshall all-pairs shortest path computation?
A) Greedy Method
B) Divide and Conquer
C) Dynamic Programming
D) Backtracking
Answer: C
Explanation: Floyd-Warshall solves subproblems of shortest paths using intermediate vertices through dynamic programming memoization.

5. Explain the concept of Amortized Time Complexity in dynamically resizing array structures (e.g., ArrayList/Vector).
Answer: In dynamic arrays, doubling capacity takes O(n) copying time once in a while, but over n insertions the average cost per insertion remains O(1) amortized.
Explanation: The expensive resizing operation happens infrequently enough that the total cost for n appends is bounded by 2n, giving O(1) amortized.`,

  machine_learning: `DEPARTMENT OF ARTIFICIAL INTELLIGENCE & DATA SCIENCE
MID-TERM EVALUATION: MACHINE LEARNING & DEEP NEURAL NETWORKS

1. Which loss function is most commonly used for multi-class classification problems with softmax output?
A) Mean Squared Error (MSE)
B) Categorical Cross-Entropy Loss
C) Binary Hinge Loss
D) Huber Loss
Answer: B
Explanation: Categorical cross-entropy measures the divergence between true one-hot distributions and predicted softmax probabilities.

2. What issue does the Dropout regularization technique primarily address in deep neural networks?
A) Vanishing Gradient
B) Overfitting
C) Exploding Gradient
D) Slow Convergence
Answer: B
Explanation: Dropout randomly deactivates neurons during forward training passes, preventing co-adaptation and reducing overfitting.

3. In Support Vector Machines (SVM), what is the purpose of the Kernel Trick?
A) To reduce the number of support vectors to zero
B) To implicitly project non-linearly separable data into higher-dimensional feature space
C) To normalize feature scales between 0 and 1
D) To eliminate the need for Lagrange multipliers
Answer: B
Explanation: The kernel trick computes inner products in high-dimensional feature space without explicit coordinate transformation.`,

  csv_format: `Question,Option A,Option B,Option C,Option D,Answer,Explanation
"What port does standard HTTP utilize by default?","80","443","8080","21","A","HTTP operates on port 80; HTTPS operates on port 443."
"Which HTTP status code signifies Unauthorized access?","200","401","404","500","B","401 signifies that authentication credentials are missing or invalid."
"Which protocol operates at the Transport Layer of the OSI stack?","IP","TCP","HTTP","DNS","B","TCP and UDP are Transport Layer protocols."`
};

export const UploadQuestionPaperModal: React.FC<UploadQuestionPaperModalProps> = ({
  isOpen,
  onClose,
  onExamCreated,
  onQuestionsAddedToBank
}) => {
  const { currentUser } = useAuth();

  // Wizard Steps: 1 = Upload / Paste, 2 = Review & Configure Exam
  const [step, setStep] = useState<1 | 2>(1);

  // Input state
  const [paperContent, setPaperContent] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Exam Configuration
  const [examTitle, setExamTitle] = useState('Midterm Assessment - Uploaded Question Paper');
  const [courseCode, setCourseCode] = useState('CS301');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science & Engineering');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [defaultMarks, setDefaultMarks] = useState(4);
  const [passingMarks, setPassingMarks] = useState(12);

  // Extracted Questions
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  if (!isOpen) return null;

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setPaperContent(text);
        // Try auto-deriving title from filename
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setExamTitle(baseName.toUpperCase());
      }
    };
    reader.onerror = () => {
      setParseError('Failed to read file. Please ensure it is a valid text, doc, or PDF export file.');
    };
    reader.readAsText(file);
  };

  // Load sample template
  const loadSample = (key: string) => {
    setPaperContent(SAMPLE_QUESTION_PAPERS[key]);
    setSelectedFileName(`sample_${key}.txt`);
    if (key === 'machine_learning') {
      setSubject('Machine Learning & Neural Networks');
      setCourseCode('AI402');
      setExamTitle('AI402: Mid-Term Examination - Deep Learning');
    } else {
      setSubject('Data Structures & Algorithms');
      setCourseCode('CS301');
      setExamTitle('CS301: Algorithmic Rigor Midterm Examination');
    }
  };

  // Parse using AI
  const handleParseQuestions = async () => {
    if (!paperContent.trim()) {
      setParseError('Please upload a file or paste your question paper text first.');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const result = await api.parseQuestionPaper(paperContent, {
        subject,
        defaultMarks: Number(defaultMarks)
      });

      if (!result.questions || result.questions.length === 0) {
        throw new Error('No questions could be extracted. Please check the document format.');
      }

      setParsedQuestions(result.questions);
      // Recalculate passing marks (50% of total)
      const total = result.questions.reduce((sum, q) => sum + (q.marks || 4), 0);
      setPassingMarks(Math.round(total * 0.5));
      setStep(2); // Proceed to review & schedule step
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse questions with AI.');
    } finally {
      setIsParsing(false);
    }
  };

  // Edit question field
  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setParsedQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Remove question
  const removeQuestion = (index: number) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate total marks
  const totalCalculatedMarks = parsedQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  // Save as Exam
  const handleCreateExam = async (publish: boolean) => {
    if (parsedQuestions.length === 0) {
      alert('Cannot create exam without questions.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newExam = await api.createExam({
        title: examTitle,
        courseCode,
        subject,
        department,
        durationMinutes: Number(durationMinutes),
        totalMarks: totalCalculatedMarks,
        passingMarks: Number(passingMarks),
        status: publish ? 'published' : 'draft',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        instructions: [
          `Total duration is ${durationMinutes} minutes.`,
          'Autonomous AI proctoring and anti-tamper telemetry enabled.',
          'Each question has specified marks. Read all options carefully.'
        ],
        syllabus: `Uploaded curriculum assessment covering ${subject}.`,
        questions: parsedQuestions,
        createdBy: currentUser?.name || 'Faculty Instructor',
        enrolledStudentsCount: 35
      });

      onExamCreated(newExam);
      onClose();
    } catch (err: any) {
      alert('Failed to save examination: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add to question bank
  const handleSaveToBank = async () => {
    setIsSubmitting(true);
    try {
      for (const q of parsedQuestions) {
        await api.addQuestion(q);
      }
      onQuestionsAddedToBank?.(parsedQuestions);
      alert(`Successfully imported ${parsedQuestions.length} questions into Question Bank!`);
      onClose();
    } catch (err: any) {
      alert('Failed to import to question bank: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-white flex items-center justify-between font-body">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-headline font-black text-slate-900">
                  Upload Examination Question Paper
                </h3>
                <span className="badge-pill-cyan text-[10px] px-2.5 py-0.5">
                  AI Extractor
                </span>
              </div>
              <p className="text-xs text-slate-500 font-body">
                AI extracts, structures, and validates questions directly from your files or pasted curriculum
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Navigation */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-headline font-bold">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 ${
                step === 1 ? 'text-fuchsia-600 font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-code font-bold ${
                step === 1 ? 'bg-fuchsia-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
              }`}>
                1
              </span>
              <span>Upload Document & Parse</span>
            </button>

            <span className="text-slate-300">→</span>

            <button
              onClick={() => {
                if (parsedQuestions.length > 0) setStep(2);
              }}
              disabled={parsedQuestions.length === 0}
              className={`flex items-center gap-2 ${
                step === 2 ? 'text-fuchsia-600 font-black' : parsedQuestions.length > 0 ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-code font-bold ${
                step === 2 ? 'bg-fuchsia-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
              }`}>
                2
              </span>
              <span>Review Questions & Schedule ({parsedQuestions.length})</span>
            </button>
          </div>

          {step === 2 && (
            <div className="text-xs text-slate-600 font-headline font-semibold">
              Extracted: <strong className="font-code text-fuchsia-600">{parsedQuestions.length} Qs</strong> · Total Marks: <strong className="font-code text-slate-900">{totalCalculatedMarks}</strong>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: UPLOAD / PASTE */}
          {step === 1 && (
            <div className="space-y-6">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Select Question Paper Document (.txt, .doc, .docx, .pdf, .json, .csv)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf,.json,.csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      {selectedFileName ? (
                        <span className="text-indigo-600 font-bold">Selected: {selectedFileName}</span>
                      ) : (
                        <span>Click to browse files or drag and drop examination paper</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports plain text questions, numbered MCQs with options, CSV question tables, and JSON
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Templates Quick-Load */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-medium">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Don't have a file ready? Load sample academic question papers:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadSample('standard_academic')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors text-[11px]"
                  >
                    CS301 Data Structures
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample('machine_learning')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors text-[11px]"
                  >
                    AI402 Deep Learning
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample('csv_format')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors text-[11px]"
                  >
                    CSV Format
                  </button>
                </div>
              </div>

              {/* Text Area for Direct Paste / Editing */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Question Paper Content (Review or Paste directly)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {paperContent.length} characters
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={paperContent}
                  onChange={(e) => setPaperContent(e.target.value)}
                  placeholder={`Paste your question paper here, e.g.:

1. What is the worst-case time complexity of Quick Sort?
A) O(n)
B) O(n log n)
C) O(n^2)
D) O(1)
Answer: C
Explanation: When pivot selection repeatedly picks extreme elements...`}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed transition-all"
                />
              </div>

              {/* Assessment Context */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Target Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Default Marks Per Question
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={defaultMarks}
                    onChange={(e) => setDefaultMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {parseError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: REVIEW PARSED QUESTIONS & CONFIGURE EXAM */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Exam Metadata Card */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Examination Schedule & Specifications</span>
                  </h4>
                  <span className="text-[11px] text-indigo-700 font-semibold">
                    {parsedQuestions.length} Questions Loaded
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Exam Title
                    </label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalCalculatedMarks}
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Parsed Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Extracted Questions Preview ({parsedQuestions.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Click any question to view, edit prompt, or change correct option
                  </span>
                </div>

                <div className="space-y-2.5">
                  {parsedQuestions.map((q, idx) => {
                    const isExpanded = activeAccordion === idx;
                    return (
                      <div
                        key={q.id || idx}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all"
                      >
                        {/* Question Header Accordion */}
                        <div
                          onClick={() => setActiveAccordion(isExpanded ? null : idx)}
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 select-none"
                        >
                          <div className="flex items-center gap-3 overflow-hidden pr-3">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="text-xs font-semibold text-slate-800 truncate">
                              {q.questionText}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                              {q.type}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {q.marks} Marks
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeQuestion(idx);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Question Editor */}
                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                            {/* Question Text */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Question Prompt
                              </label>
                              <textarea
                                rows={2}
                                value={q.questionText}
                                onChange={(e) => updateQuestion(idx, { questionText: e.target.value })}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            {/* Options if MCQ */}
                            {q.type === 'mcq' && q.options && (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                                  Options & Selected Answer Key (Select correct radio button)
                                </label>
                                <div className="space-y-1.5">
                                  {q.options.map((opt, optIdx) => {
                                    const isCorrect = q.correctOptionIndex === optIdx;
                                    const letter = String.fromCharCode(65 + optIdx);
                                    return (
                                      <div
                                        key={optIdx}
                                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                          isCorrect
                                            ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                                            : 'bg-white border-slate-200'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`q-${idx}-key`}
                                          checked={isCorrect}
                                          onChange={() => updateQuestion(idx, { correctOptionIndex: optIdx })}
                                          className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                        />
                                        <span className="font-bold text-xs text-slate-700 w-4">
                                          {letter})
                                        </span>
                                        <input
                                          type="text"
                                          value={opt}
                                          onChange={(e) => {
                                            const newOpts = [...(q.options || [])];
                                            newOpts[optIdx] = e.target.value;
                                            updateQuestion(idx, { options: newOpts });
                                          }}
                                          className="flex-1 bg-transparent border-none text-xs text-slate-800 focus:outline-none"
                                        />
                                        {isCorrect && (
                                          <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                                            Correct Key
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Explanation */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Explanation / Pedagogical Solution
                              </label>
                              <input
                                type="text"
                                value={q.explanation || ''}
                                onChange={(e) => updateQuestion(idx, { explanation: e.target.value })}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/80 flex items-center justify-between font-body">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-headline font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleParseQuestions}
                disabled={isParsing || !paperContent.trim()}
                className="btn-shopvibe-primary px-6 py-2.5 text-xs font-headline font-bold flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isParsing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>AI Parsing Document Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Extract & Parse Questions with AI</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-headline font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Back to Upload
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveToBank}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-headline font-semibold transition-all"
                >
                  Import to Bank
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateExam(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-headline font-semibold transition-all"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateExam(true)}
                  disabled={isSubmitting}
                  className="btn-shopvibe-primary px-5 py-2 text-xs font-headline font-bold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Examination</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
