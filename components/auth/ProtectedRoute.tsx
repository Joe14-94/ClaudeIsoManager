
import React from 'react';
// FIX: The project appears to use react-router-dom v5. The import for 'Navigate' is for v6. Updating to v6 equivalent.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <div className="text-center">
            <p className="text-lg font-semibold text-slate-700">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    // FIX: Replaced v5 Redirect component with v6 Navigate component.
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
