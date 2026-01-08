
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_WORKOUTS } from '../constants';

type TimerType = 'WARMUP' | 'FORCE' | 'WOD' | 'STRETCHING' | null;

const WorkoutDetail: React.FC = () => {
  const navigate = useNavigate();
  const workout = MOCK_WORKOUTS[0]; // On prend la première séance du programme par défaut
  
  const [activeTimer, setActiveTimer] = useState<TimerType>(null);
  const [prepCount, setPrepCount] = useState<number>(5);
  const [isPrepping, setIsPrepping] = useState<boolean>(false);
  const [mainSeconds, setMainSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    let interval: number;
    if (activeTimer) {
      interval = window.setInterval(() => {
        if (isPaused) return;
        if (isPrepping) {
          if (prepCount > 1) setPrepCount(prev => prev - 1);
          else setIsPrepping(false);
        } else {
          if (mainSeconds > 0) setMainSeconds(prev => prev - 1);
          else setActiveTimer(null);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, isPrepping, prepCount, mainSeconds, isPaused]);

  const startTimer = (type: TimerType, durationMinutes: number) => {
    setActiveTimer(type);
    setIsPrepping(true);
    setPrepCount(5);
    setIsPaused(false);
    setMainSeconds(durationMinutes * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 pb-40 overflow-y-auto no-scrollbar relative">
      {/* Timer Overlay */}
      {activeTimer && (
        <div className="fixed inset-0 z-[100] bg-background-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
          <button onClick={() => setActiveTimer(null)} className="absolute top-6 right-6 size-12 rounded-full bg-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-primary text-sm font-black uppercase tracking-[0.3em] mb-4">{activeTimer}</h2>
          {isPrepping ? (
            <div className="text-8xl font-black text-primary animate-bounce">{prepCount}</div>
          ) : (
            <>
              <div className="text-[120px] font-black tabular-nums mb-12">{formatTime(mainSeconds)}</div>
              <div className="flex gap-6">
                <button onClick={() => setIsPaused(!isPaused)} className="size-20 rounded-full bg-primary text-background-dark flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-4xl">{isPaused ? 'play_arrow' : 'pause'}</span>
                </button>
                <button onClick={() => setActiveTimer(null)} className="size-20 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30">
                  <span className="material-symbols-outlined text-4xl">stop</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* AppBar */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background-dark/95 p-4 backdrop-blur-md border-b border-white/10">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Séance {workout.week} • Cycle {workout.cycle}</h2>
        <button className="flex size-10 items-center justify-center rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">share</span>
        </button>
      </div>

      {/* Hero */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">{workout.title}</h1>
        <div className="bg-primary/10 border border-primary/30 p-3 rounded-xl mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">1. Objectif</p>
          <p className="text-sm font-bold text-white">{workout.objective}</p>
        </div>
      </div>

      {/* Structure Timeline */}
      <div className="px-4 space-y-8 relative">
        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-white/5"></div>
        
        {/* Step 2: Warmup */}
        <div className="relative pl-12">
          <button onClick={() => startTimer('WARMUP', 5)} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-green-500 shadow-lg ring-4 ring-background-dark z-10">
            <span className="material-symbols-outlined text-xl">accessibility_new</span>
          </button>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold">2. Échauffement</h3>
            <span className="text-[10px] font-black text-green-500 border border-green-500/30 px-2 py-0.5 rounded">5 MIN</span>
          </div>
          <ul className="space-y-1">
            {workout.warmup.map((item, i) => (
              <li key={i} className="text-sm text-text-secondary">• {item}</li>
            ))}
          </ul>
        </div>

        {/* Step 3: Force (Optional) */}
        {workout.force && (
          <div className="relative pl-12">
            <button onClick={() => startTimer('FORCE', 15)} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-blue-500 shadow-lg ring-4 ring-background-dark z-10">
              <span className="material-symbols-outlined text-xl">fitness_center</span>
            </button>
            <h3 className="text-lg font-bold mb-2">3. Corps de séance (Force)</h3>
            <div className="bg-surface-dark p-3 rounded-xl border border-white/5">
              {workout.force.map((item, i) => (
                <p key={i} className="text-sm font-bold text-blue-400">{item}</p>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: WOD */}
        <div className="relative pl-12">
          <button onClick={() => startTimer('WOD', 20)} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-primary shadow-lg ring-4 ring-background-dark z-10">
            <span className="material-symbols-outlined text-xl">bolt</span>
          </button>
          <h3 className="text-lg font-bold mb-2">4. WOD / Travail Principal</h3>
          <div className="bg-surface-dark p-4 rounded-xl border-l-4 border-primary shadow-lg space-y-2">
            {workout.wod.map((item, i) => (
              <p key={i} className={`text-sm ${item.includes(':') ? 'font-black text-primary uppercase' : 'text-white'}`}>{item}</p>
            ))}
          </div>
        </div>

        {/* Step 5: Cooldown */}
        <div className="relative pl-12">
          <button onClick={() => startTimer('STRETCHING', 5)} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-indigo-500 shadow-lg ring-4 ring-background-dark z-10">
            <span className="material-symbols-outlined text-xl">self_improvement</span>
          </button>
          <h3 className="text-lg font-bold mb-2">5. Retour au calme</h3>
          <ul className="space-y-1">
            {workout.cooldown.map((item, i) => (
              <li key={i} className="text-sm text-text-secondary">• {item}</li>
            ))}
          </ul>
        </div>

        {/* Step 6: Score */}
        <div className="relative pl-12 pb-10">
          <div className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-surface-dark border border-white/20 shadow-lg ring-4 ring-background-dark z-10">
            <span className="material-symbols-outlined text-xl text-text-secondary">edit_note</span>
          </div>
          <h3 className="text-lg font-bold mb-3">6. Score / Ressenti</h3>
          <div className="flex gap-2">
             <input type="text" placeholder="Temps ou Charge..." className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary" />
             <button className="bg-primary text-background-dark font-black px-4 rounded-xl text-xs uppercase tracking-widest">Valider</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetail;
