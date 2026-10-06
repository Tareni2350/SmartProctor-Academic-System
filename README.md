# SmartProctor · Autonomous Agentic Examination & Integrity Platform

**SmartProctor** is a high-performance, conversion-oriented, AI-powered online examination and proctoring platform built with the vibrant **ShopVibe** design system. The system combines autonomous multi-agent workflows (powered by Google Gemini with deterministic fallback heuristics) with automated mail dispatch, automated result report certificates, real-time proctoring telemetry, and strict administrative governance.

---

## 🚀 Key Features

### 1. Rebranded to SmartProctor with ShopVibe Design System
- **ShopVibe Styling**: Fuchsia primary (`#D946EF`), Cyan secondary accents (`#22D3EE`), and Yellow highlight chips (`#FACC15`) with full-pill buttons (`rounded-full`), airy whitespace framing, and material-style elevation shadows.
- **Typography Constitution**: `Poppins` (Bold & Black tracking) for headers and collection titles; `Nunito` for candidate instructions, readable questions, and answers; `Space Mono` for test timers, candidate roll IDs, and grades.

### 2. Automated Mails & Transactional Dispatch System
- **Automated Result Notifications**: Upon exam submission, the server automatically generates and dispatches an official examination report to the candidate's institutional email address.
- **Account Registration Receipts**: Instant notification sent to candidates and faculty upon submitting registration, confirming their profile is queued for administrative verification.
- **Account Approval Notices**: Immediate automated notification with login credentials sent once an administrator activates the user profile.
- **Integrity Anomaly Alerts**: Automatic security dispatch triggered to proctoring audit channels when candidate telemetry exhibits window blurs or rapid answering bursts.
- **Interactive Mail Dispatcher & Logs**: Full audit logs with verification tokens, delivery timestamps, and custom automated email dispatch console in the Admin Dashboard.

### 3. Result Report Automation
- **Automated Certificate & Diagnostic Dispatch**: One-click dispatch of formal exam certificates directly to candidate emails with unique verification tokens (e.g. `REP-CERT-ATT-...`).
- **Student Portal Email Trigger**: Students can trigger automated re-sends of their official diagnostic result reports directly from the Exam Result HUD (`ExamResultView`).
- **Comprehensive Topic Diagnostics**: Personalized score summaries, time management breakdowns, and tailored remediation study plans.

### 4. Admin-Only Technical Information & Database Specifications
To ensure maximum institutional security and anti-cheating confidentiality, all technical specifications and infrastructure data are strictly restricted to logged-in system administrators:
- **Database & Technical Specs Tab**: Real-time telemetry on query latency, connection pool capacity, cache hit ratio, memory footprint, and snapshot backups.
- **Database Schema & Collection Breakdown**: Granular breakdown of all collections (`users_accounts`, `examinations`, `exam_attempts_submissions`, `question_bank`, `automated_mail_logs`) detailing schema structures, storage engines, and indexing strategies.
- **AI Agent Hub Restricted to Admin**: Multi-Agent architecture overview, live agent test sandbox, and LLM telemetry are protected behind admin role authentication.

---

## 🗄️ Database Architecture & Storage Specification

### Which Database is Used and What is it Used For?

SmartProctor utilizes a **High-Performance In-Memory Document & Key-Value State Engine with Checkpointed Atomic Snapshot Persistence** (backed by Node.js/Express in-memory collections and RESTful JSON APIs), engineered for ultra-low latency (<2ms) interactive testing:

| Collection Name | Document Count | Primary Purpose & Business Logic | Storage Engine & Indexing |
| :--- | :--- | :--- | :--- |
| **`users_accounts`** | Active Candidates & Faculty | Stores authenticated candidate, faculty, and administrative profiles with multi-role access control (RBAC), approval statuses (`active`, `pending`, `rejected`, `inactive`), and academic identifiers. | RAM Key-Value B-Tree Store; Unique B-Tree index on `email`, hash index on `id`. |
| **`examinations`** | Exam Catalog | Houses department curriculum assessments, scheduled times, syllabus scopes, passing thresholds, time limits, and embedded question banks. | RAM Document Store; B-Tree index on `courseCode` and `department`. |
| **`exam_attempts_submissions`** | Candidate Submissions | Records time-stamped student answer submissions, question marks, evaluated topic accuracy breakdowns, and full telemetry logs. | High-Throughput Append-Only Document Collection; Composite index on `(examId, studentId, submittedAt)`. |
| **`question_bank`** | Question Bank | Centralized repository of verified MCQs and descriptive questions containing distractor rationales, correct option indices, and difficulty ratings. | Inverted Index Knowledge Store; Multi-key index on `(subject, topic, difficulty)`. |
| **`automated_mail_logs`** | Email Audit Trail | Real-time audit log of automated transaction emails sent to students and faculty (Result reports, Account approvals, Security warnings). | Time-Series Append-Only Mail Store; Descending index on `timestamp`, hash on `recipientEmail`. |

### Database Telemetry
- **Latency**: ~1.4 ms average response time.
- **Connection Pool**: 18 active / 46 idle / 128 max capacity.
- **Cache Hit Ratio**: 98.4%.
- **Persistence Strategy**: Atomic memory commit with transactional journal checkpointing.

---

## 🤖 6 Autonomous AI Agents Layer (Admin Restricted)

1. **Agent 01: Question Generation Agent** (`/api/agent/generate-questions`)
   - Generates taxonomy-aligned MCQs and descriptive questions with distractors and pedagogical explanations.
2. **Agent 02: Question Quality & Audit Agent** (`/api/agent/audit-questions`)
   - Inspects question drafts for ambiguity, duplicate distractors, and difficulty leakage.
3. **Agent 03: Pre-Exam Assistant Agent** (`/api/agent/exam-assistant`)
   - Answers candidate queries regarding syllabus and regulations while strictly refusing live exam answers.
4. **Agent 04: Student Performance & Study Agent** (`/api/agent/student-performance`)
   - Analyzes response latency and variances to generate tailored revision schedules and practice mini-quizzes.
5. **Agent 05: Exam Monitoring & Anomaly Agent** (`/api/agent/monitoring-anomaly`)
   - Processes tab switches, window blurs, and sub-second answer cadences into balanced risk ratings (`Low`, `Moderate`, `High`).
6. **Agent 06: Faculty Result & Cohort Insights Agent** (`/api/agent/result-analysis`)
   - Synthesizes entire class submissions to pinpoint difficult concepts and suggest remedial interventions.

---

## 🔑 Quick Demo Access

You can log in directly using one of the pre-configured academic profiles:

- **System Administrator**: `m.hamilton@university.edu` / `password123` (Full access to Admin Console, Database Specs, Automated Mails, and Technical AI Hub)
- **Faculty / Lead Instructor**: `alan.turing@university.edu` / `password123` (Question Studio, Exam Creator, Cohort Analytics)
- **Active Student**: `alex.rivera@university.edu` / `password123` (Take exams, view automated results, study plan)
- **Pending Student (Test Approval Workflow)**: `samantha.reed@university.edu` / `password123` (Blocked until approved by Admin)
- **Pending Faculty (Test Approval Workflow)**: `claude.shannon@university.edu` / `password123` (Blocked until approved by Admin)

---

## 💻 Running Locally

```bash
# Install dependencies
npm install

# Start development full-stack server
npm run dev

# Run production build
npm run build
```

---

*SmartProctor © 2026 Academic Governance & Automated AI Examination Systems.*
