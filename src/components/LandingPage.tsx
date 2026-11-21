import React, { useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  LineChart,
  MessageSquare,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCampus } from '../context/CampusContext';
import { AuthModal, type AuthTab } from './AuthModal';
import { SafeImage } from './ui/CommonUI';

const FAQS = [
  {
    q: 'Does CampusOS work immediately without setting up external servers?',
    a: 'Yes. CampusOS launches with a complete Semester 1 academic workspace for Sneha Nair stored locally in your browser, and optionally connects to Supabase Authentication and Gemini AI when credentials are provided.',
  },
  {
    q: 'How does the Attendance Forecast math work?',
    a: 'For each subject, CampusOS computes the exact integer number of consecutive classes you must attend to cross your target threshold (default 75%), or the maximum safe skips before dropping below it.',
  },
  {
    q: 'What makes the AI Study Assistant aware of my schedule?',
    a: 'When you ask a question, CampusOS includes your live subjects, current attendance percentages, upcoming exam countdowns, and pending deadlines so the study plan reflects your real workload.',
  },
  {
    q: 'Can I customize grading scales for SGPA and CGPA?',
    a: 'Yes. Inside the CGPA Calculator and Settings, you can modify grade point mappings (such as O=10, A+=9) and track multiple semesters side by side.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Before mid-sems, I never realized my Physics attendance had slipped to 71%. CampusOS flagged the exact 4 classes I needed to attend and kept me eligible for finals.',
    name: 'Rohan Kulkarni',
    role: 'B.Tech Mechanical, Semester 4 · Pune Institute of Technology',
  },
  {
    quote:
      'Having my timetable, lab manuals, and AI exam countdown planner in one place cut my Sunday planning from an hour of scattered spreadsheets down to five minutes.',
    name: 'Ananya Krishnan',
    role: 'B.E. Computer Science, Semester 3 · Bengaluru Engineering College',
  },
  {
    quote:
      'The SGPA simulator and assignment calendar stopped me from missing two lab reports during hackathon week. Everything updates cleanly across laptop and phone.',
    name: 'Devansh Verma',
    role: 'B.Tech ECE, Semester 5 · National Institute of Engineering',
  },
];

