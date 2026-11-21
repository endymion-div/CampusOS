import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, Edit3, Plus, ShieldCheck, X } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCampus } from '../../context/CampusContext';
import type { SubjectRecord } from '../../types/campus';
import {
  calculateAttendanceForecast,
  calculateAttendancePct,
  calculateOverallAttendance,
  simulateAttendanceScenario,
} from '../../utils/academicMath';
import { ModalDialog, ProgressRing } from '../ui/CommonUI';

export const AttendanceView: React.FC = () => {
  const { state, markAttendance, editSubjectAttendance, addSubject } = useCampus();
  const threshold = state.academicSettings.attendanceThreshold;

  const [editingSubject, setEditingSubject] = useState<SubjectRecord | null>(null);
  const [editAttended, setEditAttended] = useState('0');
  const [editConducted, setEditConducted] = useState('0');

  const [addOpen, setAddOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newFaculty, setNewFaculty] = useState('');
  const [newCredits, setNewCredits] = useState('3');

  // Simulator controls
  const [simSubjectId, setSimSubjectId] = useState(state.subjects[3]?.id ?? state.subjects[0]?.id ?? '');
  const [simAttendNext, setSimAttendNext] = useState(5);
  const [simMissNext, setSimMissNext] = useState(0);

  const overallPct = useMemo(() => calculateOverallAttendance(state.subjects), [state.subjects]);

  const simSubject = useMemo(
    () => state.subjects.find((s) => s.id === simSubjectId) ?? state.subjects[0],
    [state.subjects, simSubjectId]
  );

  const simulatedPct = useMemo(() => {
    if (!simSubject) return 100;
    return simulateAttendanceScenario(
      simSubject.attended,
      simSubject.conducted,
      simAttendNext,
      simMissNext
    );
  }, [simSubject, simAttendNext, simMissNext]);

  const chartData = useMemo(
    () =>
      state.subjects.map((s) => ({
        name: s.code,
        fullName: s.name,
        attendance: calculateAttendancePct(s.attended, s.conducted),
      })),
    [state.subjects]
  );

  const openEditModal = (subject: SubjectRecord) => {
    setEditingSubject(subject);
    setEditAttended(String(subject.attended));
    setEditConducted(String(subject.conducted));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    editSubjectAttendance(editingSubject.id, Number(editAttended), Number(editConducted));
    setEditingSubject(null);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;
    addSubject({
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      faculty: newFaculty.trim() || 'Department Faculty',
      credits: Number(newCredits) || 3,
      color: '#2563EB',
      conducted: 0,
      attended: 0,
      targetPct: threshold,
    });
    setNewCode('');
    setNewName('');
    setNewFaculty('');
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Overview + Scenario Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Cumulative Attendance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Formula: (Attended / Conducted) × 100 · Minimum {threshold}%
              </p>
            </div>
            <ProgressRing
              value={overallPct}
              size={84}
              colorClass={
                overallPct >= threshold
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Safe (≥{threshold + 3}%)</p>
              <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                {
                  state.subjects.filter(
                    (s) => calculateAttendancePct(s.attended, s.conducted) >= threshold + 3
                  ).length
                }
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Warning</p>
              <p className="text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
                {
                  state.subjects.filter((s) => {
                    const p = calculateAttendancePct(s.attended, s.conducted);
                    return p >= threshold && p < threshold + 3;
                  }).length
                }
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Critical (&lt;{threshold}%)</p>
              <p className="text-lg font-bold tabular-nums text-red-600 dark:text-red-400 mt-0.5">
                {
                  state.subjects.filter(
                    (s) => calculateAttendancePct(s.attended, s.conducted) < threshold
                  ).length
                }
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Subject</span>
          </button>
        </section>

        {/* Attendance Scenario Simulator */}
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Attendance Forecast & Simulator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate attending or missing upcoming classes before deciding
              </p>
            </div>
            <select
              aria-label="Select subject to simulate"
              value={simSubject?.id ?? ''}
              onChange={(e) => setSimSubjectId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            >
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <label htmlFor="sim-attend" className="text-slate-600 dark:text-slate-300">
                  Attend next classes
                </label>
                <span className="font-mono font-semibold tabular-nums">{simAttendNext}</span>
              </div>
              <input
                id="sim-attend"
                type="range"
                min={0}
                max={20}
                value={simAttendNext}
                onChange={(e) => setSimAttendNext(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <label htmlFor="sim-miss" className="text-slate-600 dark:text-slate-300">
                  Miss next classes
                </label>
                <span className="font-mono font-semibold tabular-nums">{simMissNext}</span>
              </div>
              <input
                id="sim-miss"
                type="range"
                min={0}
                max={15}
                value={simMissNext}
                onChange={(e) => setSimMissNext(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>
          </div>

          {simSubject ? (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Projected result for {simSubject.name}
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {simSubject.attended + simAttendNext} attended /{' '}
                  {simSubject.conducted + simAttendNext + simMissNext} conducted
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p
                  className={`text-2xl font-display font-bold tabular-nums ${
                    simulatedPct >= threshold
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {simulatedPct}%
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {simulatedPct >= threshold ? 'Above target threshold' : `Below ${threshold}% minimum`}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.subjects.map((subject) => {
          const forecast = calculateAttendanceForecast(subject.attended, subject.conducted, threshold);
          const statusLabel =
            forecast.status === 'safe'
              ? 'Safe'
              : forecast.status === 'warning'
                ? 'Warning'
                : 'Critical';
          const statusColor =
            forecast.status === 'safe'
              ? 'text-emerald-700 dark:text-emerald-400'
              : forecast.status === 'warning'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-red-600 dark:text-red-400';

          return (
            <article
              key={subject.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {subject.code} · {subject.faculty}
                    </p>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white mt-0.5">
                      {subject.name}
                    </h3>
                  </div>
                  <span className={`text-xs font-semibold inline-flex items-center gap-1 shrink-0 ${statusColor}`}>
                    {forecast.status === 'safe' ? (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{statusLabel}</span>
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-display font-bold tabular-nums text-slate-950 dark:text-white">
                    {forecast.currentPct}%
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {subject.attended} / {subject.conducted} classes
                  </span>
                </div>

                <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      forecast.status === 'safe'
                        ? 'bg-emerald-600'
                        : forecast.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-red-600'
                    }`}
                    style={{ width: `${forecast.currentPct}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {forecast.message}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => markAttendance(subject.id, true)}
                  aria-label={`Mark Present for ${subject.name}`}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => markAttendance(subject.id, false)}
                  aria-label={`Mark Absent for ${subject.name}`}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors inline-flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Absent</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(subject)}
                  aria-label={`Edit attendance for ${subject.name}`}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Attendance Comparison Chart */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h3 className="text-base font-semibold text-slate-950 dark:text-white mb-1">
          Subject-Wise Attendance Distribution
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Dashed line indicates the mandatory {threshold}% attendance requirement
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748b" unit="%" />
              <Tooltip
                formatter={(val) => [`${val ?? 0}%`, 'Attendance']}
                contentStyle={{
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <ReferenceLine y={threshold} stroke="#DC2626" strokeDasharray="4 4" />
              <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.attendance >= threshold ? '#2563EB' : '#DC2626'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Edit Attendance Modal */}
      <ModalDialog
        open={Boolean(editingSubject)}
        onClose={() => setEditingSubject(null)}
        title={`Edit Attendance · ${editingSubject?.name ?? ''}`}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-att" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Classes Attended
              </label>
              <input
                id="edit-att"
                type="number"
                min={0}
                required
                value={editAttended}
                onChange={(e) => setEditAttended(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="edit-cond" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Classes Conducted
              </label>
              <input
                id="edit-cond"
                type="number"
                min={0}
                required
                value={editConducted}
                onChange={(e) => setEditConducted(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingSubject(null)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Update Attendance
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Add Subject Modal */}
      <ModalDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Subject"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ns-code" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Code
              </label>
              <input
                id="ns-code"
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="CS204"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="ns-cred" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Credits
              </label>
              <input
                id="ns-cred"
                type="number"
                min={1}
                max={6}
                required
                value={newCredits}
                onChange={(e) => setNewCredits(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>
          <div>
            <label htmlFor="ns-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Subject Name
            </label>
            <input
              id="ns-name"
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Discrete Mathematics"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div>
            <label htmlFor="ns-fac" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Faculty Name
            </label>
            <input
              id="ns-fac"
              type="text"
              value={newFaculty}
              onChange={(e) => setNewFaculty(e.target.value)}
              placeholder="Dr. A. Sen"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Create Subject
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};
