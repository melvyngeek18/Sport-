
import React from 'react';
import { Workout } from './types';

export const COLORS = {
  primary: '#dc2626',
  background: '#0a1128',
  surface: '#1a2238',
  border: '#2d3a5a',
  textSecondary: '#94a3b8',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};

export const MOCK_WORKOUTS: Workout[] = [
  {
    id: 'c1-s1',
    title: 'Force Bas du Corps + Metcon',
    type: 'CrossFit',
    timerType: 'AMRAP',
    status: 'scheduled',
    duration: '60 min',
    intensity: 'Intense',
    date: '2023-10-24',
    cycle: 1,
    week: 1,
    objective: 'Relancer la force fonctionnelle',
    warmup: ['5 min Rameur', 'Mobilité hanches / chevilles'],
    force: ['Back Squat 5x5 (charge confortable)'],
    wod: ['Baseline (Benchmark) :', '500m rameur', '40 squats', '30 sit-ups', '20 push-ups', '10 pull-ups'],
    cooldown: ['Étirements quadriceps', 'Étirements lombaires'],
    imageUrl: 'https://picsum.photos/seed/squat/800/600'
  },
  {
    id: 'c1-s2',
    title: 'Running Endurance',
    type: 'Cardio',
    timerType: 'STANDARD',
    status: 'scheduled',
    duration: '50 min',
    intensity: 'Modéré',
    date: '2023-10-25',
    cycle: 1,
    week: 1,
    objective: 'Base aérobie',
    warmup: ['Mobilisation articulaire douce'],
    wod: ['45 min Zone 2 (respiration aisée)', 'Option tapis : inclinaison 1%'],
    cooldown: ['5 min respiration contrôlée'],
    imageUrl: 'https://picsum.photos/seed/run/800/600'
  },
  {
    id: 'c1-s3',
    title: 'Gym / Haut du Corps',
    type: 'CrossFit',
    timerType: 'AMRAP',
    status: 'scheduled',
    duration: '45 min',
    intensity: 'Intense',
    date: '2023-10-26',
    cycle: 1,
    week: 1,
    objective: 'Gainage, tirage, stabilité',
    warmup: ['5 min Corde à sauter'],
    wod: ['Cindy (Benchmark) - 20 min AMRAP :', '5 pull-ups', '10 push-ups', '15 squats'],
    cooldown: ['Mobilité épaules'],
    imageUrl: 'https://picsum.photos/seed/gym/800/600'
  }
];

export const MOCK_HEALTH_DATA = [
  { date: '2023-11-01', weight: 83.2, heartRate: 60, bp_sys: 130, bp_dia: 82 },
  { date: '2023-11-08', weight: 82.9, heartRate: 59, bp_sys: 132, bp_dia: 84 },
  { date: '2023-11-15', weight: 82.7, heartRate: 58, bp_sys: 138, bp_dia: 88 },
  { date: '2023-11-22', weight: 82.5, heartRate: 58, bp_sys: 135, bp_dia: 85 },
  { date: '2023-11-24', weight: 82.5, heartRate: 57, bp_sys: 135, bp_dia: 85 },
];
