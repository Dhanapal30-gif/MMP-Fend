// RoadmapDashboard.jsx
// Dependencies: npm install recharts
// Usage: import RoadmapDashboard from './RoadmapDashboard'

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────

const salaryData = [
  { month: "Now",     salary: 40 },
  { month: "Month 1", salary: 49 },
  { month: "Month 2", salary: 55 },
  { month: "Month 3", salary: 70 },
];

const combinedData = [
  { month: "Start",   react: 30, salary: 35 },
  { month: "Month 1", react: 50, salary: 40 },
  { month: "Month 2", react: 70, salary: 55 },
  { month: "Month 3", react: 85, salary: 70 },
];

const steps = [
  { num: "01", title: "Fix communication",       days: "7 days",     tag: "Communication", color: "green"  },
  { num: "02", title: "Build AI project (MMP)",  days: "10–15 days", tag: "Project",       color: "blue"   },
  { num: "03", title: "Position yourself right", days: "Ongoing",    tag: "Branding",      color: "purple" },
  { num: "04", title: "Job + freelance strategy",days: "Month 2",    tag: "Apply",         color: "amber"  },
  { num: "05", title: "Upgrade resume",          days: "Week 2",     tag: "Resume",        color: "coral"  },
];

const strengths = [
  { label: "Technical skill",  pct: 85, color: "#1D9E75" },
  { label: "Problem thinking", pct: 80, color: "#1D9E75" },
  { label: "Communication",    pct: 45, color: "#EF9F27" },
  { label: "Confidence",       pct: 40, color: "#EF9F27" },
];

const routine = [
  { label: "AI learning",      hrs: "1 hr",  pct: 40, color: "#378ADD" },
  { label: "Project building", hrs: "1 hr",  pct: 40, color: "#1D9E75" },
  { label: "Communication",    hrs: "30 min",pct: 20, color: "#7F77DD" },
];

const mistakes = [
  { title: "Waiting to learn everything", sub: "Start before you feel ready" },
  { title: 'Calling yourself "React Dev"', sub: 'Say "Full Stack + AI Integration"' },
  { title: 'Thinking "I am not ready"',   sub: "Apply early, learn on the way" },
  { title: "No AI features in project",   sub: "Add chatbot, alerts, summaries" },
];

const reactPhases = [
  {
    phase: "Phase 1 — Foundations", duration: "Week 1–2", color: "green", progress: 100,
    topics: [
      { name: "JSX basics", status: "done" }, { name: "Components", status: "done" },
      { name: "Props", status: "done" },       { name: "useState", status: "done" },
      { name: "Event handling", status: "done" },{ name: "Conditional render", status: "done" },
      { name: "Lists & keys", status: "done" },
    ],
  },
  {
    phase: "Phase 2 — Hooks & Data", duration: "Week 3–5", color: "blue", progress: 55,
    topics: [
      { name: "useEffect", status: "done" },   { name: "useRef", status: "done" },
      { name: "useContext", status: "done" },  { name: "Custom hooks", status: "active" },
      { name: "Fetch / Axios", status: "active" },{ name: "React Query", status: "future" },
      { name: "Error boundaries", status: "future" },
    ],
  },
  {
    phase: "Phase 3 — Routing & State", duration: "Week 6–8", color: "purple", progress: 10,
    topics: [
      { name: "React Router v6", status: "future" }, { name: "Protected routes", status: "future" },
      { name: "Redux Toolkit", status: "future" },   { name: "Zustand", status: "future" },
      { name: "React Hook Form", status: "future" }, { name: "Zod validation", status: "future" },
    ],
  },
  {
    phase: "Phase 4 — Advanced & Performance", duration: "Week 9–12", color: "amber", progress: 0,
    topics: [
      { name: "useMemo / useCallback", status: "future" }, { name: "Code splitting", status: "future" },
      { name: "Lazy loading", status: "future" },           { name: "React.memo", status: "future" },
      { name: "Testing (Vitest)", status: "future" },       { name: "Storybook", status: "future" },
    ],
  },
  {
    phase: "Phase 5 — AI Integration", duration: "Week 13–20", color: "coral", progress: 0,
    topics: [
      { name: "OpenAI API in React", status: "future" }, { name: "Streaming responses", status: "future" },
      { name: "AI chatbot UI", status: "future" },       { name: "Chart dashboards", status: "future" },
      { name: "Next.js basics", status: "future" },      { name: "Deploy (Vercel)", status: "future" },
    ],
  },
];

