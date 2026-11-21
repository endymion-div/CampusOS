import React, { useMemo, useState } from 'react';
import { CalendarDays, Copy, Edit3, Plus, Trash2 } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { DayOfWeek, TimetableSlot } from '../../types/campus';
import { getDayName, getTodayScheduleWithStatus, parseTimeToMinutes } from '../../utils/academicMath';
import { ConfirmDialog, EmptyState, ModalDialog } from '../ui/CommonUI';

const ALL_DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const TimetableView: React.FC = () => {
  const {
    state,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    duplicateDayTimetable,
  } = useCampus();

  const [viewMode, setViewMode] = useState<'weekly' | 'today'>('weekly');
  const [dayFilter, setDayFilter] = useState<DayOfWeek | 'All'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [dupModalOpen, setDupModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimetableSlot | null>(null);

  // Form fields
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id ?? '');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('LH-204');
  const [faculty, setFaculty] = useState(state.subjects[0]?.faculty ?? '');
  const [slotType, setSlotType] = useState<TimetableSlot['type']>('Lecture');

  // Duplicate form
  const [dupFrom, setDupFrom] = useState<DayOfWeek>('Monday');
  const [dupTo, setDupTo] = useState<DayOfWeek>('Saturday');

  const todayName = getDayName();
  const todaySchedule = useMemo(() => getTodayScheduleWithStatus(state.timetable), [state.timetable]);

  const openAddModal = (defaultDay: DayOfWeek = 'Monday') => {
    setEditingSlot(null);
    const sub = state.subjects[0];
    setDay(defaultDay);
    setSubjectId(sub?.id ?? '');
    setFaculty(sub?.faculty ?? '');
    setStartTime('09:00');
    setEndTime('10:00');
    setRoom('LH-204');
    setSlotType('Lecture');
    setModalOpen(true);
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setDay(slot.day);
    setSubjectId(slot.subjectId);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setRoom(slot.room);
    setFaculty(slot.faculty);
    setSlotType(slot.type);
    setModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = state.subjects.find((s) => s.id === subjectId) ?? state.subjects[0];
    if (!sub) return;
    const payload = {
      day,
      startTime,
      endTime,
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      faculty: faculty.trim() || sub.faculty,
      room: room.trim() || 'TBA',
      type: slotType,
      color: sub.color,
    };

    if (editingSlot) {
      updateTimetableSlot(editingSlot.id, payload);
    } else {
      addTimetableSlot(payload);
    }
    setModalOpen(false);
  };

  const handleDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    duplicateDayTimetable(dupFrom, dupTo);
    setDupModalOpen(false);
  };

  const visibleDays = dayFilter === 'All' ? ALL_DAYS : [dayFilter];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Weekly Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('today')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'today'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Today’s Schedule ({todayName})
            </button>
          </div>

          {viewMode === 'weekly' ? (
            <select
              aria-label="Filter timetable by day"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value as DayOfWeek | 'All')}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Days (Mon–Sun)</option>
              {ALL_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDupModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate Day</span>
          </button>
          <button
            type="button"
            onClick={() => openAddModal(dayFilter === 'All' ? 'Monday' : dayFilter)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Today's Schedule View */}
      {viewMode === 'today' ? (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                {todayName} Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current and upcoming classes highlighted automatically
              </p>
            </div>
            <button
              type="button"
              onClick={() => openAddModal(todayName)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add to {todayName}
            </button>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="pt-6">
              <EmptyState
                icon={<CalendarDays className="w-5 h-5" />}
                title={`No classes on ${todayName}`}
                description="Add a class or study block to populate today’s schedule."
                actionLabel="Add Class"
                onAction={() => openAddModal(todayName)}
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800 mt-2">
              {todaySchedule.map(({ slot, status }) => (
                <div
                  key={slot.id}
                  className={`py-4 px-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    status === 'current' ? 'bg-blue-50/70 dark:bg-blue-950/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: slot.color }}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{slot.subjectCode}</span>
                        <span aria-hidden="true">·</span>
                        <span>{slot.room}</span>
                        <span aria-hidden="true">·</span>
                        <span>{slot.type}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                        {slot.subjectName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{slot.faculty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        status === 'current'
                          ? 'bg-blue-600 text-white'
                          : status === 'completed'
                            ? 'text-slate-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {status === 'current' ? 'In Progress' : status === 'completed' ? 'Completed' : 'Upcoming'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditModal(slot)}
                      aria-label={`Edit ${slot.subjectName}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(slot)}
                      aria-label={`Delete ${slot.subjectName}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Weekly Monday–Sunday Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {visibleDays.map((dayName) => {
            const slots = state.timetable
              .filter((t) => t.day === dayName)
              .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
            const isToday = dayName === todayName;

            return (
              <section
                key={dayName}
                className={`rounded-2xl border p-4 bg-white dark:bg-slate-900 flex flex-col gap-3 ${
                  isToday
                    ? 'border-blue-500/70 dark:border-blue-500/60'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                      {dayName} {isToday ? '· Today' : ''}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      {slots.length} {slots.length === 1 ? 'session' : 'sessions'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddModal(dayName)}
                    aria-label={`Add class on ${dayName}`}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {slots.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
                    No classes scheduled
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: slot.color }}
                              aria-hidden="true"
                            />
                            <span>
                              {slot.startTime}–{slot.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(slot)}
                              aria-label={`Edit ${slot.subjectName} on ${dayName}`}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(slot)}
                              aria-label={`Delete ${slot.subjectName} on ${dayName}`}
                              className="p-1 rounded text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {slot.subjectName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {slot.room} · {slot.type} · {slot.faculty}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      <ModalDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSlot ? 'Edit Timetable Class' : 'Add Class to Timetable'}
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tt-day" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Day of Week
              </label>
              <select
                id="tt-day"
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {ALL_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tt-type" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Session Type
              </label>
              <select
                id="tt-type"
                value={slotType}
                onChange={(e) => setSlotType(e.target.value as TimetableSlot['type'])}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tt-sub" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Subject
            </label>
            <select
              id="tt-sub"
              value={subjectId}
              onChange={(e) => {
                const nextId = e.target.value;
                setSubjectId(nextId);
                const found = state.subjects.find((s) => s.id === nextId);
                if (found) setFaculty(found.faculty);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tt-start" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                id="tt-start"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="tt-end" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <input
                id="tt-end"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tt-room" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Classroom / Lab
              </label>
              <input
                id="tt-room"
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="tt-faculty" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Faculty
              </label>
              <input
                id="tt-faculty"
                type="text"
                required
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {editingSlot ? 'Save Changes' : 'Add Class'}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Duplicate Day Modal */}
      <ModalDialog
        open={dupModalOpen}
        onClose={() => setDupModalOpen(false)}
        title="Duplicate Day Schedule"
        subtitle="Copy all classes from one day onto another day."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleDuplicate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dup-from" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Copy From
              </label>
              <select
                id="dup-from"
                value={dupFrom}
                onChange={(e) => setDupFrom(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {ALL_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dup-to" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Copy To
              </label>
              <select
                id="dup-to"
                value={dupTo}
                onChange={(e) => setDupTo(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {ALL_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDupModalOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Duplicate Slots
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteTimetableSlot(deleteTarget.id);
        }}
        title="Remove Timetable Class"
        description={`Remove "${deleteTarget?.subjectName}" (${deleteTarget?.day} ${deleteTarget?.startTime}) from your weekly timetable?`}
        confirmLabel="Remove Class"
        danger
      />
    </div>
  );
};
