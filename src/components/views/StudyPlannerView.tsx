import React, { useEffect, useState } from 'react';
import { CheckSquare, Loader2, Sparkles, Square, Trash2 } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { StudyPlan } from '../../types/campus';
import { EmptyState } from '../ui/CommonUI';

export const StudyPlannerView: React.FC = () => {
  const {
    state,
    plannerPrefill,
    setPlannerPrefill,
    addStudyPlan,
    toggleStudyPlanTask,
    deleteStudyPlan,
    pushToast,
  } = useCampus();

  const [subject, setSubject] = useState(state.subjects[0]?.name ?? 'Engineering Mathematics I');
  const [examDate, setExamDate] = useState(
    state.exams[0]?.date ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [topics, setTopics] = useState(
    'Partial Differentiation, Jacobians, Multiple Integrals, Eigenvalues'
  );
  const [difficulty, setDifficulty] = useState<'Foundational' | 'Moderate' | 'Intensive'>('Intensive');
  const [hoursPerDay, setHoursPerDay] = useState('2.5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plannerPrefill) {
      setSubject(plannerPrefill.subject);
      setExamDate(plannerPrefill.examDate);
      setTopics(plannerPrefill.topics);
      setPlannerPrefill(null);
    }
  }, [plannerPrefill, setPlannerPrefill]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          examDate,
          topics: topics.split(',').map((t) => t.trim()).filter(Boolean),
          difficulty,
          hoursPerDay: Number(hoursPerDay) || 2,
          existingExams: state.exams.map((ex) => ({ subject: ex.subjectName, date: ex.date })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate study plan.');
      }

      const plan: StudyPlan = {
        id: `plan-${Date.now()}`,
        subject,
        examDate,
        difficulty,
        hoursPerDay: Number(hoursPerDay) || 2,
        createdAt: new Date().toISOString().slice(0, 10),
        days: (data.days ?? []).map((d: { dayNumber: number; date: string; topic: string; hours: number; tasks: string[] }, idx: number) => ({
          dayNumber: d.dayNumber ?? idx + 1,
          date: d.date,
          topic: d.topic,
          hours: d.hours,
          tasks: (d.tasks ?? []).map((t: string, tIdx: number) => ({
            id: `task-${Date.now()}-${idx}-${tIdx}`,
            text: t,
            done: false,
          })),
        })),
      };

      addStudyPlan(plan);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to generate study plan.';
      setError(msg);
      pushToast({ title: 'Study Planner Error', description: msg, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Input Form */}
      <section className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 self-start">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">
            AI Study Planner
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enter your exam parameters to generate a day-by-day revision schedule with Gemini
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 pt-4">
          <div>
            <label htmlFor="sp-sub" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Subject
            </label>
            <input
              id="sp-sub"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sp-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Exam Date
              </label>
              <input
                id="sp-date"
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="sp-hours" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Hours / Day
              </label>
              <input
                id="sp-hours"
                type="number"
                step="0.5"
                min={0.5}
                max={12}
                required
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sp-diff" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Difficulty Level
            </label>
            <select
              id="sp-diff"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'Foundational' | 'Moderate' | 'Intensive')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              <option value="Foundational">Foundational</option>
              <option value="Moderate">Moderate</option>
              <option value="Intensive">Intensive</option>
            </select>
          </div>

          <div>
            <label htmlFor="sp-topics" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Topics to Cover
            </label>
            <textarea
              id="sp-topics"
              rows={3}
              required
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="Comma-separated topics..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          {error ? (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Generating AI Study Plan...' : 'Generate Study Plan'}</span>
          </button>
        </form>
      </section>

      {/* Active Plans & Progress Tracking */}
      <section className="lg:col-span-7 space-y-4">
        {state.studyPlans.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-5 h-5" />}
            title="No study plans created yet"
            description="Fill out your exam subject, topics, and daily study hours to generate a tailored schedule."
          />
        ) : (
          state.studyPlans.map((plan) => {
            const allTasks = plan.days.flatMap((d) => d.tasks);
            const doneCount = allTasks.filter((t) => t.done).length;
            const progress = allTasks.length > 0 ? Math.round((doneCount / allTasks.length) * 100) : 0;

            return (
              <article
                key={plan.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Exam {plan.examDate} · {plan.difficulty} · {plan.hoursPerDay}h/day
                    </p>
                    <h3 className="text-base font-semibold text-slate-950 dark:text-white mt-0.5">
                      {plan.subject}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                      {progress}% done
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteStudyPlan(plan.id)}
                      aria-label={`Delete study plan for ${plan.subject}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="space-y-3">
                  {plan.days.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Day {day.dayNumber}: {day.topic}
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                          {day.hours} hrs · {day.date}
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {day.tasks.map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => toggleStudyPlanTask(plan.id, day.dayNumber, task.id)}
                            className="w-full flex items-center gap-2 text-left text-xs text-slate-700 dark:text-slate-300"
                          >
                            {task.done ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className={task.done ? 'line-through text-slate-400' : ''}>
                              {task.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
};
