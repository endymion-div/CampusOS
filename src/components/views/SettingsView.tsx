import React, { useState } from 'react';
import { Download, LogOut, Moon, RotateCcw, Save, Sun } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import { ConfirmDialog, SafeImage } from '../ui/CommonUI';

export const SettingsView: React.FC = () => {
  const {
    state,
    auth,
    theme,
    setTheme,
    updateProfile,
    updateNotificationPrefs,
    updateAcademicSettings,
    exportAllData,
    resetDemoData,
    logout,
  } = useCampus();

  const [name, setName] = useState(state.profile.name);
  const [email, setEmail] = useState(state.profile.email);
  const [university, setUniversity] = useState(state.profile.university);
  const [course, setCourse] = useState(state.profile.course);
  const [semester, setSemester] = useState(String(state.profile.semester));
  const [section, setSection] = useState(state.profile.section);
  const [studentId, setStudentId] = useState(state.profile.studentId);

  const [threshold, setThreshold] = useState(String(state.academicSettings.attendanceThreshold));
  const [dailyGoal, setDailyGoal] = useState(String(state.academicSettings.dailyStudyGoalHours));

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      university: university.trim(),
      course: course.trim(),
      semester: Number(semester) || 1,
      section: section.trim(),
      studentId: studentId.trim(),
    });
  };

  const handleSaveAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    updateAcademicSettings({
      attendanceThreshold: Math.max(50, Math.min(95, Number(threshold) || 75)),
      dailyStudyGoalHours: Math.max(0.5, Math.min(14, Number(dailyGoal) || 3)),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Settings */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <SafeImage
            src={state.profile.avatarUrl}
            alt={state.profile.name}
            className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">
              Student Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Auth mode: {auth.mode === 'supabase' ? 'Supabase Cloud' : 'Local Persistent Workspace'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="set-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                id="set-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="set-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                id="set-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="set-uni" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                University
              </label>
              <input
                id="set-uni"
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="set-course" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course
              </label>
              <input
                id="set-course"
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="set-sem" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Semester
              </label>
              <input
                id="set-sem"
                type="number"
                min={1}
                max={12}
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="set-sec" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Section
                </label>
                <input
                  id="set-sec"
                  type="text"
                  required
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="set-id" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Student ID
                </label>
                <input
                  id="set-id"
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </form>
      </section>

      {/* Appearance & Academic Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">Theme & Preferences</h3>
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark Mode</span>
            </button>
          </div>

          <div className="pt-2 space-y-2.5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Notification Channels
            </p>
            {(
              [
                ['classes', 'Upcoming class alerts'],
                ['assignments', 'Assignment deadline reminders'],
                ['exams', 'Exam countdown alerts'],
                ['attendance', 'Low attendance warnings'],
                ['events', 'Campus event digests'],
                ['studyReminders', 'Daily study plan reminders'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={state.notificationPrefs[key]}
                  onChange={(e) => updateNotificationPrefs({ [key]: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">Academic Rules</h3>
          <form onSubmit={handleSaveAcademic} className="space-y-4">
            <div>
              <label htmlFor="ac-thresh" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Minimum Attendance Threshold (%)
              </label>
              <input
                id="ac-thresh"
                type="number"
                min={50}
                max={95}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label htmlFor="ac-goal" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Daily Self-Study Goal (hours)
              </label>
              <input
                id="ac-goal"
                type="number"
                step="0.5"
                min={0.5}
                max={14}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Academic Rules
            </button>
          </form>
        </section>
      </div>

      {/* Data Export, Reset & Logout */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportAllData}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Data</span>
          </button>
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </section>

      <ConfirmDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={resetDemoData}
        title="Reset Demo Data"
        description="Restore Sneha’s original Semester 1 timetable, attendance, assignments, exams, and campus records? Any custom edits will be overwritten."
        confirmLabel="Reset Data"
        danger
      />
    </div>
  );
};
