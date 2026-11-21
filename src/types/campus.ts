export type ThemeMode = 'light' | 'dark';

export type NavSection =
  | 'dashboard'
  | 'timetable'
  | 'attendance'
  | 'assignments'
  | 'exams'
  | 'cgpa'
  | 'planner'
  | 'assistant'
  | 'events'
  | 'clubs'
  | 'lost-found'
  | 'resources'
  | 'analytics'
  | 'settings';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  course: string;
  semester: number;
  section: string;
  studentId: string;
  avatarUrl: string;
}

export interface SubjectRecord {
  id: string;
  code: string;
  name: string;
  faculty: string;
  credits: number;
  color: string;
  conducted: number;
  attended: number;
  targetPct: number;
  weeklyTrend: number[];
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  faculty: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar';
  color: string;
}

export type AssignmentPriority = 'high' | 'medium' | 'low';
export type AssignmentStatus = 'pending' | 'in-progress' | 'completed';

export interface AssignmentItem {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: AssignmentPriority;
  status: AssignmentStatus;
  attachment?: string;
  notes?: string;
}

export type ExamPrepStatus = 'not-started' | 'in-progress' | 'ready';

export interface ExamItem {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // "09:30 AM"
  venue: string;
  syllabus: string[];
  completedTopics: string[];
  prepProgress: number; // 0-100
  status: ExamPrepStatus;
}

export interface SemesterCourse {
  id: string;
  subject: string;
  credits: number;
  grade: string;
}

export interface SemesterRecord {
  id: string;
  name: string;
  semesterNumber: number;
  courses: SemesterCourse[];
}

export interface StudyPlanDay {
  dayNumber: number;
  date: string;
  topic: string;
  hours: number;
  tasks: { id: string; text: string; done: boolean }[];
}

export interface StudyPlan {
  id: string;
  subject: string;
  examDate: string;
  difficulty: 'Foundational' | 'Moderate' | 'Intensive';
  hoursPerDay: number;
  createdAt: string;
  days: StudyPlanDay[];
}

export type EventCategory =
  | 'Hackathons'
  | 'Workshops'
  | 'Seminars'
  | 'Cultural'
  | 'Sports'
  | 'Clubs'
  | 'Competitions';

export interface CampusEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  organizer: string;
  description: string;
  imageUrl?: string;
  registered: boolean;
  saved: boolean;
  attendeesCount: number;
}

export type ClubCategory =
  | 'Coding'
  | 'AI/ML'
  | 'Robotics'
  | 'Music'
  | 'Dance'
  | 'Photography'
  | 'Sports'
  | 'Entrepreneurship';

export interface CampusClub {
  id: string;
  name: string;
  category: ClubCategory;
  monogram: string;
  accentColor: string;
  description: string;
  membersCount: number;
  upcomingEvent: string;
  joined: boolean;
}

export interface LostFoundItem {
  id: string;
  kind: 'lost' | 'found';
  item: string;
  category: 'Electronics' | 'ID & Keys' | 'Accessories' | 'Books & Notes' | 'Other';
  location: string;
  date: string;
  description: string;
  imageUrl?: string;
  contact: string;
  resolved: boolean;
}

export type ResourceCategory =
  | 'Notes'
  | 'Previous year papers'
  | 'Lab manuals'
  | 'Books'
  | 'Tutorials'
  | 'Lecture slides'
  | 'Study guides';

export interface CampusResource {
  id: string;
  title: string;
  subject: string;
  category: ResourceCategory;
  author: string;
  uploadedAt: string;
  fileSize: string;
  fileType: string;
  downloads: number;
  bookmarked: boolean;
  summary: string;
}

export interface CampusNotification {
  id: string;
  category: 'class' | 'assignment' | 'exam' | 'attendance' | 'event' | 'study';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  targetSection: NavSection;
  read: boolean;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CampusIntelligenceReport {
  generatedAt: string;
  weeklySummary: string;
  weakSubjects: string[];
  upcomingWorkload: string;
  attendanceRisks: string[];
  examPrepStatus: string;
  recommendedPriorities: string[];
  source: 'gemini' | 'local';
}

export interface NotificationPrefs {
  classes: boolean;
  assignments: boolean;
  exams: boolean;
  attendance: boolean;
  events: boolean;
  studyReminders: boolean;
}

export interface AcademicSettings {
  attendanceThreshold: number;
  dailyStudyGoalHours: number;
  gradeScale: Record<string, number>;
}

export interface CampusState {
  profile: StudentProfile;
  subjects: SubjectRecord[];
  timetable: TimetableSlot[];
  assignments: AssignmentItem[];
  exams: ExamItem[];
  semesters: SemesterRecord[];
  studyPlans: StudyPlan[];
  events: CampusEvent[];
  clubs: CampusClub[];
  lostFound: LostFoundItem[];
  resources: CampusResource[];
  readNotificationIds: string[];
  aiChat: AiChatMessage[];
  intelligenceReport: CampusIntelligenceReport | null;
  notificationPrefs: NotificationPrefs;
  academicSettings: AcademicSettings;
  studyHoursWeekly: { day: string; hours: number }[];
}
