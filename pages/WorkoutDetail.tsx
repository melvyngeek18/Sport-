
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { TimerType, WorkoutStatus } from '../types';
import { speakEncouragement } from '../services/geminiService';

const WorkoutDetail: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProgram, updateWorkoutStatus } = useUser();
  const workout = userProgram.find(w => w.status === 'scheduled') || userProgram[0];

  const [activeTimer, setActiveTimer] = useState<TimerType | null>(null);
  const [prepCount, setPrepCount] = useState<number>(5);
  const [isPrepping, setIsPrepping] = useState<boolean>(false);
  const [mainSeconds, setMainSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [tabataRound, setTabataRound] = useState<number>(1);
  const [isTabataRest, setIsTabataRest] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = (freq = 880, duration = 0.1) => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + duration);
  };

  useEffect(() => {
    let interval: number;
    if (activeTimer) {
      interval = window.setInterval(() => {
        if (isPaused) return;

        if (isPrepping) {
          if (prepCount <= 3 && prepCount > 0) playBeep(440);
          if (prepCount > 1) setPrepCount(prev => prev - 1);
          else {
            setIsPrepping(false);
            playBeep(880, 0.3);
          }
        } else {
          // Annonce vocale chaque minute
          if (mainSeconds > 0 && mainSeconds % 60 === 0 && mainSeconds !== parseInt(workout.duration) * 60) {
            const elapsedMins = (parseInt(workout.duration) * 60 - mainSeconds) / 60;
            if (elapsedMins > 0 && user.guidageAudioEnabled) {
              speakEncouragement(`${elapsedMins} minute${elapsedMins > 1 ? 's' : ''} écoulée${elapsedMins > 1 ? 's' : ''}`);
            }
          }

          // Logique spécifique par type
          if (activeTimer === 'TABATA') {
             if (mainSeconds > 1) {
                setMainSeconds(prev => prev - 1);
                if (mainSeconds <= 4) playBeep(440);
             } else {
                if (!isTabataRest) {
                   if (tabataRound < 8) {
                      setIsTabataRest(true);
                      setMainSeconds(10);
                      playBeep(660, 0.3);
                   } else {
                      setActiveTimer(null); // Fin
                   }
                } else {
                   setIsTabataRest(false);
                   setTabataRound(prev => prev + 1);
                   setMainSeconds(20);
                   playBeep(880, 0.3);
                }
             }
          } else {
             if (mainSeconds > 0) {
               setMainSeconds(prev => prev - 1);
               if (mainSeconds <= 4) playBeep(440);
             } else {
               playBeep(880, 0.5);
               setActiveTimer(null);
             }
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, isPrepping, prepCount, mainSeconds, isPaused, isTabataRest, tabataRound]);

  const startTimer = (type: TimerType, durationMinutes: number) => {
    setActiveTimer(type);
    setIsPrepping(true);
    setPrepCount(5);
    setIsPaused(false);
    
    if (type === 'TABATA') {
      setMainSeconds(20);
      setTabataRound(1);
      setIsTabataRest(false);
    } else {
      setMainSeconds(durationMinutes * 60);
    }
  };

  const handleAction = (status: WorkoutStatus) => {
    updateWorkoutStatus(workout.id, status);
    setShowOptions(false);
    if (status === 'cancelled' || status === 'rescheduled') navigate('/');
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!workout) return <div className="p-10 text-center">Aucune séance prévue.</div>;

  return (
    <div className="flex-1 pb-40 overflow-y-auto no-scrollbar relative">
      {/* Timer Overlay */}
      {activeTimer && (
        <div className="fixed inset-0 z-[100] bg-background-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
          <button onClick={() => setActiveTimer(null)} className="absolute top-6 right-6 size-12 rounded-full bg-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="mb-2">
            <h2 className="text-primary text-xs font-black uppercase tracking-[0.3em]">{activeTimer}</h2>
            {activeTimer === 'TABATA' && !isPrepping && (
               <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Round {tabataRound}/8 • {isTabataRest ? 'Repos' : 'Travail'}</p>
            )}
          </div>

          {isPrepping ? (
            <div className="text-9xl font-black text-primary animate-pulse">{prepCount}</div>
          ) : (
            <>
              <div className={`text-[120px] font-black tabular-nums mb-12 leading-none ${isTabataRest ? 'text-blue-400' : 'text-white'}`}>
                {formatTime(mainSeconds)}
              </div>
              <div className="flex gap-6">
                <button onClick={() => setIsPaused(!isPaused)} className="size-20 rounded-full bg-primary text-background-dark flex items-center justify-center shadow-lg active:scale-95 transition-all">
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
        <button onClick={() => navigate('/')} className="flex size-10 items-center justify-center rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Semaine {workout.week} • Séance {workout.id.split('-')[1]}</h2>
        <button onClick={() => setShowOptions(!showOptions)} className="flex size-10 items-center justify-center rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
        
        {showOptions && (
          <div className="absolute right-4 top-16 w-56 bg-surface-dark border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
            <button onClick={() => handleAction('rescheduled')} className="w-full text-left p-4 hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors">
              <span className="material-symbols-outlined text-blue-400">calendar_month</span>
              <span className="text-sm font-bold">Reprogrammer</span>
            </button>
            <button onClick={() => handleAction('cancelled')} className="w-full text-left p-4 hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors text-red-400">
              <span className="material-symbols-outlined">cancel</span>
              <span className="text-sm font-bold">Annuler la séance</span>
            </button>
          </div>
        )}
      </div>

      {/* Hero */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase leading-none">{workout.title}</h1>
        <div className="flex gap-2 mb-6">
           <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black rounded-full border border-primary/30 uppercase tracking-widest">{workout.timerType}</span>
           <span className="px-3 py-1 bg-white/5 text-text-secondary text-[10px] font-black rounded-full border border-white/10 uppercase tracking-widest">{workout.duration}</span>
        </div>
        <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Focus</p>
          <p className="text-sm font-bold text-white leading-tight">{workout.objective}</p>
        </div>
      </div>

      {/* Structure Timeline */}
      <div className="px-4 space-y-8 relative">
        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-white/5"></div>
        
        <div className="relative pl-12">
          <button onClick={() => startTimer('WARMUP', 5)} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-green-500 shadow-lg ring-4 ring-background-dark z-10">
            <span className="material-symbols-outlined text-xl">accessibility_new</span>
          </button>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold">1. Échauffement</h3>
            <span className="text-[10px] font-black text-green-500 border border-green-500/30 px-2 py-0.5 rounded">5 MIN</span>
          </div>
          <ul className="space-y-1">
            {workout.warmup.map((item, i) => (
              <li key={i} className="text-sm text-text-secondary">• {item}</li>
            ))}
          </ul>
        </div>

        {workout.force && (
          <div className="relative pl-12">
            <div className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-blue-500 shadow-lg ring-4 ring-background-dark z-10">
              <span className="material-symbols-outlined text-xl">fitness_center</span>
            </div>
            <h3 className="text-lg font-bold mb-2">2. Force Opérationnelle</h3>
            <div className="bg-surface-dark p-3 rounded-xl border border-white/5">
              {workout.force.map((item, i) => (
                <p key={i} className="text-sm font-bold text-blue-400">{item}</p>
              ))}
            </div>
          </div>
        )}

        <div className="relative pl-12">
          <button 
            onClick={() => startTimer(workout.timerType, parseInt(workout.duration))} 
            className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-primary shadow-lg ring-4 ring-background-dark z-10"
          >
            <span className="material-symbols-outlined text-xl">bolt</span>
          </button>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">3. Corps de séance ({workout.timerType})</h3>
            <span className="text-xs font-black text-primary">{workout.duration}</span>
          </div>
          <div className="bg-surface-dark p-4 rounded-xl border-l-4 border-primary shadow-lg space-y-2">
            {workout.wod.map((item, i) => (
              <p key={i} className={`text-sm ${item.includes(':') ? 'font-black text-primary uppercase' : 'text-white'}`}>{item}</p>
            ))}
          </div>
        </div>

        <div className="relative pl-12">
          <button onClick={() => startTimer('STRETCHING', 5)} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-indigo-500 shadow-lg ring-4 ring-background-dark z-10">
            <span className="material-symbols-outlined text-xl">self_improvement</span>
          </button>
          <h3 className="text-lg font-bold mb-2">4. Retour au calme</h3>
          <ul className="space-y-1">
            {workout.cooldown.map((item, i) => (
              <li key={i} className="text-sm text-text-secondary">• {item}</li>
            ))}
          </ul>
        </div>

        <div className="relative pl-12 pb-10">
          <div className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-surface-dark border border-white/20 shadow-lg ring-4 ring-background-dark z-10">
            <span className="material-symbols-outlined text-xl text-text-secondary">check_circle</span>
          </div>
          <h3 className="text-lg font-bold mb-3">5. Valider la séance</h3>
          <button 
            onClick={() => handleAction('completed')}
            className="w-full bg-primary text-background-dark font-black py-4 rounded-2xl text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
            Séance Terminée
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetail;
