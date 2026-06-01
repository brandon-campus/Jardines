import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { TeacherPage } from './pages/TeacherPage';
import { ParentPage } from './pages/ParentPage';
import { RecordFormPage } from './pages/RecordFormPage';
import { ConfigPage } from './pages/ConfigPage';
import { Toast } from './components/ui/Toast';

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'docente' | 'familia';
}) {
  const { state } = useApp();
  if (!state.user) return <Navigate to="/login" replace />;
  if (requiredRole && state.user.rol !== requiredRole) {
    return <Navigate to={state.user.rol === 'docente' ? '/teacher' : '/parent'} replace />;
  }
  return <>{children}</>;
}

function RootRedirect() {
  const { state } = useApp();
  if (!state.user) return <Navigate to="/login" replace />;
  return <Navigate to={state.user.rol === 'docente' ? '/teacher' : '/parent'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Teacher routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute requiredRole="docente">
              <TeacherPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/record/:kidId"
          element={
            <ProtectedRoute requiredRole="docente">
              <RecordFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/config"
          element={
            <ProtectedRoute requiredRole="docente">
              <ConfigPage />
            </ProtectedRoute>
          }
        />

        {/* Parent routes */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute requiredRole="familia">
              <ParentPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