const projects = [
  { title: "Todo + Counter app",  desc: "useState, props, lists",          phase: "Phase 1", color: "green"  },
  { title: "Weather dashboard",   desc: "API fetch, useEffect, charts",    phase: "Phase 2", color: "blue"   },
  { title: "E-commerce UI",       desc: "Router, cart with Redux",         phase: "Phase 3", color: "purple" },
  { title: "Admin dashboard",     desc: "Recharts, lazy loading",          phase: "Phase 4", color: "amber"  },
  { title: "MMP AI chatbot",      desc: "Your existing project + AI",      phase: "Phase 5", color: "coral"  },
  { title: "Full stack SaaS",     desc: "Next.js + Spring Boot + AI",      phase: "Phase 5", color: "pink"   },
];

const monthPlan = [
  {
    month: "Month 1", label: "Build", highlight: false,
    items: ["React Hooks & Data (Phase 2)", "Fix communication daily", "Add AI to MMP project", "Update resume + LinkedIn"],
  },
  {
    month: "Month 2", label: "Apply", highlight: true,
    items: ["React Router + State (Phase 3)", "Start job applications", "Launch freelance (₹5K–10K)", "Mock interviews practice"],
  },
  {
    month: "Month 3", label: "Close", highlight: false,
    items: ["Performance + Testing (Phase 4)", "Negotiate ₹70K+ offers", "Side freelance income", "Start Phase 5 AI work"],
  },
];

const skillsByMonth3 = [
  { label: "React (Hooks+State)", pct: 85, color: "#378ADD" },
  { label: "Spring Boot + Java",  pct: 80, color: "#1D9E75" },
  { label: "AI integration",      pct: 70, color: "#7F77DD" },
  { label: "Communication",       pct: 75, color: "#EF9F27" },
  { label: "REST APIs",           pct: 85, color: "#1D9E75" },
  { label: "Git + DevOps",        pct: 65, color: "#5DCAA5" },
  { label: "Testing",             pct: 55, color: "#EF9F27" },
  { label: "Freelance confidence",pct: 70, color: "#7F77DD" },
];

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────

const TAG_STYLES = {
  green:  { background: "#E1F5EE", color: "#0F6E56" },
  blue:   { background: "#E6F1FB", color: "#185FA5" },
  purple: { background: "#EEEDFE", color: "#534AB7" },
  amber:  { background: "#FAEEDA", color: "#854F0B" },
  coral:  { background: "#FAECE7", color: "#993C1D" },
  pink:   { background: "#FBEAF0", color: "#993556" },
};

const PROGRESS_COLORS = {
  green: "#1D9E75", blue: "#378ADD", purple: "#7F77DD",
  amber: "#EF9F27", coral: "#D85A30",
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Tag({ label, color = "green", style = {} }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 500,
      padding: "2px 10px", borderRadius: 20,
      ...TAG_STYLES[color], ...style,
    }}>
      {label}
    </span>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div style={{
      background: "#f5f4f0", borderRadius: 8, padding: "12px 14px",
    }}>
      <div style={{ fontSize: 11, color: "#888780", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: "#1a1a18" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: "#888780",
      textTransform: "uppercase", letterSpacing: "0.06em",
      margin: "1.2rem 0 8px", ...style,
    }}>
      {children}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#fff", border: "0.5px solid #e0ded8",
      borderRadius: 12, padding: "14px 16px", ...style,
    }}>
      {children}
    </div>
  );
}

function BarRow({ label, pct, color, rightLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: "#1a1a18", width: 140, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: "#f1efe8", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, width: 36, textAlign: "right", color }}>{rightLabel}</span>
    </div>
  );
}

