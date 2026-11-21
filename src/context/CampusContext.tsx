import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createDemoCampusState } from '../data/demoData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import type {
  AcademicSettings,
  AiChatMessage,
  AssignmentItem,
  CampusClub,
  CampusEvent,
  CampusIntelligenceReport,
  CampusNotification,
  CampusResource,
  CampusState,
  DayOfWeek,
  ExamItem,
  LostFoundItem,
  NavSection,
  NotificationPrefs,
  SemesterCourse,
  SemesterRecord,
  StudentProfile,
  StudyPlan,
  SubjectRecord,
  ThemeMode,
  TimetableSlot,
} from '../types/campus';
import {
  buildStudentNotifications,
  calculateAttendancePct,
  calculateCGPA,
  calculateOverallAttendance,
  getDaysUntil,
} from '../utils/academicMath';

const STATE_STORAGE_KEY = 'campusos_state_v1';
const AUTH_STORAGE_KEY = 'campusos_auth_v1';
const THEME_STORAGE_KEY = 'campusos_theme_v1';
const USERS_STORAGE_KEY = 'campusos_local_users_v1';

export interface AuthSession {
  authenticated: boolean;
  mode: 'demo' | 'local' | 'supabase';
  email: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  university: string;
  course: string;
  semester: number;
  section: string;
  studentId: string;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone?: 'default' | 'success' | 'warning' | 'error';
}

export interface StudyPlannerPrefill {
  subject: string;
  examDate: string;
  topics: string;
}

interface CampusContextValue {
  state: CampusState;
  auth: AuthSession;
  theme: ThemeMode;
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Auth
  loginWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginDemoStudent: () => void;
  signUpStudent: (input: SignUpInput) => Promise<{ ok: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; message: string }>;
  logout: () => Promise<void>;

  // Profile & Settings
  updateProfile: (patch: Partial<StudentProfile>) => void;
  updateNotificationPrefs: (patch: Partial<NotificationPrefs>) => void;
  updateAcademicSettings: (patch: Partial<AcademicSettings>) => void;
  resetDemoData: () => void;
  exportAllData: () => void;

  // Attendance & Subjects
  markAttendance: (subjectId: string, present: boolean) => void;
  editSubjectAttendance: (subjectId: string, attended: number, conducted: number) => void;
  addSubject: (subject: Omit<SubjectRecord, 'id' | 'weeklyTrend'>) => void;

