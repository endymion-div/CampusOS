import React, { useState } from 'react';
import { ArrowRight, KeyRound, Mail, UserCheck } from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { ModalDialog } from './ui/CommonUI';

export type AuthTab = 'login' | 'signup' | 'forgot';

export const AuthModal: React.FC<{
  open: boolean;
  initialTab?: AuthTab;
  onClose: () => void;
}> = ({ open, initialTab = 'login', onClose }) => {
  const { loginWithEmail, loginDemoStudent, signUpStudent, requestPasswordReset } = useCampus();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('sneha.nair@campusos.edu');
  const [loginPassword, setLoginPassword] = useState('campus2026');

  // Sign up fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('B.Tech CSE (AI & ML)');
  const [semester, setSemester] = useState('1');
  const [section, setSection] = useState('CS-AI-A');
  const [studentId, setStudentId] = useState('');

  // Forgot password field
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginWithEmail(loginEmail, loginPassword);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || 'Unable to sign in.');
    } else {
      onClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signUpStudent({
      name,
      email,
      password,
      university,
      course,
      semester: Number(semester) || 1,
      section,
      studentId,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error || 'Unable to create account.');
    } else {
      onClose();
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const res = await requestPasswordReset(resetEmail);
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
    } else {
      setNotice(res.message);
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={
        tab === 'login'
          ? 'Sign in to CampusOS'
          : tab === 'signup'
            ? 'Create your student workspace'
            : 'Reset account password'
      }
      subtitle={
        isSupabaseConfigured
          ? 'Connected via Supabase Authentication'
          : 'Local persistent workspace mode · Instant demo access available'
      }
      maxWidthClass="max-w-lg"
    >
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 mb-5">
        <button
          type="button"
          onClick={() => {
            setTab('login');
            setError(null);
            setNotice(null);
          }}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            tab === 'login'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('signup');
            setError(null);
            setNotice(null);
          }}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            tab === 'signup'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('forgot');
            setError(null);
            setNotice(null);
          }}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            tab === 'forgot'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Forgot Password
        </button>
      </div>

      {error ? (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300">
          {notice}
        </div>
      ) : null}

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="auth-login-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              University Email
            </label>
            <input
              id="auth-login-email"
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@university.edu"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label htmlFor="auth-login-password" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="auth-login-password"
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                loginDemoStudent();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Continue as Sneha Nair (Semester 1 Demo)</span>
            </button>
          </div>
        </form>
      ) : null}

      {tab === 'signup' ? (
        <form onSubmit={handleSignUp} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="su-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                id="su-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="su-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                id="su-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@university.edu"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="su-uni" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                University
              </label>
              <input
                id="su-uni"
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Institute of Technology"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="su-course" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course / Major
              </label>
              <input
                id="su-course"
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="B.Tech CSE (AI & ML)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="su-sem" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Semester
              </label>
              <input
                id="su-sem"
                type="number"
                min={1}
                max={12}
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="su-sec" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Section
              </label>
              <input
                id="su-sec"
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="CS-AI-A"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="su-id" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Student ID
              </label>
              <input
                id="su-id"
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="26CS1049"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="su-pass" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password (min 6 chars)
            </label>
            <input
              id="su-pass"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Creating workspace...' : 'Create Student Account'}
          </button>
        </form>
      ) : null}

      {tab === 'forgot' ? (
        <form onSubmit={handleForgot} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Enter your registered university email to receive a password recovery instruction.
          </p>
          <div>
            <label htmlFor="fp-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="fp-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="sneha.nair@campusos.edu"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Sending...' : 'Send Recovery Link'}</span>
          </button>
        </form>
      ) : null}
    </ModalDialog>
  );
};
