import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { TeacherPage } from './pages/TeacherPage';
import { ParentPage } from './pages/ParentPage';
import { RecordFormPage } from './pages/RecordFormPage';
import { ConfigPage } from './pages/ConfigPage';
import { SuperadminPage } from './pages/SuperadminPage';
import { AdminPage } from './pages/AdminPage';
import { AdminKidHistoryPage } from './pages/AdminKidHistoryPage';
import { Toast } from './components/ui/Toast';

import { Rol } from './types';

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: Rol | Rol[];
}) {
  const { state } = useApp();

  if (state.loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-spin text-5xl text-naranja-200">🌼</div>
      </div>
    );
  }

  if (!state.user) return <Navigate to="/login" replace />;
  
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(state.user.rol)) {
      if (state.user.rol === 'superadmin') return <Navigate to="/superadmin" replace />;
      if (state.user.rol === 'admin_jardin') return <Navigate to="/admin" replace />;
      if (state.user.rol === 'docente') return <Navigate to="/teacher" replace />;
      return <Navigate to="/parent" replace />;
    }
  }
  return <>{children}</>;
}

function RootRedirect() {
  const { state } = useApp();

  if (state.loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-spin text-5xl text-naranja-200">🌼</div>
      </div>
    );
  }

  if (!state.user) return <Navigate to="/login" replace />;
  
  if (state.user.rol === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (state.user.rol === 'admin_jardin') return <Navigate to="/admin" replace />;
  if (state.user.rol === 'docente') return <Navigate to="/teacher" replace />;
  return <Navigate to="/parent" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <SuperadminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin_jardin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kid/:kidId"
          element={
            <ProtectedRoute requiredRole="admin_jardin">
              <AdminKidHistoryPage />
            </ProtectedRoute>
          }
        />

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
