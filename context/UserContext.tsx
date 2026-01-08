
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { HealthMetric, UserProfile, Workout, WorkoutStatus } from '../types';
import { MOCK_WORKOUTS } from '../constants';

interface UserContextType {
  user: UserProfile;
  healthHistory: HealthMetric[];
  userProgram: Workout[];
  updateUser: (newData: Partial<UserProfile>) => void;
  addHealthMetric: (metric: HealthMetric) => void;
  initializeProfile: (data: Partial<UserProfile>) => void;
  updateWorkoutStatus: (id: string, status: WorkoutStatus, newDate?: string) => void;
  replaceWorkout: (id: string, workoutData: Partial<Workout>) => void;
}

// L'image par défaut est le logo SC (stylisé avec du feu comme sur l'image fournie)
const defaultUser: UserProfile = {
  name: '',
  rank: 'Sapeur',
  age: '',
  weight: '',
  height: '',
  objective: 'Relance cardio & Perte de poids',
  photoUrl: 'https://img.freepik.com/vecteurs-premium/concept-logo-lettre-s-feu-abstrait_73229-456.jpg', 
  notificationsEnabled: true,
  guidageAudioEnabled: true,
  voicePreference: 'male',
  reminderTime: '12:00',
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
    return saved ? JSON.parse(saved) : [];
  });

  const [userProgram, setUserProgram] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('firefit_program');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('firefit_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('firefit_history', JSON.stringify(healthHistory));
  }, [healthHistory]);

  useEffect(() => {
    localStorage.setItem('firefit_program', JSON.stringify(userProgram));
  }, [userProgram]);

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
    
    const today = new Date();
    const generatedProgram: Workout[] = MOCK_WORKOUTS.map((w, i) => {
      const workoutDate = new Date(today);
      workoutDate.setDate(today.getDate() + (i * 2));
      return {
        ...w,
        id: `pw-${i}`,
        date: workoutDate.toISOString().split('T')[0],
        status: 'scheduled' as WorkoutStatus,
        timerType: i === 0 ? 'AMRAP' : (i === 1 ? 'EMOM' : 'TABATA')
      };
    });
    setUserProgram(generatedProgram);

    const initialMetric: HealthMetric = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(data.weight || '0'),
      heartRate: 60,
      bloodPressure: { systolic: 120, diastolic: 80 }
    };
    setHealthHistory([initialMetric]);
  };

  const updateWorkoutStatus = (id: string, status: WorkoutStatus, newDate?: string) => {
    setUserProgram(prev => prev.map(w => 
      w.id === id ? { ...w, status, date: newDate || w.date } : w
    ));
  };

  const replaceWorkout = (id: string, workoutData: Partial<Workout>) => {
    setUserProgram(prev => prev.map(w => 
      w.id === id ? { ...w, ...workoutData } : w
    ));
  };

  return (
    <UserContext.Provider value={{ user, healthHistory, userProgram, updateUser, addHealthMetric, initializeProfile, updateWorkoutStatus, replaceWorkout }}>
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
