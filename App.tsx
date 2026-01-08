
import React from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WorkoutDetail from './pages/WorkoutDetail';
import ActiveSession from './pages/ActiveSession';
import History from './pages/History';
import HealthTracking from './pages/HealthTracking';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import { NavigationTab } from './types';
import { UserProvider, useUser } from './context/UserContext';

// Simple Bottom Navigation Component
const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: NavigationTab.DASHBOARD, icon: 'dashboard', label: 'Accueil', path: '/' },
    { id: NavigationTab.TRAINING, icon: 'fitness_center', label: 'Entraînement', path: '/training' },
    { id: NavigationTab.HISTORY, icon: 'history', label: 'Historique', path: '/history' },
    { id: NavigationTab.HEALTH, icon: 'monitoring', label: 'Suivi', path: '/health' },
    { id: NavigationTab.PROFILE, icon: 'person', label: 'Profil', path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-md border-t border-white/5 px-6 pb-6 pt-3 z-50 flex justify-between items-end max-w-md mx-auto md:max-w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={`flex flex-col items-center gap-1 transition-colors ${isActive(tab.path) ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
        >
          <span className={`material-symbols-outlined text-[28px] ${isActive(tab.path) ? 'filled' : ''}`}>
            {tab.icon}
          </span>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

const ProtectedRoutes = () => {
  const { user } = useUser();
  const location = useLocation();

  if (!user.isInitialized && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (user.isInitialized && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/training" element={<WorkoutDetail />} />
      <Route path="/session/:id" element={<ActiveSession />} />
      <Route path="/history" element={<History />} />
      <Route path="/health" element={<HealthTracking />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

const ConditionalBottomNav = () => {
  const location = useLocation();
  const { user } = useUser();
  if (location.pathname.startsWith('/session') || !user.isInitialized) return null;
  return <BottomNav />;
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <HashRouter>
        <div className="min-h-screen bg-background-dark text-white font-sans selection:bg-primary/30 max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
          <ProtectedRoutes />
          <ConditionalBottomNav />
        </div>
      </HashRouter>
    </UserProvider>
  );
};

export default App;