  // Timetable
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (id: string, patch: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  duplicateDayTimetable: (fromDay: DayOfWeek, toDay: DayOfWeek) => void;

  // Assignments
  addAssignment: (item: Omit<AssignmentItem, 'id'>) => void;
  updateAssignment: (id: string, patch: Partial<AssignmentItem>) => void;
  deleteAssignment: (id: string) => void;

  // Exams & Study Planner bridge
  addExam: (exam: Omit<ExamItem, 'id'>) => void;
  updateExam: (id: string, patch: Partial<ExamItem>) => void;
  deleteExam: (id: string) => void;
  plannerPrefill: StudyPlannerPrefill | null;
  setPlannerPrefill: (prefill: StudyPlannerPrefill | null) => void;
  openStudyPlannerForExam: (exam: ExamItem) => void;

  // SGPA / CGPA
  addSemester: (name: string) => void;
  addCourseToSemester: (semesterId: string, course: Omit<SemesterCourse, 'id'>) => void;
  updateSemesterCourse: (semesterId: string, courseId: string, patch: Partial<SemesterCourse>) => void;
  removeSemesterCourse: (semesterId: string, courseId: string) => void;

  // Study Plans
  addStudyPlan: (plan: StudyPlan) => void;
  toggleStudyPlanTask: (planId: string, dayNumber: number, taskId: string) => void;
  deleteStudyPlan: (planId: string) => void;

  // AI Assistant & Insights
  appendAiMessages: (messages: AiChatMessage[]) => void;
  clearAiChat: () => void;
  setIntelligenceReport: (report: CampusIntelligenceReport) => void;
  buildAiContextPayload: () => Record<string, unknown>;

  // Events, Clubs, Lost & Found, Resources
  toggleEventRegistration: (eventId: string) => void;
  toggleEventSaved: (eventId: string) => void;
  addCampusEvent: (event: Omit<CampusEvent, 'id' | 'registered' | 'saved' | 'attendeesCount'>) => void;
  toggleClubMembership: (clubId: string) => void;
  addLostFoundItem: (item: Omit<LostFoundItem, 'id' | 'resolved'>) => void;
  toggleLostFoundResolved: (id: string) => void;
  addResource: (resource: Omit<CampusResource, 'id' | 'downloads' | 'bookmarked' | 'uploadedAt'>) => void;
  toggleResourceBookmark: (id: string) => void;
  incrementResourceDownload: (id: string) => void;

  // Notifications
  notifications: CampusNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const CampusContext = createContext<CampusContextValue | null>(null);

function loadInitialState(): CampusState {
  try {
    const raw = localStorage.getItem(STATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CampusState>;
      if (parsed && parsed.profile && Array.isArray(parsed.subjects)) {
        const fallback = createDemoCampusState();
        return { ...fallback, ...parsed };
      }
    }
  } catch {
    // ignore storage parse error
  }
  return createDemoCampusState();
}

function loadInitialAuth(): AuthSession {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return { authenticated: true, mode: 'demo', email: 'sneha.nair@campusos.edu' };
    }
  }
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed && typeof parsed.authenticated === 'boolean') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { authenticated: false, mode: 'demo', email: '' };
}

function loadInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // ignore
  }
  return 'light';
}

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CampusState>(loadInitialState);
  const [auth, setAuth] = useState<AuthSession>(loadInitialAuth);
  const [theme, setThemeState] = useState<ThemeMode>(loadInitialTheme);
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [plannerPrefill, setPlannerPrefill] = useState<StudyPlannerPrefill | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota error
    }
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch {
      // ignore
    }
  }, [auth]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen to Supabase auth changes if configured
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setAuth({
          authenticated: true,
          mode: 'supabase',
          email: data.session.user.email ?? '',
        });
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuth({
          authenticated: true,
          mode: 'supabase',
          email: session.user.email ?? '',
        });
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      setTimeout(() => {
        dismissToast(id);
      }, 4000);
    },
    [dismissToast]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
  }, []);

  const loginDemoStudent = useCallback(() => {
    setAuth({
      authenticated: true,
      mode: 'demo',
      email: state.profile.email || 'sneha.nair@campusos.edu',
    });
    setActiveSection('dashboard');
    pushToast({
      title: 'Signed in as Sneha Nair',
      description: 'Demo workspace ready with Semester 1 academic data.',
      tone: 'success',
    });
  }, [state.profile.email, pushToast]);

  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !password) {
        return { ok: false, error: 'Please enter both email and password.' };
      }

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) {
          return { ok: false, error: error.message };
        }
        setAuth({ authenticated: true, mode: 'supabase', email: trimmedEmail });
        setActiveSection('dashboard');
        pushToast({ title: 'Welcome back to CampusOS', tone: 'success' });
        return { ok: true };
      }

      // Local fallback auth mode
      if (
        trimmedEmail === 'sneha.nair@campusos.edu' ||
        trimmedEmail === state.profile.email.toLowerCase()
      ) {
        setAuth({ authenticated: true, mode: 'local', email: trimmedEmail });
        setActiveSection('dashboard');
        pushToast({ title: `Welcome back, ${state.profile.name}`, tone: 'success' });
        return { ok: true };
      }

      try {
        const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
        const users: Record<string, { password: string; profile: Partial<StudentProfile> }> = rawUsers
          ? JSON.parse(rawUsers)
          : {};
        const matched = users[trimmedEmail];
        if (!matched || matched.password !== password) {
          return {
            ok: false,
            error: 'Invalid credentials. Try signing up or use the one-click Sneha demo login.',
          };
        }
        setState((prev) => ({
          ...prev,
          profile: { ...prev.profile, ...matched.profile, email: trimmedEmail },
        }));
        setAuth({ authenticated: true, mode: 'local', email: trimmedEmail });
        setActiveSection('dashboard');
        pushToast({
          title: `Welcome back, ${matched.profile.name || 'Student'}`,
          tone: 'success',
        });
        return { ok: true };
      } catch {
        return { ok: false, error: 'Authentication storage error.' };
      }
    },
    [pushToast, state.profile.email, state.profile.name]
  );

  const signUpStudent = useCallback(
    async (input: SignUpInput): Promise<{ ok: boolean; error?: string }> => {
      const trimmedEmail = input.email.trim().toLowerCase();
      if (!input.name.trim() || !trimmedEmail || input.password.length < 6) {
        return {
          ok: false,
          error: 'Name, valid email, and a password of at least 6 characters are required.',
        };
      }

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: input.password,
          options: {
            data: {
              name: input.name,
              university: input.university,
              course: input.course,
              semester: input.semester,
              section: input.section,
              studentId: input.studentId,
            },
          },
        });
        if (error) {
          return { ok: false, error: error.message };
        }
      } else {
        try {
          const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
          const users: Record<string, { password: string; profile: Partial<StudentProfile> }> = rawUsers
            ? JSON.parse(rawUsers)
            : {};
          users[trimmedEmail] = {
            password: input.password,
            profile: {
              name: input.name.trim(),
              email: trimmedEmail,
              university: input.university.trim(),
              course: input.course.trim(),
              semester: Number(input.semester) || 1,
              section: input.section.trim(),
              studentId: input.studentId.trim(),
            },
          };
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch {
          return { ok: false, error: 'Unable to save account locally.' };
        }
      }

      setState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: input.name.trim(),
          email: trimmedEmail,
          university: input.university.trim() || prev.profile.university,
          course: input.course.trim() || prev.profile.course,
          semester: Number(input.semester) || 1,
          section: input.section.trim() || prev.profile.section,
          studentId: input.studentId.trim() || prev.profile.studentId,
        },
      }));
      setAuth({
        authenticated: true,
        mode: isSupabaseConfigured ? 'supabase' : 'local',
        email: trimmedEmail,
      });
      setActiveSection('dashboard');
      pushToast({
        title: 'Account created',
        description: `Welcome to CampusOS, ${input.name.trim()}.`,
        tone: 'success',
      });
      return { ok: true };
    },
    [pushToast]
  );

  const requestPasswordReset = useCallback(
    async (email: string): Promise<{ ok: boolean; message: string }> => {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        return { ok: false, message: 'Enter a valid university email address.' };
      }
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
        if (error) return { ok: false, message: error.message };
        return {
          ok: true,
          message: `Password reset link sent to ${trimmedEmail}.`,
        };
      }
      return {
        ok: true,
        message: `Local demo reset confirmed for ${trimmedEmail}. You may sign in with your updated session or use Demo Login.`,
      };
    },
    []
  );

  const logout = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setAuth({ authenticated: false, mode: 'demo', email: '' });
    setActiveSection('dashboard');
    pushToast({ title: 'Signed out of CampusOS' });
  }, [pushToast]);

  const updateProfile = useCallback(
    (patch: Partial<StudentProfile>) => {
      setState((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...patch },
      }));
      pushToast({ title: 'Student profile updated', tone: 'success' });
    },
    [pushToast]
  );

  const updateNotificationPrefs = useCallback((patch: Partial<NotificationPrefs>) => {
    setState((prev) => ({
      ...prev,
      notificationPrefs: { ...prev.notificationPrefs, ...patch },
    }));
  }, []);

  const updateAcademicSettings = useCallback(
    (patch: Partial<AcademicSettings>) => {
      setState((prev) => ({
        ...prev,
        academicSettings: { ...prev.academicSettings, ...patch },
      }));
      pushToast({ title: 'Academic settings saved', tone: 'success' });
    },
    [pushToast]
  );

  const resetDemoData = useCallback(() => {
    const fresh = createDemoCampusState();
    setState(fresh);
    pushToast({
      title: 'Demo dataset restored',
      description: 'Sneha’s Semester 1 baseline has been reloaded.',
      tone: 'success',
    });
  }, [pushToast]);

  const exportAllData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusos-export-${state.profile.studentId || 'student'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast({ title: 'Exported CampusOS JSON backup', tone: 'success' });
  }, [state, pushToast]);

  const markAttendance = useCallback(
    (subjectId: string, present: boolean) => {
      setState((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) => {
          if (s.id !== subjectId) return s;
          const conducted = s.conducted + 1;
          const attended = present ? s.attended + 1 : s.attended;
          const pct = calculateAttendancePct(attended, conducted);
          return {
            ...s,
            conducted,
            attended,
            weeklyTrend: [...s.weeklyTrend.slice(-5), pct],
          };
        }),
      }));
      pushToast({
        title: present ? 'Marked Present' : 'Marked Absent',
        tone: present ? 'success' : 'warning',
      });
    },
    [pushToast]
  );

  const editSubjectAttendance = useCallback(
    (subjectId: string, attended: number, conducted: number) => {
      const safeConducted = Math.max(0, conducted);
      const safeAttended = Math.max(0, Math.min(attended, safeConducted));
      setState((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) => {
          if (s.id !== subjectId) return s;
          const pct = calculateAttendancePct(safeAttended, safeConducted);
          return {
            ...s,
            attended: safeAttended,
            conducted: safeConducted,
            weeklyTrend: [...s.weeklyTrend.slice(-5), pct],
          };
        }),
      }));
      pushToast({ title: 'Attendance counts updated', tone: 'success' });
    },
    [pushToast]
  );

  const addSubject = useCallback(
    (subject: Omit<SubjectRecord, 'id' | 'weeklyTrend'>) => {
      const pct = calculateAttendancePct(subject.attended, subject.conducted);
      const created: SubjectRecord = {
        ...subject,
        id: `sub-${Date.now()}`,
        weeklyTrend: [pct],
      };
      setState((prev) => ({ ...prev, subjects: [...prev.subjects, created] }));
      pushToast({ title: `Added ${subject.name}`, tone: 'success' });
    },
    [pushToast]
  );

  const addTimetableSlot = useCallback(
    (slot: Omit<TimetableSlot, 'id'>) => {
      const created: TimetableSlot = { ...slot, id: `tt-${Date.now()}` };
      setState((prev) => ({ ...prev, timetable: [...prev.timetable, created] }));
      pushToast({ title: `Added ${slot.subjectName} to ${slot.day}`, tone: 'success' });
    },
    [pushToast]
  );

  const updateTimetableSlot = useCallback(
    (id: string, patch: Partial<TimetableSlot>) => {
      setState((prev) => ({
        ...prev,
        timetable: prev.timetable.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)),
      }));
      pushToast({ title: 'Timetable slot updated', tone: 'success' });
    },
    [pushToast]
  );

  const deleteTimetableSlot = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        timetable: prev.timetable.filter((slot) => slot.id !== id),
      }));
      pushToast({ title: 'Class removed from timetable' });
    },
    [pushToast]
  );

  const duplicateDayTimetable = useCallback(
    (fromDay: DayOfWeek, toDay: DayOfWeek) => {
      if (fromDay === toDay) return;
      setState((prev) => {
        const source = prev.timetable.filter((t) => t.day === fromDay);
        const cloned = source.map((t, idx) => ({
          ...t,
          id: `tt-${Date.now()}-${idx}`,
          day: toDay,
        }));
        return {
          ...prev,
          timetable: [...prev.timetable, ...cloned],
        };
      });
      pushToast({
        title: `Duplicated ${fromDay} schedule to ${toDay}`,
        tone: 'success',
      });
    },
    [pushToast]
  );

  const addAssignment = useCallback(
    (item: Omit<AssignmentItem, 'id'>) => {
      const created: AssignmentItem = { ...item, id: `asgn-${Date.now()}` };
      setState((prev) => ({ ...prev, assignments: [created, ...prev.assignments] }));
      pushToast({ title: `Assignment "${item.title}" added`, tone: 'success' });
    },
    [pushToast]
  );

  const updateAssignment = useCallback((id: string, patch: Partial<AssignmentItem>) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const deleteAssignment = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        assignments: prev.assignments.filter((a) => a.id !== id),
      }));
      pushToast({ title: 'Assignment deleted' });
    },
    [pushToast]
  );

  const addExam = useCallback(
    (exam: Omit<ExamItem, 'id'>) => {
      const created: ExamItem = { ...exam, id: `exam-${Date.now()}` };
      setState((prev) => ({ ...prev, exams: [...prev.exams, created] }));
      pushToast({ title: `Exam "${exam.subjectName}" scheduled`, tone: 'success' });
    },
    [pushToast]
  );

  const updateExam = useCallback((id: string, patch: Partial<ExamItem>) => {
    setState((prev) => ({
      ...prev,
      exams: prev.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const deleteExam = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        exams: prev.exams.filter((e) => e.id !== id),
      }));
      pushToast({ title: 'Exam removed' });
    },
    [pushToast]
  );

  const openStudyPlannerForExam = useCallback((exam: ExamItem) => {
    setPlannerPrefill({
      subject: exam.subjectName,
      examDate: exam.date,
      topics: exam.syllabus.join(', '),
    });
    setActiveSection('planner');
  }, []);

  const addSemester = useCallback(
    (name: string) => {
      setState((prev) => {
        const nextNum = prev.semesters.length;
        const created: SemesterRecord = {
          id: `sem-${Date.now()}`,
          name: name.trim() || `Semester ${nextNum + 1}`,
          semesterNumber: nextNum + 1,
          courses: [
            {
              id: `sc-${Date.now()}`,
              subject: 'Core Engineering Subject',
              credits: 4,
              grade: 'A+',
            },
          ],
        };
        return { ...prev, semesters: [created, ...prev.semesters] };
      });
      pushToast({ title: 'Semester added to calculator', tone: 'success' });
    },
    [pushToast]
  );

  const addCourseToSemester = useCallback(
    (semesterId: string, course: Omit<SemesterCourse, 'id'>) => {
      setState((prev) => ({
        ...prev,
        semesters: prev.semesters.map((sem) =>
          sem.id === semesterId
            ? { ...sem, courses: [...sem.courses, { ...course, id: `sc-${Date.now()}` }] }
            : sem
        ),
      }));
    },
    []
  );

  const updateSemesterCourse = useCallback(
    (semesterId: string, courseId: string, patch: Partial<SemesterCourse>) => {
      setState((prev) => ({
        ...prev,
        semesters: prev.semesters.map((sem) =>
          sem.id === semesterId
            ? {
                ...sem,
                courses: sem.courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c)),
              }
            : sem
        ),
      }));
    },
    []
  );

  const removeSemesterCourse = useCallback((semesterId: string, courseId: string) => {
    setState((prev) => ({
      ...prev,
      semesters: prev.semesters.map((sem) =>
        sem.id === semesterId
          ? { ...sem, courses: sem.courses.filter((c) => c.id !== courseId) }
          : sem
      ),
    }));
  }, []);

  const addStudyPlan = useCallback(
    (plan: StudyPlan) => {
      setState((prev) => ({ ...prev, studyPlans: [plan, ...prev.studyPlans] }));
      pushToast({ title: `Study plan created for ${plan.subject}`, tone: 'success' });
    },
    [pushToast]
  );

  const toggleStudyPlanTask = useCallback((planId: string, dayNumber: number, taskId: string) => {
    setState((prev) => ({
      ...prev,
      studyPlans: prev.studyPlans.map((plan) => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          days: plan.days.map((day) => {
            if (day.dayNumber !== dayNumber) return day;
            return {
              ...day,
              tasks: day.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
            };
          }),
        };
      }),
    }));
  }, []);

  const deleteStudyPlan = useCallback((planId: string) => {
    setState((prev) => ({
      ...prev,
      studyPlans: prev.studyPlans.filter((p) => p.id !== planId),
    }));
  }, []);

  const appendAiMessages = useCallback((messages: AiChatMessage[]) => {
    setState((prev) => ({ ...prev, aiChat: [...prev.aiChat, ...messages] }));
  }, []);

  const clearAiChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      aiChat: prev.aiChat.slice(0, 1),
    }));
  }, []);

  const setIntelligenceReport = useCallback((report: CampusIntelligenceReport) => {
    setState((prev) => ({ ...prev, intelligenceReport: report }));
  }, []);

  const buildAiContextPayload = useCallback(() => {
    const overallAttendance = calculateOverallAttendance(state.subjects);
    const { cgpa } = calculateCGPA(state.semesters, state.academicSettings.gradeScale);
    return {
      student: {
        name: state.profile.name,
        course: state.profile.course,
        semester: state.profile.semester,
        dailyStudyGoalHours: state.academicSettings.dailyStudyGoalHours,
      },
      overallAttendancePct: overallAttendance,
      cgpa,
      subjects: state.subjects.map((s) => ({
        code: s.code,
        name: s.name,
        attendancePct: calculateAttendancePct(s.attended, s.conducted),
        attended: s.attended,
        conducted: s.conducted,
      })),
      pendingAssignments: state.assignments
        .filter((a) => a.status !== 'completed')
        .map((a) => ({
          title: a.title,
          subject: a.subjectName,
          dueDate: a.dueDate,
          daysLeft: getDaysUntil(a.dueDate),
          priority: a.priority,
        })),
      upcomingExams: state.exams.map((e) => ({
        subject: e.subjectName,
        title: e.title,
        date: e.date,
        daysLeft: getDaysUntil(e.date),
        prepProgress: e.prepProgress,
        remainingTopics: e.syllabus.filter((t) => !e.completedTopics.includes(t)),
      })),
      timetableDaysCount: state.timetable.length,
    };
  }, [state]);

  const toggleEventRegistration = useCallback(
    (eventId: string) => {
      setState((prev) => ({
        ...prev,
        events: prev.events.map((e) => {
          if (e.id !== eventId) return e;
          const nextReg = !e.registered;
          return {
            ...e,
            registered: nextReg,
            attendeesCount: nextReg ? e.attendeesCount + 1 : Math.max(0, e.attendeesCount - 1),
          };
        }),
      }));
      pushToast({ title: 'Event registration updated', tone: 'success' });
    },
    [pushToast]
  );

  const toggleEventSaved = useCallback((eventId: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === eventId ? { ...e, saved: !e.saved } : e)),
    }));
  }, []);

  const addCampusEvent = useCallback(
    (event: Omit<CampusEvent, 'id' | 'registered' | 'saved' | 'attendeesCount'>) => {
      const created: CampusEvent = {
        ...event,
        id: `evt-${Date.now()}`,
        registered: true,
        saved: true,
        attendeesCount: 1,
      };
      setState((prev) => ({ ...prev, events: [created, ...prev.events] }));
      pushToast({ title: `Published event "${event.title}"`, tone: 'success' });
    },
    [pushToast]
  );

  const toggleClubMembership = useCallback(
    (clubId: string) => {
      setState((prev) => ({
        ...prev,
        clubs: prev.clubs.map((c) => {
          if (c.id !== clubId) return c;
          const nextJoined = !c.joined;
          return {
            ...c,
            joined: nextJoined,
            membersCount: nextJoined ? c.membersCount + 1 : Math.max(0, c.membersCount - 1),
          };
        }),
      }));
      pushToast({ title: 'Club membership updated', tone: 'success' });
    },
    [pushToast]
  );

  const addLostFoundItem = useCallback(
    (item: Omit<LostFoundItem, 'id' | 'resolved'>) => {
      const created: LostFoundItem = {
        ...item,
        id: `lf-${Date.now()}`,
        resolved: false,
      };
      setState((prev) => ({ ...prev, lostFound: [created, ...prev.lostFound] }));
      pushToast({ title: `Posted ${item.kind} item report`, tone: 'success' });
    },
    [pushToast]
  );

  const toggleLostFoundResolved = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      lostFound: prev.lostFound.map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i)),
    }));
  }, []);

  const addResource = useCallback(
    (resource: Omit<CampusResource, 'id' | 'downloads' | 'bookmarked' | 'uploadedAt'>) => {
      const created: CampusResource = {
        ...resource,
        id: `res-${Date.now()}`,
        downloads: 1,
        bookmarked: true,
        uploadedAt: new Date().toISOString().slice(0, 10),
      };
      setState((prev) => ({ ...prev, resources: [created, ...prev.resources] }));
      pushToast({ title: `Uploaded "${resource.title}"`, tone: 'success' });
    },
    [pushToast]
  );

  const toggleResourceBookmark = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === id ? { ...r, bookmarked: !r.bookmarked } : r)),
    }));
  }, []);

  const incrementResourceDownload = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        resources: prev.resources.map((r) => (r.id === id ? { ...r, downloads: r.downloads + 1 } : r)),
      }));
      pushToast({ title: 'Study resource downloaded', tone: 'success' });
    },
    [pushToast]
  );

  const notifications = useMemo(() => buildStudentNotifications(state), [state]);
  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      readNotificationIds: prev.readNotificationIds.includes(id)
        ? prev.readNotificationIds
        : [...prev.readNotificationIds, id],
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      readNotificationIds: notifications.map((n) => n.id),
    }));
  }, [notifications]);

  const value: CampusContextValue = {
    state,
    auth,
    theme,
    activeSection,
    setActiveSection,
    toggleTheme,
    setTheme,
    toasts,
    pushToast,
    dismissToast,
    loginWithEmail,
    loginDemoStudent,
    signUpStudent,
    requestPasswordReset,
    logout,
    updateProfile,
    updateNotificationPrefs,
    updateAcademicSettings,
    resetDemoData,
    exportAllData,
    markAttendance,
    editSubjectAttendance,
    addSubject,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    duplicateDayTimetable,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    addExam,
    updateExam,
    deleteExam,
    plannerPrefill,
    setPlannerPrefill,
    openStudyPlannerForExam,
    addSemester,
    addCourseToSemester,
    updateSemesterCourse,
    removeSemesterCourse,
    addStudyPlan,
    toggleStudyPlanTask,
    deleteStudyPlan,
    appendAiMessages,
    clearAiChat,
    setIntelligenceReport,
    buildAiContextPayload,
    toggleEventRegistration,
    toggleEventSaved,
    addCampusEvent,
    toggleClubMembership,
    addLostFoundItem,
    toggleLostFoundResolved,
    addResource,
    toggleResourceBookmark,
    incrementResourceDownload,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
};

export function useCampus(): CampusContextValue {
  const ctx = useContext(CampusContext);
  if (!ctx) {
    throw new Error('useCampus must be used inside CampusProvider');
  }
  return ctx;
}
