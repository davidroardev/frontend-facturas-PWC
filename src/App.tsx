import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import AuthPage from './pages/AuthPage';

// Componente para proteger la ruta del Dashboard
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Componente temporal del Dashboard mientras lo construimos
const DashboardPlaceholder = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
    <h1 className="text-3xl font-bold text-indigo-400">Dashboard de Facturas</h1>
    <p className="mt-2 text-slate-400">¡Sesión iniciada correctamente!</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPlaceholder />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}