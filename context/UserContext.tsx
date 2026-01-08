
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { HealthMetric, UserProfile } from '../types';
import { MOCK_HEALTH_DATA } from '../constants';

interface UserContextType {
  user: UserProfile;
  healthHistory: HealthMetric[];
  updateUser: (newData: Partial<UserProfile>) => void;
  addHealthMetric: (metric: HealthMetric) => void;
  initializeProfile: (data: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  name: '',
  rank: 'Sapeur',
  age: '',
  weight: '',
  height: '',
  objective: 'Relance cardio & Perte de poids',
  photoUrl: 'https://picsum.photos/seed/firefighter/200/200',
  notificationsEnabled: true,
  guidageAudioEnabled: false,
  isInitialized: false
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('firefit_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [healthHistory, setHealthHistory] = useState<HealthMetric[]>(() => {
    const saved = localStorage.getItem('firefit_history');
    if (saved) return JSON.parse(saved);
    // On ne met pas de mock data par défaut si l'utilisateur n'est pas initialisé
    return [];
  });

  useEffect(() => {
    localStorage.setItem('firefit_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('firefit_history', JSON.stringify(healthHistory));
  }, [healthHistory]);

  const updateUser = (newData: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  const addHealthMetric = (metric: HealthMetric) => {
    setHealthHistory(prev => [...prev, metric].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setUser(prev => ({ ...prev, weight: metric.weight.toString() }));
  };

  const initializeProfile = (data: Partial<UserProfile>) => {
    const newUser = { ...user, ...data, isInitialized: true };
    setUser(newUser);
    
    // Créer la première mesure de référence dans l'historique
    const initialMetric: HealthMetric = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(data.weight || '0'),
      heartRate: 60, // Valeur par défaut
      bloodPressure: { systolic: 120, diastolic: 80 } // Valeur par défaut
    };
    setHealthHistory([initialMetric]);
  };

  return (
    <UserContext.Provider value={{ user, healthHistory, updateUser, addHealthMetric, initializeProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
