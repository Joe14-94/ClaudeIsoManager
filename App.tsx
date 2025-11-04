

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import GraphView from './pages/GraphView';
import Iso27002 from './pages/Iso27002';
import Orientations from './pages/Orientations';
import Objectives from './pages/Objectives';
import Resources from './pages/Resources';
import DataManagement from './pages/DataManagement';
import Chantiers from './pages/Chantiers';
import D3GraphView from './pages/D3GraphView';
import Processes from './pages/Processes';
import LoginPage from './pages/LoginPage';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DataModelView from './pages/DataModelView';

const AppLayout: React.FC = () => {
  return (
     <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/graph" element={<GraphView />} />
          <Route path="/d3-graph" element={<D3GraphView />} />
          <Route path="/iso27002" element={<Iso27002 />} />
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
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;