# SmartProctor · AI Examination & Proctoring Platform

A fast, reliable online examination and AI proctoring platform featuring automated transactional email notifications, live proctoring with a 3-strike termination rule, and specialized AI agents.

---

## 🛠️ Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, RESTful APIs
- **Database**: High-Speed In-Memory Document & Key-Value Store (sub-2ms latency for live test sessions & zero-lag telemetry)
- **AI Engine**: Google Gemini 3.8 Flash (`@google/genai`)
- **Email Dispatcher**: Automated Transactional Mailer with live audit logging

---

## 🗄️ Which Database Are We Using?

SmartProctor uses an **In-Memory Document & Key-Value Database Engine** running directly in the Node.js service layer.

### Why this Database?
- **Ultra-Fast Speed (< 2ms)**: Guarantees zero lag during high-frequency exam actions (timer updates, rapid question navigation, autosaves).
- **Real-Time Proctoring Telemetry**: Tab blur, window switch, and clipboard events are recorded instantly without external network latency.
- **Structured Collections**:
  - `users_accounts`: Candidate, faculty, and administrator profiles.
  - `examinations`: Scheduled exams, syllabi, questions, and durations.
  - `exam_attempts_submissions`: Student answers, scores, timestamps, and violation logs.
  - `question_bank`: Curated MCQ and descriptive questions.
  - `automated_mail_logs`: Real-time transactional emails and delivery audit trail.

---

## 🤖 AI Agents Used in the Project

SmartProctor integrates **7 specialized AI Agents** built with Gemini 3.8 Flash to automate academic workflows:

1. **Question Generation Agent**: Generates academic-rigor MCQs and descriptive questions based on subject, topic, and difficulty with distractors and explanations.
2. **Question Quality & Audit Agent**: Inspects questions for ambiguous wording, duplicate options, correct answer keys, and difficulty calibration.
3. **Exam Creator Agent**: Converts plain natural language requests from faculty into complete exam blueprints (e.g. *"Create a 50-mark DBMS exam with 6 MCQs on normalization"*).
4. **Student Performance & Study Agent**: Analyzes past tests and weak topics to generate a multi-day recovery study plan and targeted practice questions.
5. **Real-Time Proctoring & Anomaly Agent**: Evaluates proctoring telemetry (window blurs, answer cadence), generates an objective risk score (Low / Moderate / High), and provides evidentiary audit notes.
6. **Pre-Exam Syllabus & Rules Assistant**: Answers student questions about syllabus, time limits, and test policies before the exam (strictly locked during live exams for integrity).
7. **Faculty Cohort Result Insights Agent**: Analyzes class submissions to identify common misconceptions, difficult topics, and students needing remedial assistance.

---

## 📧 Automated Email Notifications

- **Exam Scheduled & Ready to Attempt**: Whenever an exam is published or scheduled, enrolled students automatically receive an email with exam duration, total questions, passing score, and instructions.
- **Faculty 1-Click Dispatch**: Faculty can trigger or resend automated exam notifications directly from their dashboard using the **"Notify Students (Automated Mail)"** button.
- **Instant Result Scorecard**: Students automatically receive an email with their marks, percentage, and diagnostic breakdown upon submission.
- **Academic Violation Incident Email**: An urgent email alert is automatically dispatched if a student's session is terminated due to proctoring violations.

---

## 🚨 3-Strike Violation Termination Rule

To ensure strict academic integrity without human proctor bottlenecks:
- **Detection**: Continuous browser focus and window visibility tracking.
- **Strike 1 & 2**: Immediate warning notifications with an on-screen dialog explaining the violation.
- **Strike 3 (Automatic Termination)**: On the third violation:
  - The exam session is immediately locked and submitted.
  - The attempt is flagged with 0 marks.
  - An automated violation report is sent to the academic integrity committee.

---

## 🎯 Exam Question Status Indicators

The exam palette displays live status indicators so students always know their progress:

| Indicator | Status | Description |
| :---: | :--- | :--- |
| 🟢 | **Attempted** | Question has been answered and saved |
| 🟠 | **Not Attempted** | Question was visited/opened but left blank |
| 🟣 | **Marked for Review (Without Answer)** | Question flagged for later review without an answer |
| 🟣🟢 | **Marked for Review (With Answer)** | Question answered and flagged for later review (purple badge with green dot) |
| ⚪ | **Not Visited** | Question has not yet been opened |
| 🔲 | **Current Question** | Currently active question with focus outline |

*Quick Action: Students can use the **"Mark for Review & Next"** button to flag and advance in one click.*

---

## 👤 Demo Login Credentials

All accounts share the password: `password123`

| Role | Email | Highlights |
| :--- | :--- | :--- |
| **Student** | `alex.rivera@university.edu` | Take scheduled exams, test 3-strike rule, view question palette |
| **Faculty** | `alan.turing@university.edu` | Create exams, AI question generator, notify students via automated mail |
| **Admin** | `m.hamilton@university.edu` | Approve accounts, view live database collections & email logs |

---

## 🚀 Installation & Deployment

### Vercel / Production Deployment Note
If deploying to Vercel or environments with strict npm peer-dependency resolution, an `.npmrc` file with `legacy-peer-deps=true` has been included, and `esbuild` is aligned with Vite 8 to prevent `ERESOLVE` errors.

### Local Run:
```bash
# 1. Install dependencies
npm install

# 2. Run dev server (Port 3000)
npm run dev

# 3. Build for production
npm run build
```

