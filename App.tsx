
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Activities from './pages/Activities';
import GraphView from './pages/GraphView';
import Iso27002 from './pages/Iso27002';
import Initiatives from './pages/Initiatives';
import Orientations from './pages/Orientations';
import Objectives from './pages/Objectives';
import Resources from './pages/Resources';
import DataManagement from './pages/DataManagement';
import Chantiers from './pages/Chantiers';
import D3GraphView from './pages/D3GraphView';
import Processes from './pages/Processes';
import LoginPage from './pages/LoginPage';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuditProvider } from './contexts/AuditContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UndoRedoProvider } from './contexts/UndoRedoContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UndoRedoIndicator from './components/ui/UndoRedoIndicator';
import DataModelView from './pages/DataModelView';
import DataModelView2 from './pages/DataModelView2';
import TimelinePage from './pages/TimelinePage';
import DataExplorer from './pages/DataExplorer';
import Projects from './pages/Projects';
import CustomDashboardPage from './pages/CustomDashboardPage';
import ProjectsTimelinePage from './pages/ProjectsTimelinePage';
import ProjectsBudget from './pages/ProjectsBudget';
import ProjectsWorkload from './pages/ProjectsWorkload';
import ProjectsExplorer from './pages/ProjectsExplorer';
import { SidebarProvider } from './contexts/SidebarContext';
import ActivitiesDashboard from './pages/ActivitiesDashboard';
import ProjectsDashboardPage from './pages/ProjectsDashboardPage';
import AccessRightsPage from './pages/AccessRightsPage';
import Header from './components/layout/Header';
import { NotificationProvider } from './contexts/NotificationContext';
import HelpPage from './pages/HelpPage';
import GraphCreatorPage from './pages/GraphCreatorPage';
import GanttDiagramPage from './pages/GanttDiagramPage';
import CalendarImportPage from './pages/CalendarImportPage';
import AuditLogPage from './pages/AuditLogPage';
import ProjectBurndownPage from './pages/ProjectBurndownPage';
import VelocityTrackingPage from './pages/VelocityTrackingPage';
import { useNavigationShortcuts, useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from './components/ui/KeyboardShortcutsHelp';

const AppLayout: React.FC = () => {
  const navigationShortcuts = useNavigationShortcuts();
  useKeyboardShortcuts(navigationShortcuts);

  return (
     <div className="relative h-screen bg-slate-100 font-sans md:flex overflow-hidden">
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0`}>
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* FIX: Replaced v5 Switch with v6 Routes */}
          <Routes>
            {/* FIX: Replaced v5 Redirect and `exact` prop with v6 Navigate element. In v6, routes are exact by default. */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            {/* FIX: Updated Route components to use `element` prop for v6 */}
            <Route path="/dashboard" element={<CustomDashboardPage />} />
            <Route path="/projets" element={<Projects />} />
            <Route path="/projects-dashboard" element={<ProjectsDashboardPage />} />
            <Route path="/projects-explorer" element={<ProjectsExplorer />} />
            <Route path="/projets/createur-graphiques" element={<GraphCreatorPage />} />
            <Route path="/projects-timeline" element={<ProjectsTimelinePage />} />
            <Route path="/projects-gantt" element={<GanttDiagramPage />} />
            <Route path="/projects-burndown" element={<ProjectBurndownPage />} />
            <Route path="/velocity-tracking" element={<VelocityTrackingPage />} />
            <Route path="/projects-budget" element={<ProjectsBudget />} />
            <Route path="/projects-workload" element={<ProjectsWorkload />} />
            <Route path="/activities-dashboard" element={<ActivitiesDashboard />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/explorer" element={<DataExplorer />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/graph" element={<GraphView />} />
            <Route path="/d3-graph" element={<D3GraphView />} />
            <Route path="/iso27002" element={<Iso27002 />} />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/orientations" element={<Orientations />} />
            <Route path="/objectives" element={<Objectives />} />
            <Route path="/chantiers" element={<Chantiers />} />
            <Route path="/processes" element={<Processes />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/data-management/fdr" element={<DataManagement />} />
            <Route path="/data-management/calendar-import" element={<CalendarImportPage />} />
            <Route path="/data-model" element={<DataModelView />} />
            <Route path="/data-model-2" element={<DataModelView2 />} />
            <Route path="/droits-acces" element={<AccessRightsPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
            <Route path="/aide" element={<HelpPage />} />
          </Routes>
        </main>
      </div>
      <KeyboardShortcutsHelp shortcuts={navigationShortcuts} />
      <UndoRedoIndicator />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <UndoRedoProvider>
              <DataProvider>
                <AuditProvider>
                  <NotificationProvider>
                    <SidebarProvider>
                      <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/*" element={
                          <ProtectedRoute>
                            <AppLayout />
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </SidebarProvider>
                  </NotificationProvider>
                </AuditProvider>
              </DataProvider>
            </UndoRedoProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
