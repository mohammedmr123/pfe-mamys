import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Tables from './pages/Tables';
import Menu from './pages/Menu';
import Login from './pages/Login';
import Kitchen from './pages/Kitchen';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pos" element={<POS />} />
              <Route path="tables" element={<Tables />} />
              <Route path="menu" element={<Menu />} />
              <Route path="kitchen" element={<Kitchen />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