function TopicPill({ name, status }) {
  const styles = {
    done:   { background: "#E1F5EE", color: "#0F6E56", border: "0.5px solid #9FE1CB" },
    active: { background: "#E6F1FB", color: "#185FA5", border: "0.5px solid #85B7EB" },
    future: { background: "#f5f4f0", color: "#888780", border: "0.5px solid #e0ded8" },
  };
  return (
    <span style={{
      fontSize: 11, padding: "3px 9px", borderRadius: 20,
      ...styles[status],
    }}>
      {name}
    </span>
  );
}

function XIcon() {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: "50%", background: "#FCEBEB",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10">
        <line x1="2" y1="2" x2="8" y2="8" stroke="#A32D2D" strokeWidth="1.5" />
        <line x1="8" y1="2" x2="2" y2="8" stroke="#A32D2D" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

function CareerTab() {
  return (
    <div>
      <SectionLabel>Goal snapshot</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 4 }}>
        <MetricCard label="Target salary" value="₹70K" sub="per month" />
        <MetricCard label="Skill ready"   value="1–2 mo" sub="project + AI" />
        <MetricCard label="Job switch"    value="2–3 mo" sub="possible" />
        <MetricCard label="Daily effort"  value="2.5 hr" sub="focused work" />
      </div>

      <SectionLabel>5-step roadmap</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 7, marginBottom: 4 }}>
        {steps.map((s) => (
          <Card key={s.num} style={{ padding: "11px 12px" }}>
            <div style={{ fontSize: 11, color: "#888780", marginBottom: 3 }}>Step {s.num}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a18", marginBottom: 3, lineHeight: 1.3 }}>{s.title}</div>
            <div style={{ fontSize: 11, color: "#888780", marginBottom: 7 }}>{s.days}</div>
            <Tag label={s.tag} color={s.color} />
          </Card>
        ))}
      </div>

      <SectionLabel>Salary growth</SectionLabel>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={salaryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,135,128,0.15)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888780" }} />
          <YAxis
            tickFormatter={(v) => `₹${v}K`}
            tick={{ fontSize: 11, fill: "#888780" }}
            domain={[25, 80]}
          />
          <Tooltip formatter={(v) => [`₹${v}K`, "Salary"]} />
          <Line
            type="monotone" dataKey="salary" stroke="#1D9E75"
            strokeWidth={2} dot={{ r: 5, fill: "#1D9E75" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 10, marginTop: 12 }}>
        <Card>
          <SectionLabel style={{ margin: "0 0 10px" }}>Daily routine</SectionLabel>
          {routine.map((r) => (
            <BarRow key={r.label} label={r.label} pct={r.pct} color={r.color} rightLabel={r.hrs} />
          ))}
        </Card>
        <Card>
          <SectionLabel style={{ margin: "0 0 10px" }}>Your strengths</SectionLabel>
          {strengths.map((s) => (
            <BarRow key={s.label} label={s.label} pct={s.pct} color={s.color} rightLabel={`${s.pct}%`} />
          ))}
        </Card>
      </div>

      <SectionLabel>Mistakes to avoid</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {mistakes.map((m) => (
          <div key={m.title} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <XIcon />
            <div>
              <div style={{ fontSize: 13, color: "#1a1a18" }}>{m.title}</div>
              <div style={{ fontSize: 11, color: "#888780" }}>{m.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReactTab() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 4 }}>
        <MetricCard label="Total duration"    value="5 mo"  sub="beginner → advanced" />
        <MetricCard label="Phases"            value="5"     sub="structured" />
        <MetricCard label="Projects to build" value="6+"    sub="portfolio ready" />
        <MetricCard label="Daily practice"    value="1 hr"  sub="code every day" />
      </div>

      <SectionLabel>Learning phases</SectionLabel>
      {reactPhases.map((ph) => (
        <div key={ph.phase} style={{
          background: "#fff", border: "0.5px solid #e0ded8",
          borderRadius: 12, padding: "12px 14px", marginBottom: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a18" }}>{ph.phase}</span>
            <Tag label={ph.duration} color={ph.color} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {ph.topics.map((t) => <TopicPill key={t.name} name={t.name} status={t.status} />)}
          </div>
          <div style={{ height: 6, background: "#f1efe8", borderRadius: 3, overflow: "hidden", marginTop: 10 }}>
            <div style={{ width: `${ph.progress}%`, height: "100%", background: PROGRESS_COLORS[ph.color], borderRadius: 3 }} />
          </div>
        </div>
      ))}

      <SectionLabel>Portfolio projects to build</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {projects.map((p) => (
          <Card key={p.title} style={{ padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", marginBottom: 3 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: "#888780", marginBottom: 7, lineHeight: 1.4 }}>{p.desc}</div>
            <Tag label={p.phase} color={p.color} />
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: "#888780" }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#1D9E75", marginRight: 4 }} />Done
        </div>
        <div style={{ fontSize: 12, color: "#888780" }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#378ADD", marginRight: 4 }} />In progress
        </div>
        <div style={{ fontSize: 12, color: "#888780" }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#d3d1c7", marginRight: 4 }} />Upcoming
        </div>
      </div>
    </div>
  );
}

function CombinedTab() {
  return (
    <div>
      <SectionLabel>Combined 3-month timeline</SectionLabel>
      <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: 12, color: "#888780" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#378ADD", marginRight: 4 }} />React skill %</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#1D9E75", marginRight: 4 }} />Salary ₹K</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,135,128,0.15)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888780" }} />
          <YAxis yAxisId="left"  tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#378ADD" }} domain={[0, 100]} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `₹${v}K`} tick={{ fontSize: 11, fill: "#1D9E75" }} domain={[20, 90]} />
          <Tooltip formatter={(v, name) => name === "react" ? [`${v}%`, "React skill"] : [`₹${v}K`, "Salary"]} />
          <Line yAxisId="left"  type="monotone" dataKey="react"  stroke="#378ADD" strokeWidth={2} dot={{ r: 5, fill: "#378ADD" }} />
          <Line yAxisId="right" type="monotone" dataKey="salary" stroke="#1D9E75" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 5, fill: "#1D9E75" }} />
        </LineChart>
      </ResponsiveContainer>

      <SectionLabel>Month-by-month focus</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {monthPlan.map((m) => (
          <Card key={m.month} style={m.highlight ? { border: "2px solid #9FE1CB" } : {}}>
            {m.highlight && <div style={{ fontSize: 11, fontWeight: 600, color: "#0F6E56", marginBottom: 4 }}>Key month</div>}
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", marginBottom: 8 }}>{m.month} — {m.label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {m.items.map((item) => (
                <div key={item} style={{ fontSize: 12, color: "#888780", lineHeight: 1.5 }}>{item}</div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <SectionLabel>Skills you'll have by Month 3</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        {skillsByMonth3.map((s) => (
          <BarRow key={s.label} label={s.label} pct={s.pct} color={s.color} rightLabel={`${s.pct}%`} />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const TABS = [
  { id: "career",   label: "Career roadmap"    },
  { id: "react",    label: "React learning path"},
  { id: "combined", label: "Combined timeline"  },
];

export default function RoadmapDashboard() {
  const [activeTab, setActiveTab] = useState("career");

  return (
    <div style={{
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: "#fafaf8", minHeight: "100vh", padding: "24px 20px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1a1a18", marginBottom: 4 }}>
            ₹70K roadmap + React learning path
          </h1>
          <p style={{ fontSize: 13, color: "#888780" }}>Your personal dashboard — career growth & skill building</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4,
          borderBottom: "0.5px solid #e0ded8", marginBottom: "1.5rem",
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontSize: 13, fontWeight: 500, padding: "8px 16px",
                cursor: "pointer", border: "none", background: "transparent",
                color: activeTab === tab.id ? "#1a1a18" : "#888780",
                borderBottom: activeTab === tab.id ? "2px solid #1D9E75" : "2px solid transparent",
                marginBottom: -1, transition: "color 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "career"   && <CareerTab />}
        {activeTab === "react"    && <ReactTab />}
        {activeTab === "combined" && <CombinedTab />}
      </div>
    </div>
  );
}
