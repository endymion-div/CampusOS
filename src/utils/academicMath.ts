import type {
  AssignmentItem,
  CampusEvent,
  CampusNotification,
  CampusState,
  DayOfWeek,
  ExamItem,
  SemesterCourse,
  SemesterRecord,
  SubjectRecord,
  TimetableSlot,
} from '../types/campus';

const DAYS_ORDERED: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, delta: number): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + delta);
  return copy;
}

export function getDaysUntil(isoDate: string, now: Date = new Date()): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const target = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function calculateAttendancePct(attended: number, conducted: number): number {
  if (conducted <= 0) return 100;
  const clampedAttended = Math.max(0, Math.min(attended, conducted));
  return Number(((clampedAttended / conducted) * 100).toFixed(1));
}

export function getAttendanceStatus(
  pct: number,
  threshold = 75
): 'safe' | 'warning' | 'critical' {
  if (pct >= threshold + 3) return 'safe';
  if (pct >= threshold) return 'warning';
  return 'critical';
}

export interface AttendanceForecast {
  currentPct: number;
  classesNeededToReach: number;
  canMissSafely: number;
  status: 'safe' | 'warning' | 'critical';
  message: string;
}

export function calculateAttendanceForecast(
  attended: number,
  conducted: number,
  targetPct = 75
): AttendanceForecast {
  const currentPct = calculateAttendancePct(attended, conducted);
  const status = getAttendanceStatus(currentPct, targetPct);
  const t = targetPct / 100;

  if (conducted <= 0) {
    return {
      currentPct: 100,
      classesNeededToReach: 0,
      canMissSafely: 0,
      status: 'safe',
      message: 'No classes conducted yet. Target threshold is ' + targetPct + '%.',
    };
  }

  if (currentPct < targetPct) {
    // Solve (attended + x) / (conducted + x) >= t  =>  x >= (t*conducted - attended) / (1 - t)
    const numerator = t * conducted - attended;
    const denominator = 1 - t;
    const classesNeededToReach = denominator > 0 ? Math.max(1, Math.ceil(numerator / denominator)) : 0;
    return {
      currentPct,
      classesNeededToReach,
      canMissSafely: 0,
      status,
      message: `You currently have ${currentPct}% attendance. You need to attend the next ${classesNeededToReach} ${
        classesNeededToReach === 1 ? 'class' : 'classes'
      } without missing one to reach ${targetPct}%.`,
    };
  }

  // Solve attended / (conducted + y) >= t  =>  y <= (attended / t) - conducted
  const canMissSafely = Math.max(0, Math.floor(attended / t - conducted));
  return {
    currentPct,
    classesNeededToReach: 0,
    canMissSafely,
    status,
    message:
      canMissSafely > 0
        ? `Attendance is ${currentPct}%. You can miss up to ${canMissSafely} upcoming ${
            canMissSafely === 1 ? 'class' : 'classes'
          } and stay above ${targetPct}%.`
        : `Attendance is ${currentPct}%. Attend the next class to maintain your ${targetPct}% buffer.`,
  };
}

export function simulateAttendanceScenario(
  attended: number,
  conducted: number,
  attendNext: number,
  missNext: number
): number {
  const newAttended = attended + Math.max(0, attendNext);
  const newConducted = conducted + Math.max(0, attendNext) + Math.max(0, missNext);
  return calculateAttendancePct(newAttended, newConducted);
}

export function calculateOverallAttendance(subjects: SubjectRecord[]): number {
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalConducted = subjects.reduce((sum, s) => sum + s.conducted, 0);
  return calculateAttendancePct(totalAttended, totalConducted);
}

