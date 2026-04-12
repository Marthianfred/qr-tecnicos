import React, { useState } from 'react';
import { apiService } from '../services/api';

export type UserRole = 'admin' | 'coordinator' | 'technician' | 'client';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const data = await apiService.login(username, password);
      // Backend returns { access_token, user: { id, username, role } }
      localStorage.setItem('token', data.access_token);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-[#1A237E] flex items-center justify-center text-white text-2xl font-bold">
              F
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Fibex Qr Tecnicos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inicie sesión para acceder a su panel
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Usuario</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#2962FF] focus:border-[#2962FF] focus:z-10 sm:text-sm"
                placeholder="Nombre de usuario (ej: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#2962FF] focus:border-[#2962FF] focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-[#C62828] text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-[#2962FF] hover:bg-[#1A237E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2962FF] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
          
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>Sugerencias para la demo (password: password):</p>
            <div className="flex justify-center space-x-2">
              <span className="bg-gray-100 px-2 py-1 rounded">admin</span>
              <span className="bg-gray-100 px-2 py-1 rounded">coordinator</span>
              <span className="bg-gray-100 px-2 py-1 rounded">tech_user</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
