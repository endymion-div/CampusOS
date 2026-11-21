import React, { useMemo, useState } from 'react';
import { Calendar, CheckSquare, Clock, GraduationCap, MapPin, Plus, Sparkles, Square, Trash2 } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { ExamItem } from '../../types/campus';
import { getDaysUntil } from '../../utils/academicMath';
import { ConfirmDialog, EmptyState, ModalDialog } from '../ui/CommonUI';

export const ExamsView: React.FC = () => {
  const { state, addExam, updateExam, deleteExam, openStudyPlannerForExam } = useCampus();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExamItem | null>(null);

  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id ?? '');
  const [title, setTitle] = useState('End-Semester Exam');
  const [date, setDate] = useState(new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState('09:30 AM');
  const [venue, setVenue] = useState('Main Auditorium');
  const [syllabusText, setSyllabusText] = useState('Unit 1: Core Concepts, Unit 2: Applied Problems, Unit 3: Case Studies');

  const sortedExams = useMemo(
    () => [...state.exams].sort((a, b) => a.date.localeCompare(b.date)),
    [state.exams]
  );

  const handleToggleTopic = (exam: ExamItem, topic: string) => {
    const exists = exam.completedTopics.includes(topic);
    const nextCompleted = exists
      ? exam.completedTopics.filter((t) => t !== topic)
      : [...exam.completedTopics, topic];
    const nextProgress =
      exam.syllabus.length > 0
        ? Math.round((nextCompleted.length / exam.syllabus.length) * 100)
        : exam.prepProgress;
    const nextStatus =
      nextProgress === 100 ? 'ready' : nextProgress > 0 ? 'in-progress' : 'not-started';

    updateExam(exam.id, {
      completedTopics: nextCompleted,
      prepProgress: nextProgress,
      status: nextStatus,
    });
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = state.subjects.find((s) => s.id === subjectId) ?? state.subjects[0];
    if (!subject || !title.trim()) return;
    const topics = syllabusText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addExam({
      subjectId: subject.id,
      subjectName: subject.name,
      title: title.trim(),
      date,
      time: time.trim() || '09:30 AM',
      venue: venue.trim() || 'TBA',
      syllabus: topics.length > 0 ? topics : ['Full Course Syllabus'],
      completedTopics: [],
      prepProgress: 0,
      status: 'not-started',
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">
            Exam Center & Preparation Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track countdowns, check off syllabus modules, and launch tailored AI study schedules
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Exam</span>
        </button>
      </div>

      {sortedExams.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-5 h-5" />}
          title="No exams scheduled"
          description="Add upcoming mid-semester quizzes or final exams to track syllabus readiness."
          actionLabel="Add Exam"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedExams.map((exam) => {
            const daysLeft = getDaysUntil(exam.date);
            const countdownText =
              daysLeft < 0
                ? 'Exam completed'
                : daysLeft === 0
                  ? `${exam.subjectName} exam is today`
                  : `${exam.subjectName} exam in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;

            return (
              <article
                key={exam.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        {countdownText}
                      </p>
                      <h3 className="text-lg font-display font-bold text-slate-950 dark:text-white mt-1">
                        {exam.subjectName} · {exam.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(exam)}
                      aria-label={`Delete ${exam.subjectName} exam`}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {exam.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {exam.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {exam.venue}
                    </span>
                  </div>

                  {/* Prep progress bar */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Preparation status:{' '}
                        <span className="capitalize">
                          {exam.status.replace('-', ' ')}
                        </span>
                      </span>
                      <span className="font-mono font-semibold tabular-nums">{exam.prepProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          exam.prepProgress >= 75
                            ? 'bg-emerald-600'
                            : exam.prepProgress >= 40
                              ? 'bg-blue-600'
                              : 'bg-amber-500'
                        }`}
                        style={{ width: `${exam.prepProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Syllabus checklist */}
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Syllabus Checklist
                    </p>
                    <div className="space-y-2">
                      {exam.syllabus.map((topic) => {
                        const checked = exam.completedTopics.includes(topic);
                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => handleToggleTopic(exam, topic)}
                            className="w-full flex items-center gap-2.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white"
                          >
                            {checked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className={checked ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                              {topic}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => openStudyPlannerForExam(exam)}
                    className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Start studying</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add Exam Modal */}
      <ModalDialog open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Exam">
        <form onSubmit={handleAddExam} className="space-y-4">
          <div>
            <label htmlFor="ex-sub" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Subject
            </label>
            <select
              id="ex-sub"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              {state.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ex-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Exam Title
            </label>
            <input
              id="ex-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="ex-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                id="ex-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="ex-time" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Time
              </label>
              <input
                id="ex-time"
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="ex-venue" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Venue
              </label>
              <input
                id="ex-venue"
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ex-syl" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Syllabus Topics (comma-separated)
            </label>
            <textarea
              id="ex-syl"
              rows={2}
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="flex justify-end gap-2">
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
              Add Exam
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteExam(deleteTarget.id);
        }}
        title="Remove Exam"
        description={`Remove "${deleteTarget?.subjectName} · ${deleteTarget?.title}" from Exam Center?`}
        confirmLabel="Remove"
        danger
      />
    </div>
  );
};