export function calculateSGPA(
  courses: Pick<SemesterCourse, 'credits' | 'grade'>[],
  gradeScale: Record<string, number>
): { sgpa: number; totalCredits: number; totalPoints: number } {
  let totalCredits = 0;
  let totalPoints = 0;
  for (const c of courses) {
    const credits = Math.max(0, Number(c.credits) || 0);
    const points = gradeScale[c.grade] ?? 0;
    totalCredits += credits;
    totalPoints += credits * points;
  }
  const sgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
  return { sgpa, totalCredits, totalPoints };
}

export function calculateCGPA(
  semesters: SemesterRecord[],
  gradeScale: Record<string, number>
): { cgpa: number; totalCredits: number; semesterSummaries: { id: string; name: string; semesterNumber: number; sgpa: number; credits: number }[] } {
  let weightedSum = 0;
  let totalCredits = 0;
  const semesterSummaries = semesters.map((sem) => {
    const { sgpa, totalCredits: semCredits } = calculateSGPA(sem.courses, gradeScale);
    weightedSum += sgpa * semCredits;
    totalCredits += semCredits;
    return {
      id: sem.id,
      name: sem.name,
      semesterNumber: sem.semesterNumber,
      sgpa,
      credits: semCredits,
    };
  });

  const cgpa = totalCredits > 0 ? Number((weightedSum / totalCredits).toFixed(2)) : 0;
  return { cgpa, totalCredits, semesterSummaries };
}

export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function getDayName(date: Date = new Date()): DayOfWeek {
  return DAYS_ORDERED[date.getDay()];
}

export function getTodayScheduleWithStatus(
  timetable: TimetableSlot[],
  now: Date = new Date()
): {
  slot: TimetableSlot;
  status: 'completed' | 'current' | 'upcoming';
}[] {
  const today = getDayName(now);
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const slots = timetable
    .filter((t) => t.day === today)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  return slots.map((slot) => {
    const start = parseTimeToMinutes(slot.startTime);
    const end = parseTimeToMinutes(slot.endTime);
    let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
    if (currentMins >= start && currentMins < end) {
      status = 'current';
    } else if (currentMins >= end) {
      status = 'completed';
    }
    return { slot, status };
  });
}

export function classifyAssignments(
  assignments: AssignmentItem[],
  now: Date = new Date()
) {
  const pending: AssignmentItem[] = [];
  const dueToday: AssignmentItem[] = [];
  const upcoming: AssignmentItem[] = [];
  const overdue: AssignmentItem[] = [];
  const completed: AssignmentItem[] = [];

  for (const item of assignments) {
    if (item.status === 'completed') {
      completed.push(item);
      continue;
    }
    pending.push(item);
    const days = getDaysUntil(item.dueDate, now);
    if (days < 0) {
      overdue.push(item);
    } else if (days === 0) {
      dueToday.push(item);
    } else {
      upcoming.push(item);
    }
  }

  return { pending, dueToday, upcoming, overdue, completed };
}

export interface CommandCenterSummary {
  nextClass: {
    slot: TimetableSlot;
    isNow: boolean;
    dayLabel: string;
  } | null;
  urgentAssignment: {
    item: AssignmentItem;
    daysLeft: number;
  } | null;
  upcomingExam: {
    exam: ExamItem;
    daysLeft: number;
  } | null;
  attendanceWarning: {
    subject: SubjectRecord;
    pct: number;
    forecast: AttendanceForecast;
  } | null;
  recommendedStudy: {
    subject: string;
    durationLabel: string;
    reason: string;
  };
  featuredEvent: CampusEvent | null;
}

