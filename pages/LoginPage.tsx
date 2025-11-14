

import React, { useState } from 'react';
// FIX: The project appears to use react-router-dom v5. The import for 'useNavigate' is for v6. It is replaced with the v6 equivalent 'useNavigate'.
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, ArrowRightToLine } from 'lucide-react';
import { APP_VERSION } from '../config';

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  // FIX: Switched from useHistory to useNavigate for v6 compatibility.
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(password);

    setIsLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Mot de passe incorrect. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-slate-200">
            <div className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-slate-800 text-white rounded-full mb-4 ring-4 ring-slate-200">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">ISO Manager</h1>
                <p className="mt-2 text-sm text-slate-600">Veuillez vous authentifier pour continuer</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password-input" className="sr-only">
                  Mot de passe
                </label>
                <input
                  id="password-input"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none rounded-lg relative block w-full px-4 py-3 border placeholder-slate-500 text-slate-900 bg-white focus:outline-none sm:text-sm transition-shadow ${error ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-500'}`}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

               {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
                >
                    <ArrowRightToLine size={20} aria-hidden="true" />
                    <span>{isLoading ? 'Connexion en cours...' : 'Se connecter'}</span>
                </button>
              </div>
            </form>
        </div>
        
        <div className="text-center text-xs text-slate-500 mt-6">
            <p>Version {APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;