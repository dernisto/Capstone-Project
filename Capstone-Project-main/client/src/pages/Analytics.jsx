import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
function formatDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString();
}
function gradeBucket(pct) {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}
function Analytics() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [summary, setSummary] = useState(void 0);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [quizId, setQuizId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (studentId) qs.set("studentId", studentId);
      if (quizId) qs.set("quizId", quizId);
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      const res = await fetch(`/api/analytics/attempts?${qs.toString()}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to load analytics");
      setAttempts(data.attempts ?? []);
      setSummary(data.summary);
      setStudents(data.filters?.students ?? []);
      setQuizzes(data.filters?.quizzes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void fetchData();
  }, []);
  const filteredSorted = useMemo(() => {
    const list = [...attempts];
    list.sort((a, b) => {
      if (sortBy === "score") {
        const cmp2 = a.percentage - b.percentage;
        return sortDir === "asc" ? cmp2 : -cmp2;
      }
      const ad = new Date(a.createdAt).getTime();
      const bd = new Date(b.createdAt).getTime();
      const cmp = ad - bd;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [attempts, sortBy, sortDir]);
  const trendData = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const a of filteredSorted) {
      const key = new Date(a.createdAt).toISOString().slice(0, 10);
      const cur = m.get(key) ?? { sum: 0, n: 0 };
      cur.sum += a.percentage;
      cur.n += 1;
      m.set(key, cur);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, v]) => ({ date, avgPct: Math.round(v.sum / v.n) }));
  }, [filteredSorted]);
  const perQuizBars = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const a of filteredSorted) {
      const key = a.quizId;
      const cur = m.get(key) ?? { title: a.quizTitle, sum: 0, n: 0 };
      cur.sum += a.percentage;
      cur.n += 1;
      m.set(key, cur);
    }
    return Array.from(m.entries()).map(([quizId2, v]) => ({
      quizId: quizId2,
      title: v.title,
      avgPct: Math.round(v.sum / v.n),
      attempts: v.n
    }));
  }, [filteredSorted]);
  const gradePie = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const a of filteredSorted) counts[gradeBucket(a.percentage)] += 1;
    return Object.entries(counts).filter(([, v]) => v > 0).map(([k, v]) => ({ grade: k, value: v }));
  }, [filteredSorted]);
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    const rows = attempts.filter((a) => a.studentId === selectedStudentId);
    const name = rows[0]?.studentName ?? selectedStudentId;
    return { id: selectedStudentId, name, attempts: rows };
  }, [attempts, selectedStudentId]);
  const studentTrend = useMemo(() => {
    if (!selectedStudent) return [];
    return [...selectedStudent.attempts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((a) => ({ date: a.createdAt.slice(0, 10), pct: a.percentage, quiz: a.quizTitle }));
  }, [selectedStudent]);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950", children: /* @__PURE__ */ jsxs("div", { className: "container py-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold gradient-text", children: "Performance Analytics" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 mt-2", children: "Real attempt data from your database (no dummy charts)." })
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "ghost", onClick: () => navigate("/sessions"), children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5 mr-2" }),
        "Sessions"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-5 gap-4 items-end", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Student" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: studentId,
              onChange: (e) => setStudentId(e.target.value),
              className: "w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All students" }),
                students.map((s) => /* @__PURE__ */ jsx("option", { value: s.id, children: s.username }, s.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Quiz" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: quizId,
              onChange: (e) => setQuizId(e.target.value),
              className: "w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All quizzes" }),
                quizzes.map((q) => /* @__PURE__ */ jsx("option", { value: q.id, children: q.title }, q.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "from", children: "From" }),
          /* @__PURE__ */ jsx(Input, { id: "from", type: "date", value: from, onChange: (e) => setFrom(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "to", children: "To" }),
          /* @__PURE__ */ jsx(Input, { id: "to", type: "date", value: to, onChange: (e) => setTo(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { className: "btn-primary w-full", onClick: fetchData, disabled: loading, children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
            " Loading"
          ] }) : "Apply" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              onClick: () => {
                setStudentId("");
                setQuizId("");
                setFrom("");
                setTo("");
              },
              children: "Reset"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 mt-5 items-center", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Sort" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: sortBy,
            onChange: (e) => setSortBy(e.target.value),
            className: "px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800",
            children: [
              /* @__PURE__ */ jsx("option", { value: "date", children: "Date" }),
              /* @__PURE__ */ jsx("option", { value: "score", children: "Score" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: sortDir,
            onChange: (e) => setSortDir(e.target.value),
            className: "px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800",
            children: [
              /* @__PURE__ */ jsx("option", { value: "desc", children: "Desc" }),
              /* @__PURE__ */ jsx("option", { value: "asc", children: "Asc" })
            ]
          }
        )
      ] }) })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6 mb-8 border border-red-300/60 dark:border-red-900/60", children: [
      /* @__PURE__ */ jsx("p", { className: "text-red-700 dark:text-red-200 font-semibold mb-1", children: "Analytics error" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-600 dark:text-slate-400 text-sm", children: error }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-500 text-xs mt-3", children: "This dashboard reads from your existing database. Ensure `DATABASE_URL` is configured and the server can reach MySQL." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-5 gap-4 mb-8", children: [
      { label: "Average score", value: summary?.averageScorePct ?? 0, suffix: "%" },
      { label: "Highest score", value: summary?.highestScorePct ?? 0, suffix: "%" },
      { label: "Lowest score", value: summary?.lowestScorePct ?? 0, suffix: "%" },
      { label: "Total attempts", value: summary?.totalAttempts ?? 0, suffix: "" },
      { label: "Total students", value: summary?.totalStudents ?? 0, suffix: "" }
    ].map((c) => /* @__PURE__ */ jsxs("div", { className: "glass-panel p-5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold", children: c.label }),
      /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-slate-900 dark:text-white mt-2", children: [
        c.value,
        c.suffix
      ] })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6 lg:col-span-2", children: [
        /* @__PURE__ */ jsx("p", { className: "font-bold text-slate-900 dark:text-white mb-3", children: "Trend (daily average %)" }),
        trendData.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-slate-600 dark:text-slate-400", children: "No data available" }) : /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: trendData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.25 }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "date", tick: { fontSize: 12 } }),
          /* @__PURE__ */ jsx(YAxis, { domain: [0, 100], tick: { fontSize: 12 } }),
          /* @__PURE__ */ jsx(Tooltip, {}),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "avgPct", stroke: "#6366f1", strokeWidth: 3, dot: false })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "font-bold text-slate-900 dark:text-white mb-3", children: "Grade distribution" }),
        gradePie.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-slate-600 dark:text-slate-400", children: "No data available" }) : /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: gradePie, dataKey: "value", nameKey: "grade", innerRadius: 55, outerRadius: 85, children: gradePie.map((d) => /* @__PURE__ */ jsx(
            Cell,
            {
              fill: d.grade === "A" ? "#10b981" : d.grade === "B" ? "#22c55e" : d.grade === "C" ? "#f59e0b" : d.grade === "D" ? "#f97316" : "#ef4444"
            },
            d.grade
          )) }),
          /* @__PURE__ */ jsx(Tooltip, {})
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6 mb-8", children: [
      /* @__PURE__ */ jsx("p", { className: "font-bold text-slate-900 dark:text-white mb-3", children: "Average score by quiz" }),
      perQuizBars.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-slate-600 dark:text-slate-400", children: "No data available" }) : /* @__PURE__ */ jsx("div", { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: perQuizBars, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.25 }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "title", tick: { fontSize: 12 }, interval: 0, angle: -15, height: 60 }),
        /* @__PURE__ */ jsx(YAxis, { domain: [0, 100], tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsx(Tooltip, {}),
        /* @__PURE__ */ jsx(Bar, { dataKey: "avgPct", fill: "#8b5cf6", radius: [8, 8, 0, 0] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 mb-4", children: [
        /* @__PURE__ */ jsx("p", { className: "font-bold text-slate-900 dark:text-white", children: "Student attempts" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: [
          filteredSorted.length,
          " rows"
        ] })
      ] }),
      filteredSorted.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsx(Users, { className: "w-14 h-14 text-slate-300 dark:text-slate-600 mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-700 dark:text-slate-300 font-medium", children: "No data available" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-500 text-sm mt-1", children: "Once students complete quizzes, attempts will appear here." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-slate-500 dark:text-slate-400", children: [
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-4", children: "Student" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-4", children: "Quiz" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-4", children: "Score" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-4", children: "%" }),
          /* @__PURE__ */ jsx("th", { className: "py-2 pr-4", children: "Date" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: filteredSorted.map((a) => /* @__PURE__ */ jsxs(
          motion.tr,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            className: "border-t border-slate-200 dark:border-slate-700",
            children: [
              /* @__PURE__ */ jsx("td", { className: "py-3 pr-4", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "font-semibold text-indigo-700 dark:text-indigo-300 hover:underline",
                  onClick: () => setSelectedStudentId(a.studentId),
                  children: a.studentName
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 text-slate-700 dark:text-slate-300", children: a.quizTitle }),
              /* @__PURE__ */ jsxs("td", { className: "py-3 pr-4 font-mono text-slate-700 dark:text-slate-300", children: [
                a.score,
                "/",
                a.totalQuestions
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "py-3 pr-4 font-bold text-slate-900 dark:text-white", children: [
                a.percentage,
                "%"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 text-slate-600 dark:text-slate-400", children: formatDate(a.createdAt) })
            ]
          },
          a.id
        )) })
      ] }) })
    ] }),
    selectedStudent && /* @__PURE__ */ jsxs("div", { className: "glass-panel p-6 mt-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 font-semibold", children: "Student" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: selectedStudent.name })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setSelectedStudentId(null), children: "Close" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-bold text-slate-900 dark:text-white mb-3", children: "Score progression" }),
      studentTrend.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-10 text-center text-slate-600 dark:text-slate-400", children: "No data available" }) : /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: studentTrend, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.25 }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "date", tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsx(YAxis, { domain: [0, 100], tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsx(Tooltip, {}),
        /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "pct", stroke: "#22c55e", strokeWidth: 3, dot: true })
      ] }) }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-3", children: "Weak/strong areas require per-question incorrect-answer data. If you add an `attempt_answers` table later, we can compute topic/skill breakdowns." })
    ] })
  ] }) });
}
export {
  Analytics as default
};
