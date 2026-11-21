import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Calculator,
  GraduationCap,
  MessageSquare,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import {
  buildCommandCenterSummary,
  calculateAttendancePct,
  calculateCGPA,
  calculateOverallAttendance,
  classifyAssignments,
  getDaysUntil,
  getTodayScheduleWithStatus,
} from '../../utils/academicMath';
import { AnimatedCounter, ModalDialog, ProgressRing } from '../ui/CommonUI';

export const DashboardView: React.FC = () => {
  const { state, setActiveSection, addAssignment, markAttendance, addCampusEvent } = useCampus();
  const [quickAssignOpen, setQuickAssignOpen] = useState(false);
  const [quickEventOpen, setQuickEventOpen] = useState(false);

  // Quick Assignment state
  const [asgnTitle, setAsgnTitle] = useState('');
  const [asgnSubjectId, setAsgnSubjectId] = useState(state.subjects[0]?.id ?? '');
  const [asgnDueDate, setAsgnDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [asgnPriority, setAsgnPriority] = useState<'high' | 'medium' | 'low'>('high');

  // Quick Event state
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState(new Date().toISOString().slice(0, 10));
  const [evtLocation, setEvtLocation] = useState('Main Auditorium');

  const command = useMemo(() => buildCommandCenterSummary(state), [state]);
  const todayClasses = useMemo(() => getTodayScheduleWithStatus(state.timetable), [state.timetable]);
  const overallAttendance = useMemo(() => calculateOverallAttendance(state.subjects), [state.subjects]);
  const assignmentBuckets = useMemo(() => classifyAssignments(state.assignments), [state.assignments]);
  const cgpaStats = useMemo(
    () => calculateCGPA(state.semesters, state.academicSettings.gradeScale),
    [state.semesters, state.academicSettings.gradeScale]
  );

  const currentSemSgpa = cgpaStats.semesterSummaries[0]?.sgpa ?? 0;

  const sortedExams = useMemo(
    () =>
      [...state.exams]
        .map((e) => ({ exam: e, days: getDaysUntil(e.date) }))
        .filter((x) => x.days >= 0)
        .sort((a, b) => a.days - b.days),
    [state.exams]
  );

  const lowAttendanceSubjects = useMemo(
    () =>
      state.subjects.filter(
        (s) =>
          calculateAttendancePct(s.attended, s.conducted) < state.academicSettings.attendanceThreshold
      ),
    [state.subjects, state.academicSettings.attendanceThreshold]
  );

  const handleQuickAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = state.subjects.find((s) => s.id === asgnSubjectId) ?? state.subjects[0];
    if (!asgnTitle.trim() || !subject) return;
    addAssignment({
      title: asgnTitle.trim(),
      subjectId: subject.id,
      subjectName: subject.name,
      description: 'Added via Dashboard Quick Actions.',
      dueDate: asgnDueDate,
      priority: asgnPriority,
      status: 'pending',
    });
    setAsgnTitle('');
    setQuickAssignOpen(false);
  };

  const handleQuickAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;
    addCampusEvent({
      title: evtTitle.trim(),
      category: 'Workshops',
      date: evtDate,
      time: '04:00 PM',
      location: evtLocation.trim() || 'Main Campus',
      organizer: state.profile.name,
      description: 'Student-added campus event.',
    });
    setEvtTitle('');
    setQuickEventOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* STUDENT COMMAND CENTER ("What matters today?") */}
      <section aria-labelledby="command-center-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              Student Command Center
            </p>
            <h2
              id="command-center-heading"
              className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-950 dark:text-white mt-0.5"
            >
              What matters today, {state.profile.name.split(' ')[0]}?
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {state.profile.course} · Semester {state.profile.semester} · Section {state.profile.section}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* 1. Next Class */}
          <button
            type="button"
            onClick={() => setActiveSection('timetable')}
            className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-slate-900 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{command.nextClass?.isNow ? 'Class in Session' : 'Next Class'}</span>
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            {command.nextClass ? (
              <>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5 truncate">
                  {command.nextClass.slot.subjectName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 tabular-nums">
                  {command.nextClass.dayLabel} · {command.nextClass.slot.startTime}–{command.nextClass.slot.endTime} ·{' '}
                  {command.nextClass.slot.room}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1.5">
                No classes scheduled yet.
              </p>
            )}
          </button>

          {/* 2. Most Urgent Assignment */}
          <button
            type="button"
            onClick={() => setActiveSection('assignments')}
            className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-slate-900 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Most Urgent Assignment</span>
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            {command.urgentAssignment ? (
              <>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5 truncate">
                  {command.urgentAssignment.item.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {command.urgentAssignment.daysLeft < 0
                    ? `Overdue by ${Math.abs(command.urgentAssignment.daysLeft)}d`
                    : command.urgentAssignment.daysLeft === 0
                      ? 'Due today'
                      : `Due in ${command.urgentAssignment.daysLeft}d`}{' '}
                  · {command.urgentAssignment.item.subjectName}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mt-1.5">
                All assignments completed.
              </p>
            )}
          </button>

          {/* 3. Upcoming Exam */}
          <button
            type="button"
            onClick={() => setActiveSection('exams')}
            className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-slate-900 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Upcoming Exam</span>
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            {command.upcomingExam ? (
              <>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5 truncate">
                  {command.upcomingExam.exam.subjectName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 tabular-nums">
                  In {command.upcomingExam.daysLeft} days · Prep {command.upcomingExam.exam.prepProgress}%
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1.5">
                No exams scheduled.
              </p>
            )}
          </button>

          {/* 4. Attendance Warning */}
          <button
            type="button"
            onClick={() => setActiveSection('attendance')}
            className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-slate-900 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Attendance Watch</span>
              <AlertTriangle
                className={`w-3.5 h-3.5 ${
                  command.attendanceWarning &&
                  command.attendanceWarning.pct < state.academicSettings.attendanceThreshold
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              />
            </div>
            {command.attendanceWarning ? (
              <>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5 truncate">
                  {command.attendanceWarning.subject.name} ·{' '}
                  <span className="tabular-nums">{command.attendanceWarning.pct}%</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {command.attendanceWarning.forecast.classesNeededToReach > 0
                    ? `Attend next ${command.attendanceWarning.forecast.classesNeededToReach} classes to reach ${state.academicSettings.attendanceThreshold}%`
                    : `Safe buffer of ${command.attendanceWarning.forecast.canMissSafely} classes`}
                </p>
              </>
            ) : null}
          </button>

          {/* 5. Recommended Study Session */}
          <button
            type="button"
            onClick={() => setActiveSection('planner')}
            className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-slate-900 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Recommended Study Session</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5 truncate">
              {command.recommendedStudy.subject} · {command.recommendedStudy.durationLabel}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate">
              {command.recommendedStudy.reason}
            </p>
          </button>

          {/* 6. Campus Event */}
          <button
            type="button"
            onClick={() => setActiveSection('events')}
            className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-slate-900 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Campus Event</span>
              <Calendar className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            {command.featuredEvent ? (
              <>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5 truncate">
                  {command.featuredEvent.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate">
                  {command.featuredEvent.date} · {command.featuredEvent.location}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500 mt-1.5">Explore upcoming campus events</p>
            )}
          </button>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section aria-label="Quick Actions" className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setQuickAssignOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Assignment</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('attendance')}
          className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Add Attendance</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('cgpa')}
          className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Calculate CGPA</span>
        </button>
        <button
          type="button"
          onClick={() => setQuickEventOpen(true)}
          className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <CalendarPlus className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span>Add Event</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('assistant')}
          className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Ask AI</span>
        </button>
      </section>

      {/* CORE METRIC CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Classes */}
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-950 dark:text-white">Today’s Classes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                {todayClasses.length} {todayClasses.length === 1 ? 'session' : 'sessions'} scheduled today
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('timetable')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>Full timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 mt-2">
            {todayClasses.length === 0 ? (
              <p className="py-8 text-sm text-slate-500 dark:text-slate-400 text-center">
                No classes scheduled for today. Open Timetable to add or adjust slots.
              </p>
            ) : (
              todayClasses.map(({ slot, status }) => (
                <div key={slot.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>{slot.startTime} – {slot.endTime}</span>
                      <span aria-hidden="true">·</span>
                      <span>{slot.room}</span>
                      <span aria-hidden="true">·</span>
                      <span>{slot.type}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                      {slot.subjectName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{slot.faculty}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-medium ${
                        status === 'current'
                          ? 'text-blue-600 dark:text-blue-400'
                          : status === 'completed'
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {status === 'current' ? 'Live Now' : status === 'completed' ? 'Done' : 'Upcoming'}
                    </span>
                    <button
                      type="button"
                      onClick={() => markAttendance(slot.subjectId, true)}
                      title={`Mark Present for ${slot.subjectName}`}
                      className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      +Present
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Attendance Overview */}
        <section className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950 dark:text-white">Attendance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target minimum {state.academicSettings.attendanceThreshold}%
              </p>
            </div>
            <ProgressRing
              value={overallAttendance}
              colorClass={
                overallAttendance >= state.academicSettings.attendanceThreshold
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }
              label="Overall"
            />
          </div>

          {lowAttendanceSubjects.length > 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
              <strong>Warning:</strong> {lowAttendanceSubjects.map((s) => s.name).join(', ')} below{' '}
              {state.academicSettings.attendanceThreshold}%.
            </div>
          ) : null}

          <div className="space-y-2.5">
            {state.subjects.slice(0, 5).map((subject) => {
              const pct = calculateAttendancePct(subject.attended, subject.conducted);
              const below = pct < state.academicSettings.attendanceThreshold;
              return (
                <div key={subject.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-3">
                      {subject.name}
                    </span>
                    <span
                      className={`font-mono font-semibold tabular-nums shrink-0 ${
                        below ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        below ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setActiveSection('attendance')}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 self-start"
          >
            <span>Open Attendance Forecast & Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* Assignments Card */}
        <section className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">Assignments</h3>
            <button
              type="button"
              onClick={() => setActiveSection('assignments')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
              <p className="text-2xl font-display font-bold mt-1 text-slate-950 dark:text-white">
                <AnimatedCounter value={assignmentBuckets.pending.length} />
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-amber-700 dark:text-amber-400">Due Today</p>
              <p className="text-2xl font-display font-bold mt-1 text-slate-950 dark:text-white">
                <AnimatedCounter value={assignmentBuckets.dueToday.length} />
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-blue-700 dark:text-blue-400">Upcoming</p>
              <p className="text-2xl font-display font-bold mt-1 text-slate-950 dark:text-white">
                <AnimatedCounter value={assignmentBuckets.upcoming.length} />
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Completed</p>
              <p className="text-2xl font-display font-bold mt-1 text-slate-950 dark:text-white">
                <AnimatedCounter value={assignmentBuckets.completed.length} />
              </p>
            </div>
          </div>
          {assignmentBuckets.overdue.length > 0 ? (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {assignmentBuckets.overdue.length} overdue assignment needs attention.
            </p>
          ) : null}
        </section>

        {/* Exams Card */}
        <section className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">Exams Countdown</h3>
            <button
              type="button"
              onClick={() => setActiveSection('exams')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Exam Center
            </button>
          </div>
          <div className="space-y-3">
            {sortedExams.slice(0, 3).map(({ exam, days }) => (
              <div
                key={exam.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {exam.subjectName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {exam.title} · {exam.venue}
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-blue-700 dark:text-blue-400 shrink-0 tabular-nums">
                  {days === 0 ? 'Today' : `${days}d`}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CGPA Card */}
        <section className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">SGPA & CGPA</h3>
            <button
              type="button"
              onClick={() => setActiveSection('cgpa')}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Calculator
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current SGPA</p>
              <p className="text-3xl font-display font-bold mt-1 text-slate-950 dark:text-white">
                <AnimatedCounter value={currentSemSgpa} decimals={2} />
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cumulative CGPA</p>
              <p className="text-3xl font-display font-bold mt-1 text-blue-600 dark:text-blue-400">
                <AnimatedCounter value={cgpaStats.cgpa} decimals={2} />
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Credits Tracked</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {cgpaStats.totalCredits} Credits
            </span>
          </div>
        </section>
      </div>

      {/* Quick Add Assignment Modal */}
      <ModalDialog
        open={quickAssignOpen}
        onClose={() => setQuickAssignOpen(false)}
        title="Quick Add Assignment"
      >
        <form onSubmit={handleQuickAddAssignment} className="space-y-4">
          <div>
            <label htmlFor="qa-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Assignment Title
            </label>
            <input
              id="qa-title"
              type="text"
              required
              value={asgnTitle}
              onChange={(e) => setAsgnTitle(e.target.value)}
              placeholder="e.g., Linear Algebra Problem Set 5"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qa-sub" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                id="qa-sub"
                value={asgnSubjectId}
                onChange={(e) => setAsgnSubjectId(e.target.value)}
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
              <label htmlFor="qa-due" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                id="qa-due"
                type="date"
                required
                value={asgnDueDate}
                onChange={(e) => setAsgnDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>
          <div>
            <label htmlFor="qa-prio" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              id="qa-prio"
              value={asgnPriority}
              onChange={(e) => setAsgnPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setQuickAssignOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Assignment
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Quick Add Event Modal */}
      <ModalDialog
        open={quickEventOpen}
        onClose={() => setQuickEventOpen(false)}
        title="Quick Add Campus Event"
      >
        <form onSubmit={handleQuickAddEvent} className="space-y-4">
          <div>
            <label htmlFor="qe-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Event Name
            </label>
            <input
              id="qe-title"
              type="text"
              required
              value={evtTitle}
              onChange={(e) => setEvtTitle(e.target.value)}
              placeholder="e.g., Systems Design Study Jam"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qe-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                id="qe-date"
                type="date"
                required
                value={evtDate}
                onChange={(e) => setEvtDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="qe-loc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                id="qe-loc"
                type="text"
                required
                value={evtLocation}
                onChange={(e) => setEvtLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setQuickEventOpen(false)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Publish Event
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};
