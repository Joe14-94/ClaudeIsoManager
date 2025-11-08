import React from 'react';
// FIX: The project appears to use react-router-dom v5, but the installed version is v6. Updating imports to v6.
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
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
import ProtectedRoute from './components/auth/ProtectedRoute';
import DataModelView from './pages/DataModelView';
import TimelinePage from './pages/TimelinePage';
import DataExplorer from './pages/DataExplorer';
import Projects from './pages/Projects';
import GeneralDashboard from './pages/GeneralDashboard';
import ProjectsDashboard from './pages/ProjectsDashboard';
import ProjectsTimelinePage from './pages/ProjectsTimelinePage';
import ProjectsBudget from './pages/ProjectsBudget';
import ProjectsWorkload from './pages/ProjectsWorkload';
import ProjectsExplorer from './pages/ProjectsExplorer';

const AppLayout: React.FC = () => {
  return (
     <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* FIX: Replaced v5 Switch with v6 Routes */}
        <Routes>
          {/* FIX: Replaced v5 Redirect and `exact` prop with v6 Navigate element. In v6, routes are exact by default. */}
          <Route path="/" element={<Navigate to="/general-dashboard" />} />
          {/* FIX: Updated Route components to use `element` prop for v6 */}
          <Route path="/general-dashboard" element={<GeneralDashboard />} />
          <Route path="/projects-dashboard" element={<ProjectsDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projets" element={<Projects />} />
          <Route path="/projects-explorer" element={<ProjectsExplorer />} />
          <Route path="/projects-timeline" element={<ProjectsTimelinePage />} />
          <Route path="/projects-budget" element={<ProjectsBudget />} />
          <Route path="/projects-workload" element={<ProjectsWorkload />} />
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
          <Route path="/data-model" element={<DataModelView />} />
        </Routes>
      </main>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          {/* FIX: Replaced v5 Switch with v6 Routes */}
          <Routes>
            {/* FIX: Updated Route components to use `element` prop for v6 */}
            <Route path="/login" element={<LoginPage />} />
            {/* FIX: Updated catch-all route for v6 */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;