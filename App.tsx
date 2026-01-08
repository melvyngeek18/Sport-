
import React, { useState } from 'react';
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
const BottomNav = ({ onQuitRequested }: { onQuitRequested: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: NavigationTab.DASHBOARD, icon: 'dashboard', label: 'Accueil', path: '/' },
    { id: NavigationTab.TRAINING, icon: 'fitness_center', label: 'Entraînement', path: '/training' },
    { id: NavigationTab.HISTORY, icon: 'history', label: 'Historique', path: '/history' },
    { id: NavigationTab.HEALTH, icon: 'monitoring', label: 'Suivi', path: '/health' },
    { id: NavigationTab.PROFILE, icon: 'person', label: 'Profil', path: '/profile' },
    { id: NavigationTab.QUIT, icon: 'logout', label: 'Quitter', path: 'quit_action' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-md border-t border-white/5 px-4 pb-6 pt-3 z-50 flex justify-between items-end max-w-md mx-auto md:max-w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            if (tab.id === NavigationTab.QUIT) {
              onQuitRequested();
            } else {
              navigate(tab.path);
            }
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${isActive(tab.path) ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
        >
          <span className={`material-symbols-outlined text-[26px] ${isActive(tab.path) ? 'filled' : ''}`}>
            {tab.icon}
          </span>
          <span className="text-[9px] font-medium">{tab.label}</span>
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

const ConditionalBottomNav = ({ onQuitRequested }: { onQuitRequested: () => void }) => {
  const location = useLocation();
  const { user } = useUser();
  if (location.pathname.startsWith('/session') || !user.isInitialized) return null;
  return <BottomNav onQuitRequested={onQuitRequested} />;
};

// Quit Confirmation Modal Component
const QuitDialog = ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background-dark/90 backdrop-blur-md animate-in fade-in duration-200">
    <div className="w-full max-w-xs bg-surface-dark border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300 flex flex-col items-center text-center">
      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
        <span className="material-symbols-outlined text-4xl">logout</span>
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight mb-2">Fin de Service ?</h3>
      <p className="text-text-secondary text-sm font-medium mb-8">Voulez-vous vraiment quitter FireFit Ops et arrêter votre suivi opérationnel ?</p>
      
      <div className="w-full space-y-3">
        <button 
          onClick={onConfirm}
          className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Quitter l'App
        </button>
        <button 
          onClick={onCancel}
          className="w-full bg-white/5 border border-white/10 text-text-secondary py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
        >
          Rester
        </button>
      </div>
    </div>
  </div>
);

// Final Shutdown Screen
const ShutdownScreen = () => (
  <div className="fixed inset-0 z-[300] bg-background-dark flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-700">
    <div className="mb-8">
      <span className="material-symbols-outlined text-primary text-6xl opacity-20 animate-pulse">local_fire_department</span>
    </div>
    <h1 className="text-xl font-black uppercase tracking-widest text-white/40 mb-2">Service Terminé</h1>
    <p className="text-text-secondary text-xs font-medium opacity-50">FireFit Ops est en veille.<br/>Reposez-vous bien, soldat.</p>
    <button 
      onClick={() => window.location.reload()}
      className="mt-12 text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity"
    >
      Redémarrer
    </button>
  </div>
);

const App: React.FC = () => {
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [appClosed, setAppClosed] = useState(false);

  if (appClosed) return <ShutdownScreen />;

  return (
    <UserProvider>
      <HashRouter>
        <div className="min-h-screen bg-background-dark text-white font-sans selection:bg-primary/30 max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
          <ProtectedRoutes />
          <ConditionalBottomNav onQuitRequested={() => setShowQuitConfirm(true)} />
          
          {showQuitConfirm && (
            <QuitDialog 
              onConfirm={() => {
                setShowQuitConfirm(false);
                setAppClosed(true);
              }} 
              onCancel={() => setShowQuitConfirm(false)} 
            />
          )}
        </div>
      </HashRouter>
    </UserProvider>
  );
};

export default App;
