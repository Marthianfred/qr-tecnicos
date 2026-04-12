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
      localStorage.setItem('token', data.access_token);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface_container_lowest p-10 rounded-lg shadow-ambient border-none">
        <div>
          <div className="flex justify-center flex-col items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all"></div>
              <img src="/logo.png" alt="Fibex Logo" className="relative h-40 w-auto object-contain transition-all hover:scale-105" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-on_surface">
            Control de Acceso
          </h2>
          <p className="mt-2 text-center text-sm text-on_surface opacity-70">
            Guardián de Infraestructura Digital
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-on_surface opacity-50 mb-1 block">Usuario</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="bg-surface_container_highest block w-full px-3 py-3 text-on_surface sm:text-sm input-ghost-border"
                placeholder="admin, coordinador o tecnico"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-on_surface opacity-50 mb-1 block">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="bg-surface_container_highest block w-full px-3 py-3 text-on_surface sm:text-sm input-ghost-border"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-error text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="trust-gradient group relative w-full flex justify-center py-3 px-4 text-sm font-bold rounded-lg text-white focus:outline-none transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'VERIFICANDO...' : 'INICIAR SESIÓN'}
            </button>
          </div>
          
          <div className="text-[10px] text-on_surface opacity-40 text-center uppercase tracking-widest font-bold">
            <p>Protocolo de Acceso Seguro v2.4</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
