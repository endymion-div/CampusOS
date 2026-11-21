import React, { useMemo, useState } from 'react';
import { Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCampus } from '../../context/CampusContext';
import { calculateCGPA, calculateSGPA } from '../../utils/academicMath';
import { AnimatedCounter, ModalDialog } from '../ui/CommonUI';

export const CgpaView: React.FC = () => {
  const {
    state,
    addSemester,
    addCourseToSemester,
    updateSemesterCourse,
    removeSemesterCourse,
    updateAcademicSettings,
  } = useCampus();

  const gradeScale = state.academicSettings.gradeScale;
  const gradeOptions = Object.keys(gradeScale);

  const [selectedSemId, setSelectedSemId] = useState(state.semesters[0]?.id ?? '');
  const [scaleOpen, setScaleOpen] = useState(false);
  const [newSemOpen, setNewSemOpen] = useState(false);
  const [newSemName, setNewSemName] = useState('');

  // Editable scale local state
  const [draftScale, setDraftScale] = useState<Record<string, number>>(gradeScale);

  const activeSemester = useMemo(
    () => state.semesters.find((s) => s.id === selectedSemId) ?? state.semesters[0],
    [state.semesters, selectedSemId]
  );

  const activeSgpa = useMemo(() => {
    if (!activeSemester) return { sgpa: 0, totalCredits: 0, totalPoints: 0 };
    return calculateSGPA(activeSemester.courses, gradeScale);
  }, [activeSemester, gradeScale]);

  const cgpaResult = useMemo(
    () => calculateCGPA(state.semesters, gradeScale),
    [state.semesters, gradeScale]
  );

  const chartData = useMemo(
    () =>
      [...cgpaResult.semesterSummaries]
        .sort((a, b) => a.semesterNumber - b.semesterNumber)
        .map((s) => ({
          name: `Sem ${s.semesterNumber === 0 ? 'Bridge' : s.semesterNumber}`,
          sgpa: s.sgpa,
          credits: s.credits,
        })),
    [cgpaResult.semesterSummaries]
  );

  const handleAddCourse = () => {
    if (!activeSemester) return;
    addCourseToSemester(activeSemester.id, {
      subject: 'New Subject',
      credits: 3,
      grade: gradeOptions[1] ?? gradeOptions[0] ?? 'A',
    });
  };

  const handleSaveScale = (e: React.FormEvent) => {
    e.preventDefault();
    updateAcademicSettings({ gradeScale: draftScale });
    setScaleOpen(false);
  };

  const handleAddSemester = (e: React.FormEvent) => {
    e.preventDefault();
    addSemester(newSemName);
    setNewSemName('');
    setNewSemOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Selected Semester SGPA</p>
          <p className="text-3xl font-display font-bold text-slate-950 dark:text-white mt-1">
            <AnimatedCounter value={activeSgpa.sgpa} decimals={2} />
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
            {activeSgpa.totalPoints} grade points / {activeSgpa.totalCredits} credits
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Cumulative CGPA</p>
          <p className="text-3xl font-display font-bold text-blue-600 dark:text-blue-400 mt-1">
            <AnimatedCounter value={cgpaResult.cgpa} decimals={2} />
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
            Across {state.semesters.length} terms · {cgpaResult.totalCredits} total credits
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Calculator Controls</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDraftScale(gradeScale);
                setScaleOpen(true);
              }}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Grade Scale</span>
            </button>
            <button
              type="button"
              onClick={() => setNewSemOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Semester</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Calculator + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <label htmlFor="cgpa-sem-select" className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Semester
              </label>
              <select
                id="cgpa-sem-select"
                value={activeSemester?.id ?? ''}
                onChange={(e) => setSelectedSemId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                {state.semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddCourse}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          {activeSemester ? (
            <div className="space-y-2.5">
              <div className="hidden sm:grid grid-cols-12 gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 px-1">
                <span className="col-span-6">Subject</span>
                <span className="col-span-2">Credits</span>
                <span className="col-span-3">Grade</span>
                <span className="col-span-1 text-right">Del</span>
              </div>

              {activeSemester.courses.map((course) => (
                <div
                  key={course.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50"
                >
                  <input
                    type="text"
                    aria-label="Course subject name"
                    value={course.subject}
                    onChange={(e) =>
                      updateSemesterCourse(activeSemester.id, course.id, { subject: e.target.value })
                    }
                    className="sm:col-span-6 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    aria-label={`Credits for ${course.subject}`}
                    value={course.credits}
                    onChange={(e) =>
                      updateSemesterCourse(activeSemester.id, course.id, {
                        credits: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="sm:col-span-2 px-2.5 py-1.5 text-xs font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <select
                    aria-label={`Grade for ${course.subject}`}
                    value={course.grade}
                    onChange={(e) =>
                      updateSemesterCourse(activeSemester.id, course.id, { grade: e.target.value })
                    }
                    className="sm:col-span-3 px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {gradeOptions.map((g) => (
                      <option key={g} value={g}>
                        {g} ({gradeScale[g]} pts)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSemesterCourse(activeSemester.id, course.id)}
                    aria-label={`Remove ${course.subject}`}
                    className="sm:col-span-1 p-1.5 text-slate-400 hover:text-red-600 justify-self-end"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* Performance Graph & Semester Comparison */}
        <section className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col gap-5">
          <div>
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              Semester Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              SGPA trajectory across recorded academic terms
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="sgpa"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563EB' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800">
            {cgpaResult.semesterSummaries.map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  {s.credits} cr · <strong className="text-slate-950 dark:text-white">{s.sgpa.toFixed(2)}</strong>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Grade Scale Modal */}
      <ModalDialog
        open={scaleOpen}
        onClose={() => setScaleOpen(false)}
        title="Configure Grade Point Scale"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveScale} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(draftScale).map(([grade, pts]) => (
              <div key={grade} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-semibold">{grade}</span>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={10}
                  value={pts}
                  onChange={(e) =>
                    setDraftScale((prev) => ({ ...prev, [grade]: Number(e.target.value) }))
                  }
                  className="w-20 px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setScaleOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Grade Scale
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Add Semester Modal */}
      <ModalDialog
        open={newSemOpen}
        onClose={() => setNewSemOpen(false)}
        title="Add New Semester"
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleAddSemester} className="space-y-4">
          <div>
            <label htmlFor="new-sem-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Semester Label
            </label>
            <input
              id="new-sem-name"
              type="text"
              required
              value={newSemName}
              onChange={(e) => setNewSemName(e.target.value)}
              placeholder="e.g., Semester 2 (Spring 2027)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewSemOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Create Semester
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};
