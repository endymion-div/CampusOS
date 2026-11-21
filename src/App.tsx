import React from 'react';
import { AppShell } from './components/AppShell';
import { LandingPage } from './components/LandingPage';
import { ToastViewport } from './components/ui/CommonUI';
import { AiAssistantView } from './components/views/AiAssistantView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AssignmentsView } from './components/views/AssignmentsView';
import { AttendanceView } from './components/views/AttendanceView';
import { CgpaView } from './components/views/CgpaView';
import { ClubsView } from './components/views/ClubsView';
import { DashboardView } from './components/views/DashboardView';
import { EventsView } from './components/views/EventsView';
import { ExamsView } from './components/views/ExamsView';
import { LostFoundView } from './components/views/LostFoundView';
import { ResourcesView } from './components/views/ResourcesView';
import { SettingsView } from './components/views/SettingsView';
import { StudyPlannerView } from './components/views/StudyPlannerView';
import { TimetableView } from './components/views/TimetableView';
import { CampusProvider, useCampus } from './context/CampusContext';

const CampusRouter: React.FC = () => {
  const { auth, activeSection, toasts, dismissToast } = useCampus();

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'timetable':
        return <TimetableView />;
      case 'attendance':
        return <AttendanceView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'exams':
        return <ExamsView />;
      case 'cgpa':
        return <CgpaView />;
      case 'planner':
        return <StudyPlannerView />;
      case 'assistant':
        return <AiAssistantView />;
      case 'events':
        return <EventsView />;
      case 'clubs':
        return <ClubsView />;
      case 'lost-found':
        return <LostFoundView />;
      case 'resources':
        return <ResourcesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      {auth.authenticated ? <AppShell>{renderSection()}</AppShell> : <LandingPage />}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default function App() {
  return (
    <CampusProvider>
      <CampusRouter />
    </CampusProvider>
  );
}
