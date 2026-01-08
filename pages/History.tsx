
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkoutAnalysis } from '../services/geminiService';

interface WorkoutSummary {
  id: string;
  title: string;
  date: string;
  duration: string;
  intensity: string;
  calories: string;
  avgHeartRate: string;
  exercises: { name: string; result: string }[];
}

interface AIAnalysis {
  summary: string;
  tips: string[];
}

const History: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSummary, setSelectedSummary] = useState<WorkoutSummary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

  const mockHistories: WorkoutSummary[] = [
    {
      id: 'h1',
      title: 'Circuit Opérationnel',
      date: '24 Octobre 2023',
      duration: '45 min',
      intensity: 'Intense',
      calories: '540 kcal',
      avgHeartRate: '155 bpm',
      exercises: [
        { name: 'Pompes', result: '4 x 15' },
        { name: 'Tractions', result: '3 x 8' },
        { name: 'Burpees', result: '50 reps' }
      ]
    },
    {
      id: 'h2',
      title: 'Renfo Musculaire',
      date: '22 Octobre 2023',
      duration: '1h 10m',
      intensity: 'Modéré',
      calories: '420 kcal',
      avgHeartRate: '132 bpm',
      exercises: [
        { name: 'Squats', result: '4 x 12 (60kg)' },
        { name: 'Fentes', result: '3 x 20' },
        { name: 'Gainage', result: '4 x 1 min' }
      ]
    },
    {
      id: 'h3',
      title: 'Manœuvre Incendie',
      date: '28 Septembre 2023',
      duration: '2h 00m',
      intensity: 'Intense',
      calories: '1200 kcal',
      avgHeartRate: '148 bpm',
      exercises: [
        { name: 'Port de charge', result: 'Terrain varié' },
        { name: 'Progression LPP', result: 'Complet' }
      ]
    }
  ];

  const openSummary = (summary: WorkoutSummary) => {
    setSelectedSummary(summary);
    setAiAnalysis(null);
  };

  const closeSummary = () => {
    setSelectedSummary(null);
    setAiAnalysis(null);
    setIsAnalyzing(false);
  };

  const handleAnalyze = async () => {
    if (!selectedSummary) return;
    setIsAnalyzing(true);
    const analysis = await getWorkoutAnalysis(selectedSummary);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 pb-24 overflow-y-auto no-scrollbar relative">
      {/* AppBar */}
      <div className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-md p-4 pb-3 flex items-center justify-between border-b border-white/5">
        <h2 className="text-2xl font-bold tracking-tight">Historique</h2>
        <button className="size-10 rounded-full bg-white/5 flex items-center justify-center text-text-secondary">
          <span className="material-symbols-outlined">calendar_month</span>
        </button>
      </div>

      {/* Summary Row */}
      <div className="p-4 grid grid-cols-3 gap-3">
        {[
          { icon: 'fitness_center', val: '12', label: 'Séances' },
          { icon: 'schedule', val: '8h', label: 'Total' },
          { icon: 'local_fire_department', val: '1.4k', label: 'Kcal' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex flex-col items-center shadow-sm">
            <p className="text-primary text-3xl font-black leading-none mb-1">{stat.val}</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-text-secondary text-sm">{stat.icon}</span>
              <p className="text-text-secondary text-[8px] font-black uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List Content */}
      <div className="px-4 py-4 space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-4">Récent</h3>
          <div className="space-y-4">
            {mockHistories.map((h) => (
              <div 
                key={h.id}
                onClick={() => openSummary(h)}
                className="bg-surface-dark rounded-2xl border border-white/5 p-4 flex items-center gap-4 shadow-sm active:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="size-14 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/10 shrink-0">
                  <span className="text-[10px] text-text-secondary font-bold uppercase">{h.date.split(' ')[1].substring(0, 3)}</span>
                  <span className="text-xl font-black">{h.date.split(' ')[0]}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg leading-tight">{h.title}</h4>
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <div className={`flex items-center gap-1 font-bold ${h.intensity === 'Intense' ? 'text-primary' : 'text-yellow-500'}`}>
                      <span className="material-symbols-outlined text-sm filled">local_fire_department</span>
                      {h.intensity}
                    </div>
                    <span className="size-1 rounded-full bg-white/20"></span>
                    <span className="text-text-secondary">{h.duration}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workout Summary Modal */}
      {selectedSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-surface-dark border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300 max-h-[90vh] flex flex-col">
            {/* Header with Background */}
            <div className="relative min-h-[128px] bg-primary flex flex-col items-center justify-center text-white shrink-0">
              <div className="absolute top-4 right-4">
                <button onClick={closeSummary} className="size-8 rounded-full bg-background-dark/10 flex items-center justify-center">
                   <span className="material-symbols-outlined font-bold">close</span>
                </button>
              </div>
              <span className="material-symbols-outlined text-4xl mb-1 filled">check_circle</span>
              <h3 className="text-xl font-black uppercase tracking-tight">Résumé de séance</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{selectedSummary.date}</p>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1">
              {/* Main Title & Intensity */}
              <div className="text-center">
                <h4 className="text-2xl font-black leading-tight mb-1">{selectedSummary.title}</h4>
                <p className="text-primary text-xs font-bold uppercase tracking-[0.2em]">{selectedSummary.intensity} • {selectedSummary.duration}</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                  <span className="material-symbols-outlined text-primary mb-1">local_fire_department</span>
                  <p className="text-lg font-black">{selectedSummary.calories}</p>
                  <p className="text-[8px] text-text-secondary font-bold uppercase tracking-widest">Brûlées</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                  <span className="material-symbols-outlined text-red-500 mb-1">favorite</span>
                  <p className="text-lg font-black">{selectedSummary.avgHeartRate}</p>
                  <p className="text-[8px] text-text-secondary font-bold uppercase tracking-widest">Moyenne FC</p>
                </div>
              </div>

              {/* Exercise List */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-1">Performances</p>
                <div className="space-y-2">
                  {selectedSummary.exercises.map((ex, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-background-dark/50 p-3 rounded-xl border border-white/5">
                      <span className="text-sm font-medium text-white/90">{ex.name}</span>
                      <span className="text-sm font-black text-primary">{ex.result}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Coach Analysis Trigger & Area */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                {!aiAnalysis && !isAnalyzing ? (
                  <button 
                    onClick={handleAnalyze}
                    className="w-full bg-surface-dark border border-primary/30 py-3 rounded-2xl flex items-center justify-center gap-2 group hover:bg-primary/5 transition-all"
                  >
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">psychology</span>
                    <span className="text-xs font-black uppercase tracking-widest text-white">Analyse Coach IA</span>
                  </button>
                ) : isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Analyse en cours...</p>
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Conseils du Coach IA</p>
                    </div>
                    <p className="text-xs text-white leading-relaxed italic mb-4">"{aiAnalysis?.summary}"</p>
                    <div className="space-y-2">
                      {aiAnalysis?.tips.map((tip, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="material-symbols-outlined text-primary text-sm mt-0.5">trending_up</span>
                          <p className="text-[11px] font-medium text-text-secondary leading-normal">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button 
                onClick={closeSummary}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
