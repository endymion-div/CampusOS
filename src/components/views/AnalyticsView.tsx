import React, { useMemo, useState } from 'react';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCampus } from '../../context/CampusContext';
import type { CampusIntelligenceReport } from '../../types/campus';
import {
  calculateAttendancePct,
  calculateCGPA,
  classifyAssignments,
  getDaysUntil,
} from '../../utils/academicMath';

export const AnalyticsView: React.FC = () => {
  const { state, setIntelligenceReport, buildAiContextPayload, pushToast } = useCampus();
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const assignmentBuckets = useMemo(() => classifyAssignments(state.assignments), [state.assignments]);
  const cgpaResult = useMemo(
    () => calculateCGPA(state.semesters, state.academicSettings.gradeScale),
    [state.semesters, state.academicSettings.gradeScale]
  );

  // Local deterministic baseline report derived from actual state
  const localReport = useMemo<CampusIntelligenceReport>(() => {
    const threshold = state.academicSettings.attendanceThreshold;
    const atRisk = state.subjects.filter(
      (s) => calculateAttendancePct(s.attended, s.conducted) < threshold
    );
    const upcoming7DaysExams = state.exams.filter((e) => {
      const d = getDaysUntil(e.date);
      return d >= 0 && d <= 7;
    });
    const upcoming7DaysAssignments = state.assignments.filter((a) => {
      if (a.status === 'completed') return false;
      const d = getDaysUntil(a.dueDate);
      return d <= 7;
    });

    const strongestSubject = [...state.subjects].sort(
      (a, b) =>
        calculateAttendancePct(b.attended, b.conducted) -
        calculateAttendancePct(a.attended, a.conducted)
    )[0];

    return {
      generatedAt: new Date().toISOString().slice(0, 10),
      weeklySummary: `Strongest consistency in ${strongestSubject?.name ?? 'Programming'} (${calculateAttendancePct(
        strongestSubject?.attended ?? 1,
        strongestSubject?.conducted ?? 1
      )}%). ${upcoming7DaysAssignments.length} ${
        upcoming7DaysAssignments.length === 1 ? 'assignment' : 'assignments'
      } and ${upcoming7DaysExams.length} ${
        upcoming7DaysExams.length === 1 ? 'exam' : 'exams'
      } fall within the next 7 days.`,
      weakSubjects:
        atRisk.length > 0
          ? atRisk.map((s) => `${s.name} (${calculateAttendancePct(s.attended, s.conducted)}% attendance)`)
          : ['All subjects currently meet attendance targets'],
      upcomingWorkload: `${upcoming7DaysAssignments.length} active ${
        upcoming7DaysAssignments.length === 1 ? 'assignment' : 'assignments'
      } (${assignmentBuckets.overdue.length} overdue) and ${upcoming7DaysExams.length} upcoming ${
        upcoming7DaysExams.length === 1 ? 'exam' : 'exams'
      } in the next 7 days.`,
      attendanceRisks:
        atRisk.length > 0
          ? atRisk.map((s) => `${s.name}: below ${threshold}% threshold`)
          : [`No subjects below ${threshold}% threshold`],
      examPrepStatus:
        state.exams.length > 0
          ? state.exams.map((e) => `${e.subjectName}: ${e.prepProgress}%`).join(' · ')
          : 'No exams scheduled',
      recommendedPriorities: [
        upcoming7DaysAssignments[0]
          ? `Submit "${upcoming7DaysAssignments[0].title}" (${upcoming7DaysAssignments[0].subjectName})`
          : 'Keep up with weekly practice sets',
        atRisk[0]
          ? `Attend upcoming ${atRisk[0].name} sessions without misses`
          : 'Maintain attendance buffer across all labs',
        upcoming7DaysExams[0]
          ? `Allocate 2h nightly revision to ${upcoming7DaysExams[0].subjectName}`
          : 'Preview next week lecture notes',
      ],
      source: 'local',
    };
  }, [state, assignmentBuckets.overdue.length]);

  const activeReport = state.intelligenceReport ?? localReport;

  const refreshGeminiInsights = async () => {
    setInsightError(null);
    setLoadingInsights(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: buildAiContextPayload() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate CampusOS Intelligence.');
      }
      setIntelligenceReport({
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        weeklySummary: data.weeklySummary,
        weakSubjects: data.weakSubjects ?? [],
        upcomingWorkload: data.upcomingWorkload,
        attendanceRisks: data.attendanceRisks ?? [],
        examPrepStatus: data.examPrepStatus,
        recommendedPriorities: data.recommendedPriorities ?? [],
        source: 'gemini',
      });
      pushToast({ title: 'CampusOS Intelligence updated with Gemini', tone: 'success' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to fetch Gemini insights.';
      setInsightError(msg);
      pushToast({ title: 'AI Insights Error', description: msg, tone: 'error' });
    } finally {
      setLoadingInsights(false);
    }
  };

  // Chart datasets
  const attendanceTrendData = useMemo(() => {
    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'Now'];
    return weeks.map((w, idx) => {
      const avg =
        state.subjects.reduce((acc, s) => acc + (s.weeklyTrend[idx] ?? s.weeklyTrend[s.weeklyTrend.length - 1] ?? 80), 0) /
        Math.max(1, state.subjects.length);
      return { week: w, attendance: Number(avg.toFixed(1)) };
    });
  }, [state.subjects]);

  const sgpaTrendData = useMemo(
    () =>
      [...cgpaResult.semesterSummaries]
        .sort((a, b) => a.semesterNumber - b.semesterNumber)
        .map((s) => ({
          term: s.semesterNumber === 0 ? 'Bridge' : `Sem ${s.semesterNumber}`,
          sgpa: s.sgpa,
        })),
    [cgpaResult.semesterSummaries]
  );

  const assignmentCompletionData = useMemo(
    () => [
      { name: 'Completed', value: assignmentBuckets.completed.length, color: '#16A34A' },
      { name: 'Due / Upcoming', value: assignmentBuckets.dueToday.length + assignmentBuckets.upcoming.length, color: '#2563EB' },
      { name: 'Overdue', value: assignmentBuckets.overdue.length, color: '#DC2626' },
    ],
    [assignmentBuckets]
  );

  const subjectPerfData = useMemo(
    () =>
      state.subjects.map((s) => ({
        code: s.code,
        attendance: calculateAttendancePct(s.attended, s.conducted),
      })),
    [state.subjects]
  );

  return (
    <div className="space-y-6">
      {/* CAMPUSOS INTELLIGENCE */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CampusOS Intelligence</span>
            </div>
            <h2 className="text-lg font-display font-bold text-slate-950 dark:text-white mt-0.5">
              Academic Telemetry & AI Recommendations
            </h2>
          </div>
          <button
            type="button"
            onClick={refreshGeminiInsights}
            disabled={loadingInsights}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto disabled:opacity-60"
          >
            {loadingInsights ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{loadingInsights ? 'Analyzing...' : 'Generate Deep Gemini Insights'}</span>
          </button>
        </div>

        {insightError ? (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            {insightError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Weekly Summary</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              {activeReport.weeklySummary}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Upcoming Workload</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              {activeReport.upcomingWorkload}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Exam Preparation Status</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              {activeReport.examPrepStatus}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Weak Subjects</p>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
              {activeReport.weakSubjects.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Attendance Risks</p>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
              {activeReport.attendanceRisks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Recommended Priorities</p>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
              {activeReport.recommendedPriorities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Attendance Trend</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            6-week rolling average across enrolled subjects
          </p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} stroke="#64748b" unit="%" />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="attendance" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* SGPA Trend */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">SGPA Trend</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Term GPA trajectory (10-point scale)
          </p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sgpaTrendData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="term" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis domain={[7, 10]} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Line type="monotone" dataKey="sgpa" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Study Hours */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Weekly Study Hours</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Daily self-study distribution (Goal: {state.academicSettings.dailyStudyGoalHours}h/day)
          </p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={state.studyHoursWeekly} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" unit="h" />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="hours" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Assignment Completion & Subject Breakdown */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
            Assignment Completion & Subject Standing
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Status breakdown vs subject-wise attendance consistency
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assignmentCompletionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {assignmentCompletionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5">
              {assignmentCompletionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-mono font-semibold tabular-nums">{item.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                {subjectPerfData.slice(0, 3).map((s) => (
                  <div key={s.code} className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{s.code}</span>
                    <span className="font-mono tabular-nums">{s.attendance}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
