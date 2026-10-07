# SmartProctor · AI Examination & Proctoring Platform

SmartProctor is a secure, modern online examination and AI proctoring platform built for educational institutions. It features automated transactional notifications, real-time proctoring with a 3-strike violation termination rule, rich question palettes, and an intuitive ShopVibe interface.

---

## 🛠️ Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, RESTful APIs
- **Database**: In-Memory Document & Key-Value Database Engine
- **AI & Proctoring**: Google Gemini 3.8 Flash (`@google/genai`) with heuristic proctoring algorithms
- **Email Service**: Automated Transactional Mail Dispatcher & Real-Time Audit Log

---

## 🗄️ Which Database Are We Using?

SmartProctor uses a **High-Performance In-Memory Document & Key-Value Database Engine** with structured schemas and RESTful persistence endpoints.

### Why this database?
- **Sub-2ms Latency**: Delivers instant query and write speeds needed for live testing, rapid timer synchronizations, and concurrent question switching.
- **Zero-Lag Proctoring**: Real-time telemetry events (window blurs, tab switches, rapid responses) are logged immediately without external database bottlenecks.
- **Organized Collections**:
  1. `users_accounts` — Candidate, faculty, and administrator profiles with status controls (`active`, `pending`).
  2. `examinations` — Courses, syllabi, question papers, duration, and passing marks.
  3. `exam_attempts_submissions` — Submitted student responses, scores, question times, and proctoring telemetry.
  4. `question_bank` — Verified MCQ and descriptive question repository.
  5. `automated_mail_logs` — Transactional email history with delivery status and incident report IDs.

---

## 🌟 Key Features

### 1. 📧 Automated Email Notifications
- **Exam Scheduled & Ready to Attempt**: Whenever an exam is published or scheduled, enrolled students automatically receive an email with exam duration, total questions, passing score, and proctoring policies.
- **Faculty 1-Click Dispatch**: Faculty can re-send automated notifications to candidates directly from their dashboard with the "Notify Students" button.
- **Automated Result Reports**: Students immediately receive an official result scorecard with topic diagnostic scores upon finishing the test.
- **Violation Alerts**: Automated urgent incident notifications are triggered when an exam is terminated under integrity violations.

### 2. 🚨 3-Strike Violation Termination Rule
- **Continuous Focus Monitoring**: Detects when candidates switch browser tabs, minimize windows, or lose viewport focus.
- **Strikes 1 & 2**: Immediate warning notifications and an on-screen dialog showing recorded strikes and cautioning the student.
- **Strike 3 (Automatic Termination)**: Reaching 3 strikes immediately locks the examination, terminates the session, awards 0 marks, and sends a violation report to the academic integrity committee.

### 3. 🎯 Exam Question Status Indicators
The interactive question palette and confirmation dialog provide real-time visual tracking across 5 distinct states:
- 🟢 **Attempted**: Question has been answered and saved.
- 🟠 **Not Attempted**: Question was visited/viewed by the candidate but left blank.
- 🟣 **Marked for Review (Without Answer)**: Flagged for later review without any answer selected.
- 🟣🟢 **Marked for Review (With Answer)**: Question answered and flagged for later review (purple badge with green indicator dot).
- ⚪ **Not Visited**: Question has not yet been opened.
- 🔲 **Current Question**: Highlighted with an active focus ring.

Students can also use **"Mark for Review & Next"** to quickly flag questions and advance.

---

## 👤 Demo User Accounts

You can sign in directly with the following pre-configured credentials (password: `password123` for all):

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Student** | `alex.rivera@university.edu` | Take scheduled exams, view live indicators, study agent |
| **Faculty** | `alan.turing@university.edu` | Create exams, notify students, AI question generator, cohort stats |
| **Admin** | `m.hamilton@university.edu` | Approve accounts, view database specs, audit automated mail logs |

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Start development server (Port 3000)
npm run dev

# 3. Build for production
npm run build
```

---

*SmartProctor © 2026 Academic Integrity & Online Examination Systems.*