export const LandingPage: React.FC = () => {
  const { loginDemoStudent } = useCampus();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [activePreviewTab, setActivePreviewTab] = useState<'command' | 'attendance' | 'ai'>('command');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const openAuth = (tab: AuthTab) => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            CampusOS
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#assistant-preview" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              AI Assistant
            </a>
            <a href="#impact" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Outcomes
            </a>
            <a href="#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap shrink-0"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-14 pb-20 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 tracking-wide mb-3">
                CampusOS · Your entire campus, in one place.
              </p>
              <h1
                className="font-display font-bold tracking-tight text-slate-950 dark:text-white leading-[1.08] max-w-xl"
                style={{ fontSize: 'clamp(2.35rem, 4.2vw, 3.75rem)', textWrap: 'balance' }}
              >
                College life, organized.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                CampusOS brings your timetable, attendance, assignments, exams, resources and campus
                life into one intelligent dashboard.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={loginDemoStudent}
                  className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  Explore CampusOS
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Smart Timetable & Attendance Forecast</span>
                <span aria-hidden="true">·</span>
                <span>SGPA / CGPA Engine</span>
                <span aria-hidden="true">·</span>
                <span>Gemini Study Planner</span>
              </div>
            </div>

            {/* Animated Interactive Dashboard Preview */}
            <div className="lg:col-span-6 flex">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="relative h-44 w-full overflow-hidden border-b border-slate-200 dark:border-slate-800">
                  <SafeImage
                    src="/src/assets/images/hero_campus_library_1795234202938.jpg"
                    alt="Modern university engineering library atrium"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent flex items-end p-5">
                    <div className="text-white">
                      <p className="text-xs text-slate-200">Student Command Center · Preview</p>
                      <p className="text-base font-semibold mt-0.5">What matters today for Sneha Nair</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('command')}
                      className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        activePreviewTab === 'command'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Daily Command
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('attendance')}
                      className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        activePreviewTab === 'attendance'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Attendance Math
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('ai')}
                      className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        activePreviewTab === 'ai'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Exam Planner
                    </button>
                  </div>

                  {activePreviewTab === 'command' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Next Class · 09:00 AM</p>
                        <p className="text-sm font-semibold mt-1 text-slate-900 dark:text-slate-100">
                          Engineering Mathematics I
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">LH-204 · Dr. Arvind Kulkarni</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Urgent Assignment</p>
                        <p className="text-sm font-semibold mt-1 text-slate-900 dark:text-slate-100">
                          Dynamic Memory Allocator in C
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Due Today · CS102</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                        <p className="text-xs text-red-700 dark:text-red-400 font-medium">Attendance Alert</p>
                        <p className="text-sm font-semibold mt-1 text-slate-900 dark:text-slate-100 tabular-nums">
                          Engineering Physics · 72.0%
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Attend next 3 classes to reach 75%</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                        <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Academic Standing</p>
                        <p className="text-sm font-semibold mt-1 text-slate-900 dark:text-slate-100 tabular-nums">
                          Projected SGPA 8.95
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">20 Credits · Semester 1</p>
                      </div>
                    </div>
                  ) : null}

                  {activePreviewTab === 'attendance' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>Engineering Physics (18 / 25 conducted)</span>
                        <span className="font-mono font-semibold text-red-600 dark:text-red-400">72.0% Critical</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-red-600 rounded-full" style={{ width: '72%' }} />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Forecast: Attend the next <strong className="text-slate-900 dark:text-white">3 consecutive classes</strong> to recover to 75.0%.
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span>Programming & Problem Solving (24 / 26)</span>
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">92.3% Safe</span>
                      </div>
                    </div>
                  ) : null}

                  {activePreviewTab === 'ai' ? (
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Day 1 · 2.5h — Multiple Integrals</p>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Revise polar coordinates + 8 past-paper problems</p>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Day 2 · 2.5h — Eigenvalues & Cayley-Hamilton</p>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">Matrix diagonalization shortcuts + timed quiz</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Capabilities Bento Grid */}
        <section id="features" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">01. Integrated Modules</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                Built around every academic workflow you actually use.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    01. Smart Timetable & Student Command Center
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  See what matters today in one view: your active or next classroom, most urgent
                  assignment, nearest exam countdown, and lowest attendance risk. Edit Monday–Sunday
                  schedules, duplicate blocks across days, and switch to Today’s Schedule on mobile.
                </p>
              </div>

              <div className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    02. Attendance Forecast
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  One-tap Present / Absent logging with real-time threshold math and interactive
                  skip-or-attend scenario sliders.
                </p>
              </div>

              <div className="p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    03. SGPA & CGPA Engine
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Credit-weighted semester and cumulative GPA calculations with configurable grade
                  scales and term-over-term comparison charts.
                </p>
              </div>

              <div className="md:col-span-2 p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-4">
                  <LineChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    04. Assignments, Exam Center, Events & Resource Hub
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Manage pending and overdue coursework in list or calendar views, track syllabus
                  completion toward exams, discover campus hackathons and clubs, post Lost & Found
                  items, and bookmark past papers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Assistant Preview */}
        <section id="assistant-preview" className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">02. CampusOS Intelligence</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                An AI study assistant that actually knows your semester.
              </h2>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Instead of generic study advice, CampusOS passes your real subjects, exam dates,
                pending assignments, and attendance risks to Gemini to generate prioritized action plans.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Day-by-day exam revision schedules with progress checkboxes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Workload triage across overlapping deadlines</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Weekly intelligence diagnostics on weak subjects</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      CampusOS AI Study Assistant
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Context-aware session</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="ml-auto max-w-md rounded-xl bg-blue-600 text-white px-4 py-3">
                    I have Calculus on Friday and 3 assignments due tomorrow. What should I do?
                  </div>
                  <div className="mr-auto max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-3 text-slate-700 dark:text-slate-200 space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Prioritized 48-Hour Execution Plan
                    </p>
                    <p className="text-xs leading-relaxed">
                      1. <strong>Tonight (6:30–8:30 PM):</strong> Finish CS102 Dynamic Memory Allocator (already 80% complete) and upload MA101 Problem Set 4.
                    </p>
                    <p className="text-xs leading-relaxed">
                      2. <strong>Tomorrow Morning:</strong> Attend Engineering Physics at 9:00 AM (currently 72% — cannot miss).
                    </p>
                    <p className="text-xs leading-relaxed">
                      3. <strong>Tomorrow Evening (2.5h):</strong> Focus exclusively on Multiple Integrals and Eigenvalues for Friday’s Calculus Mid-Sem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quantitative Proof & Testimonials */}
        <section id="impact" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-16 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-display text-3xl font-bold tabular-nums text-slate-950 dark:text-white">94%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  On-time assignment submission rate across tracked semesters
                </p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold tabular-nums text-slate-950 dark:text-white">4.2 hrs</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Weekly planning time saved replacing scattered notes and sheets
                </p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold tabular-nums text-slate-950 dark:text-white">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Early warning coverage before attendance drops below 75%
                </p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold tabular-nums text-slate-950 dark:text-white">14</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Unified academic and campus community modules in one workspace
                </p>
              </div>
            </div>

            <div className="pt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <blockquote
                  key={t.name}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex flex-col justify-between gap-5"
                >
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">“{t.quote}”</p>
                  <footer className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.role}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-4xl mx-auto px-6 py-20">
          <div className="mb-10">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">03. Questions</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Frequently asked questions
            </h2>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={item.q} className="py-4">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left py-1"
                  >
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen ? (
                    <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed pr-6">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-display font-semibold text-slate-900 dark:text-white">CampusOS</span>
            <span aria-hidden="true">·</span>
            <span>Your entire campus, in one place.</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={loginDemoStudent}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Launch Demo
            </button>
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} initialTab={authTab} onClose={() => setAuthOpen(false)} />
    </div>
  );
};