export function buildCommandCenterSummary(
  state: CampusState,
  now: Date = new Date()
): CommandCenterSummary {
  const todayClasses = getTodayScheduleWithStatus(state.timetable, now);
  const currentOrNextToday = todayClasses.find(
    (c) => c.status === 'current' || c.status === 'upcoming'
  );

  let nextClass: CommandCenterSummary['nextClass'] = null;
  if (currentOrNextToday) {
    nextClass = {
      slot: currentOrNextToday.slot,
      isNow: currentOrNextToday.status === 'current',
      dayLabel: 'Today',
    };
  } else {
    // Find next day with a class
    for (let offset = 1; offset <= 7; offset++) {
      const checkDate = addDays(now, offset);
      const dayName = getDayName(checkDate);
      const daySlots = state.timetable
        .filter((t) => t.day === dayName)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
      if (daySlots.length > 0) {
        nextClass = {
          slot: daySlots[0],
          isNow: false,
          dayLabel: offset === 1 ? 'Tomorrow' : dayName,
        };
        break;
      }
    }
  }

  // Most urgent incomplete assignment
  const incompleteAssignments = state.assignments
    .filter((a) => a.status !== 'completed')
    .map((item) => ({ item, daysLeft: getDaysUntil(item.dueDate, now) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const urgentAssignment = incompleteAssignments[0] ?? null;

  // Next upcoming exam
  const upcomingExams = state.exams
    .map((exam) => ({ exam, daysLeft: getDaysUntil(exam.date, now) }))
    .filter((e) => e.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const upcomingExam = upcomingExams[0] ?? null;

  // Lowest attendance subject below threshold (or lowest overall)
  const threshold = state.academicSettings.attendanceThreshold || 75;
  const attendanceRanked = state.subjects
    .map((subject) => {
      const pct = calculateAttendancePct(subject.attended, subject.conducted);
      return {
        subject,
        pct,
        forecast: calculateAttendanceForecast(subject.attended, subject.conducted, threshold),
      };
    })
    .sort((a, b) => a.pct - b.pct);

  const belowThreshold = attendanceRanked.find((s) => s.pct < threshold) ?? attendanceRanked[0] ?? null;

  // Recommended study session
  let recommendedStudy: CommandCenterSummary['recommendedStudy'] = {
    subject: 'Core Revision',
    durationLabel: '60 min focused block',
    reason: 'Review lecture notes and complete active recall problems.',
  };

  if (upcomingExam && upcomingExam.daysLeft <= 14) {
    const nextTopic =
      upcomingExam.exam.syllabus.find((t) => !upcomingExam.exam.completedTopics.includes(t)) ??
      upcomingExam.exam.syllabus[0] ??
      'Key concepts';
    recommendedStudy = {
      subject: upcomingExam.exam.subjectName,
      durationLabel: '90 min deep work',
      reason: `Focus on "${nextTopic}" — exam in ${upcomingExam.daysLeft} ${
        upcomingExam.daysLeft === 1 ? 'day' : 'days'
      }.`,
    };
  } else if (urgentAssignment) {
    recommendedStudy = {
      subject: urgentAssignment.item.subjectName,
      durationLabel: '60 min sprint',
      reason: `Complete "${urgentAssignment.item.title}" before deadline.`,
    };
  }

  // Next upcoming event
  const upcomingEvents = state.events
    .filter((e) => getDaysUntil(e.date, now) >= 0)
    .sort((a, b) => getDaysUntil(a.date, now) - getDaysUntil(b.date, now));
  const featuredEvent = upcomingEvents[0] ?? state.events[0] ?? null;

  return {
    nextClass,
    urgentAssignment,
    upcomingExam,
    attendanceWarning: belowThreshold,
    recommendedStudy,
    featuredEvent,
  };
}

export function buildStudentNotifications(
  state: CampusState,
  now: Date = new Date()
): CampusNotification[] {
  const notifications: CampusNotification[] = [];
  const readSet = new Set(state.readNotificationIds);
  const threshold = state.academicSettings.attendanceThreshold || 75;
  const prefs = state.notificationPrefs;

  if (prefs.attendance) {
    for (const subject of state.subjects) {
      const pct = calculateAttendancePct(subject.attended, subject.conducted);
      if (pct < threshold) {
        const forecast = calculateAttendanceForecast(subject.attended, subject.conducted, threshold);
        const id = `att-${subject.id}-${subject.conducted}-${subject.attended}`;
        notifications.push({
          id,
          category: 'attendance',
          severity: pct < threshold - 5 ? 'critical' : 'warning',
          title: `${subject.name} attendance below ${threshold}%`,
          message: `Currently at ${pct}%. Attend next ${forecast.classesNeededToReach} ${
            forecast.classesNeededToReach === 1 ? 'class' : 'classes'
          } to recover.`,
          timestamp: 'Updated live',
          targetSection: 'attendance',
          read: readSet.has(id),
        });
      }
    }
  }

  if (prefs.assignments) {
    for (const item of state.assignments) {
      if (item.status === 'completed') continue;
      const days = getDaysUntil(item.dueDate, now);
      if (days <= 2) {
        const id = `asgn-${item.id}-${item.dueDate}`;
        const label =
          days < 0
            ? `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'}`
            : days === 0
              ? 'Due today'
              : days === 1
                ? 'Due tomorrow'
                : 'Due in 2 days';
        notifications.push({
          id,
          category: 'assignment',
          severity: days <= 0 ? 'critical' : 'warning',
          title: `${item.subjectName}: ${item.title}`,
          message: `${label} · ${item.priority.toUpperCase()} priority.`,
          timestamp: item.dueDate,
          targetSection: 'assignments',
          read: readSet.has(id),
        });
      }
    }
  }

  if (prefs.exams) {
    for (const exam of state.exams) {
      const days = getDaysUntil(exam.date, now);
      if (days >= 0 && days <= 14) {
        const id = `exam-${exam.id}-${exam.date}`;
        notifications.push({
          id,
          category: 'exam',
          severity: days <= 3 ? 'warning' : 'info',
          title: `${exam.subjectName} ${exam.title} in ${days} ${days === 1 ? 'day' : 'days'}`,
          message: `${exam.time} at ${exam.venue} · Prep ${exam.prepProgress}% complete.`,
          timestamp: exam.date,
          targetSection: 'exams',
          read: readSet.has(id),
        });
      }
    }
  }

  if (prefs.classes) {
    const todayClasses = getTodayScheduleWithStatus(state.timetable, now);
    const upcomingSlot = todayClasses.find((c) => c.status === 'current' || c.status === 'upcoming');
    if (upcomingSlot) {
      const id = `class-${upcomingSlot.slot.id}`;
      notifications.push({
        id,
        category: 'class',
        severity: 'info',
        title:
          upcomingSlot.status === 'current'
            ? `In session: ${upcomingSlot.slot.subjectName}`
            : `Next class: ${upcomingSlot.slot.subjectName}`,
        message: `${upcomingSlot.slot.startTime}–${upcomingSlot.slot.endTime} · ${upcomingSlot.slot.room}`,
        timestamp: 'Today',
        targetSection: 'timetable',
        read: readSet.has(id),
      });
    }
  }

  if (prefs.events) {
    const nextEvent = state.events.find((e) => getDaysUntil(e.date, now) >= 0 && getDaysUntil(e.date, now) <= 7);
    if (nextEvent) {
      const id = `event-${nextEvent.id}`;
      notifications.push({
        id,
        category: 'event',
        severity: 'info',
        title: `Campus Event: ${nextEvent.title}`,
        message: `${nextEvent.date} · ${nextEvent.location}`,
        timestamp: nextEvent.date,
        targetSection: 'events',
        read: readSet.has(id),
      });
    }
  }

  if (prefs.studyReminders && state.studyPlans.length > 0) {
    const activePlan = state.studyPlans[0];
    const id = `study-${activePlan.id}`;
    notifications.push({
      id,
      category: 'study',
      severity: 'info',
      title: `Active Study Plan: ${activePlan.subject}`,
      message: `${activePlan.hoursPerDay}h/day schedule toward ${activePlan.examDate}.`,
      timestamp: 'Daily reminder',
      targetSection: 'planner',
      read: readSet.has(id),
    });
  }

  return notifications;
}
