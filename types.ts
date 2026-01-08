
export interface Workout {
  id: string;
  title: string;
  type: string;
  duration: string;
  intensity: 'Léger' | 'Modéré' | 'Intense';
  date: string;
  cycle: number;
  week: number;
  objective: string;
  warmup: string[];
  force?: string[];
  wod: string[];
  cooldown: string[];
  imageUrl?: string;
}

export interface Exercise {
  name: string;
  description: string;
  sets?: string;
  reps?: string;
  duration?: string;
}

export interface HealthMetric {
  date: string;
  weight: number;
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
}

export interface UserProfile {
  name: string;
  rank: string;
  age: string;
  weight: string;
  height: string;
  objective: string;
  photoUrl: string;
  notificationsEnabled: boolean;
  guidageAudioEnabled: boolean;
  isInitialized: boolean;
}

export enum NavigationTab {
  DASHBOARD = 'dashboard',
  TRAINING = 'training',
  HISTORY = 'history',
  HEALTH = 'health',
  PROFILE = 'profile'
}
