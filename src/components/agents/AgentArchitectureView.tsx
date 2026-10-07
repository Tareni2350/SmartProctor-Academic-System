import React, { useState } from 'react';
import { api } from '../../services/api';
import { 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Bot, 
  Layers, 
  ArrowRight, 
  Play, 
  Terminal, 
  FileText, 
  HelpCircle,
  BarChart3,
  BookOpen
} from 'lucide-react';

export const AgentArchitectureView: React.FC = () => {
  const [activeAgentId, setActiveAgentId] = useState<string>('agent-1');

  // Interactive Live Testing Playground
  const [testTopic, setTestTopic] = useState('Dynamic Programming');
  const [testSubject, setTestSubject] = useState('Algorithms');
  const [testDifficulty, setTestDifficulty] = useState('Medium');
  const [testOutput, setTestOutput] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const agents = [
    {
      id: 'agent-1',
      number: '01',
      name: 'Question Generation Agent',
      role: 'Autonomous Content Authoring',
      description: 'Generates rigorous, taxonomically aligned multiple-choice and descriptive questions with distractors, correct keys, and pedagogical explanations.',
      inputs: ['Subject & Topic Classification', 'Difficulty Target (Easy / Medium / Hard)', 'Question Type & Count constraints'],
      outputs: ['Structured JSON questions', 'Plausible distractors', 'Explanations & references'],
      badge: 'Curriculum & Faculty'
    },
    {
      id: 'agent-2',
      number: '02',
      name: 'Question Quality & Audit Agent',
      role: 'Psychometric & Semantic Integrity',
      description: 'Audits question drafts for ambiguities, multi-correct keys, duplicate questions, distractor leakage, and difficulty mismatch before faculty publication.',
      inputs: ['Draft Question Objects', 'Answer Keys & Explanations'],
      outputs: ['Quality Score (0-100%)', 'Flagged Issues List', 'Autonomous Semantic Correction Suggestions'],
      badge: 'Quality Assurance'
    },
    {
      id: 'agent-3',
      number: '03',
      name: 'Pre-Exam Assistant Agent',
      role: 'Syllabus & Protocol Guidance',
      description: 'Answers candidate inquiries about syllabus, grading weights, and duration while enforcing strict integrity barriers (will not answer live exam questions).',
      inputs: ['Candidate Query', 'Exam Syllabus & Regulations', 'Active Exam Session State'],
      outputs: ['Structured Regulatory Clarifications', 'Integrity Enforcement Blocks'],
      badge: 'Student Assistant'
    },
    {
      id: 'agent-4',
      number: '04',
      name: 'Student Performance & Study Agent',
      role: 'Personalized Diagnostic & Remediation',
      description: 'Analyzes response speed, topic accuracy variances, and previous exam trajectories to synthesize diagnostic commentary, tailored revision schedules, and practice questions.',
      inputs: ['Student Answers & Timing per Question', 'Topic Breakdown', 'Exam History'],
      outputs: ['Diagnostic Insight Statement', 'Day-by-Day Revision Plan', 'Targeted Practice Mini-Quiz'],
      badge: 'Adaptive Tutoring'
    },
    {
      id: 'agent-5',
      number: '05',
      name: 'Exam Monitoring & Anomaly Agent',
      role: 'Objective Non-Punitive Integrity Auditing',
      description: 'Processes window blur events, tab switches, and sub-second answer speeds into an objective anomaly score and evidentiary summary for instructor review.',
      inputs: ['Telemetry Log', 'Window Focus Durations', 'Question Response Times'],
      outputs: ['Anomaly Risk Score (0-100)', 'Risk Bracket (Low / Moderate / High)', 'Evidentiary Summary for Faculty Review'],
      badge: 'Integrity Proctoring'
    },
    {
      id: 'agent-6',
      number: '06',
      name: 'Cohort Performance Analysis Agent',
      role: 'Pedagogical & Class Insights',
      description: 'Synthesizes entire cohort submission data to identify conceptually difficult questions, flag students at risk, and recommend pedagogical adjustments.',
      inputs: ['Cohort Exam Submissions', 'Question Discrimination Metrics'],
      outputs: ['Class Diagnostic Narrative', 'Hardest Concepts List', 'Target Remedial Actions'],
      badge: 'Faculty Analytics'
    }
  ];

  const handleTestAgent = async (agentId: string) => {
    setIsExecuting(true);
    setTestOutput(null);
    try {
      if (agentId === 'agent-1' || agentId === 'agent-2') {
        const res = await api.agentGenerateQuestions({
          subject: testSubject,
          topic: testTopic,
          difficulty: testDifficulty,
          count: 2
        });
        if (agentId === 'agent-2') {
          const audits = await api.agentAuditQuestions(res.questions);
          setTestOutput({ generatedDrafts: res.questions, qualityAudit: audits });
        } else {
          setTestOutput(res);
        }
      } else if (agentId === 'agent-4') {
        const dummyExam = {
          studentName: 'Alex Rivera',
          examTitle: 'Algorithms Benchmark',
          marks: 14,
          totalMarks: 20,
          answers: [{ questionId: 'q1', isCorrect: false, timeSpentSeconds: 45 }],
          questions: [{ id: 'q1', topic: testTopic, difficulty: 'Medium', marks: 5 }]
        };
        const res = await api.agentAnalyzePerformance(dummyExam);
        setTestOutput(res);
      } else if (agentId === 'agent-5') {
        const res = await api.agentEvaluateMonitoring({
          studentName: 'Alex Rivera',
          examTitle: 'Data Structures Midterm',
          blurCount: 3,
          rapidAnswerCount: 2,
          timeSpentSeconds: 300,
          totalQuestions: 10,
          anomalyLog: [
            { timestamp: new Date().toISOString(), type: 'tab_switch', details: 'Candidate switched away from browser' },
            { timestamp: new Date().toISOString(), type: 'rapid_answer', details: 'Answer submitted in 2 seconds' }
          ]
        });
        setTestOutput(res);
      } else {
        const res = await api.agentAnalyzeClassResults('exam-1', 'Algorithms Midterm');
        setTestOutput(res);
      }
    } catch (err: any) {
      setTestOutput({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-body">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-headline font-bold text-fuchsia-600 tracking-wider uppercase mb-1">
          <Cpu className="w-4 h-4" />
          <span>ADMINISTRATOR TECHNICAL INTELLIGENCE · MULTI-AGENT ARCHITECTURE v2.8</span>
        </div>
        <h1 className="text-3xl font-headline font-black text-slate-900 tracking-tight">
          SmartProctor Multi-Agent AI Architecture & Sandbox Console
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed font-body">
          The SmartProctor platform orchestrates specialized autonomous agents powered by Google Gemini with deterministic fallback heuristics and automated transactional communications. Technical telemetry is restricted to administrative personnel.
        </p>
      </div>

      {/* Agents Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((ag) => {
          const isSelected = ag.id === activeAgentId;
          return (
            <button
              key={ag.id}
              onClick={() => {
                setActiveAgentId(ag.id);
                setTestOutput(null);
              }}
              className={`p-6 rounded-3xl text-left border transition-all flex flex-col justify-between space-y-4 cursor-pointer card-shopvibe ${
                isSelected
                  ? 'border-fuchsia-500 bg-fuchsia-50/50 ring-2 ring-fuchsia-500/25 shadow-md'
                  : 'border-slate-200/90 bg-white hover:border-fuchsia-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                  <span className="font-code font-bold text-fuchsia-600 text-sm">{ag.number}</span>
                  <span className="badge-pill-fuchsia text-[10px] px-2.5 py-0.5">
                    {ag.badge}
                  </span>
                </div>
                <h3 className="text-base font-headline font-bold text-slate-900">{ag.name}</h3>
                <div className="text-xs font-headline font-semibold text-fuchsia-700 mt-0.5">{ag.role}</div>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed font-body">
                  {ag.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-headline font-bold text-fuchsia-600 pt-3 border-t border-slate-100">
                <span>Inspect Agent Workflow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Inspection Card for Active Agent */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs card-shopvibe">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-code font-bold text-fuchsia-600 mb-1">
              AGENT {selectedAgent.number} SPECIFICATION
            </div>
            <h2 className="text-2xl font-headline font-black text-slate-900">{selectedAgent.name}</h2>
            <p className="text-xs text-slate-500 mt-1 font-body">{selectedAgent.description}</p>
          </div>

          <button
            onClick={() => handleTestAgent(selectedAgent.id)}
            disabled={isExecuting}
            className="btn-shopvibe-primary px-6 py-2.5 text-xs font-headline font-bold flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExecuting ? 'Agent Running...' : `Run ${selectedAgent.name}`}</span>
          </button>
        </div>

        {/* Input / Output Data Contract Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Agent Sensory Inputs (State & Telemetry)
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
              {selectedAgent.inputs.map((inp, idx) => (
                <li key={idx}>{inp}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Agent Autonomous Outputs (Decisions & Artifacts)
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
              {selectedAgent.outputs.map((out, idx) => (
                <li key={idx}>{out}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Live Execution Output Inspector */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>Live Execution Payload Inspector</span>
            </h4>
            <span className="text-[11px] text-slate-400">Strict structured JSON output format</span>
          </div>

          {isExecuting ? (
            <div className="p-8 text-center bg-slate-900 rounded-xl text-indigo-300 font-mono text-xs flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Invoking Gemini Agent model & formatting schema...</span>
            </div>
          ) : testOutput ? (
            <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
              {JSON.stringify(testOutput, null, 2)}
            </pre>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
              Click <strong>"Run {selectedAgent.name}"</strong> above to execute a real-time agent transaction and inspect the resulting JSON data contract.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
