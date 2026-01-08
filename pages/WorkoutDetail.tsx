
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { TimerType, WorkoutStatus, Workout } from '../types';
import { speakEncouragement } from '../services/geminiService';
import { CROSSFIT_BENCHMARKS } from '../constants';

// Mapping local pour les démonstrations d'exercices
const EXERCISE_LIBRARY: Record<string, { desc: string, img: string, tips: string }> = {
  'rameur': {
    desc: 'Mouvement de tirage complet sollicitant 85% des muscles.',
    img: 'https://images.pexels.com/photos/3823062/pexels-photo-3823062.jpeg?auto=compress&cs=tinysrgb&w=800',
    tips: 'Gardez le dos droit, poussez d\'abord avec les jambes.'
  },
  'squats': {
    desc: 'Flexion des jambes pour renforcer la chaîne postérieure.',
    img: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=800',
    tips: 'Poids sur les talons, descendez sous la parallèle.'
  },
  'sit-ups': {
    desc: 'Exercice de renforcement de la sangle abdominale.',
    img: 'https://images.pexels.com/photos/2294363/pexels-photo-2294363.jpeg?auto=compress&cs=tinysrgb&w=800',
    tips: 'Touchez le sol derrière la tête et devant les pieds.'
  },
  'push-ups': {
    desc: 'Pompes classiques pour le développement des pectoraux.',
    img: 'https://images.pexels.com/photos/176782/pexels-photo-176782.jpeg?auto=compress&cs=tinysrgb&w=800',
    tips: 'Corps bien gainé, poitrine au sol à chaque répétition.'
  },
  'pull-ups': {
    desc: 'Tractions à la barre fixe pour le dos et les bras.',
    img: 'https://images.pexels.com/photos/4046704/pexels-photo-4046704.jpeg?auto=compress&cs=tinysrgb&w=800',
    tips: 'Menton au-dessus de la barre, bras tendus en bas.'
  },
  'burpees': {
    desc: 'Mouvement poly-articulaire haute intensité.',
    img: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=800',
    tips: 'Poitrine au sol, extension complète au saut.'
  },
};

const WorkoutDetail: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProgram, updateWorkoutStatus, replaceWorkout } = useUser();
  const workout = userProgram.find(w => w.status === 'scheduled') || userProgram[0];

  const [activeTimer, setActiveTimer] = useState<TimerType | null>(null);
  const [prepCount, setPrepCount] = useState<number>(5);
  const [isPrepping, setIsPrepping] = useState<boolean>(false);
  const [mainSeconds, setMainSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [tabataRound, setTabataRound] = useState<number>(1);
  const [isTabataRest, setIsTabataRest] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showBenchmarkPicker, setShowBenchmarkPicker] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<{ name: string, data: any } | null>(null);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState(0);

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
          const initialTotal = activeTimer === 'TABATA' ? (isTabataRest ? 10 : 20) : (parseInt(workout.duration) * 60);
          if (mainSeconds > 0 && mainSeconds % 60 === 0 && mainSeconds !== initialTotal) {
            const elapsedMins = (initialTotal - mainSeconds) / 60;
            if (elapsedMins > 0 && user.guidageAudioEnabled) {
              speakEncouragement(`${elapsedMins} minute${elapsedMins > 1 ? 's' : ''} écoulée${elapsedMins > 1 ? 's' : ''}`);
            }
          }

          if (activeTimer === 'TABATA') {
             if (mainSeconds > 1) {
                setMainSeconds(prev => prev - 1);
                if (mainSeconds <= 4) playBeep(440);
             } else {
                if (!isTabataRest) {
                   if (tabataRound < 8) {
                      setIsTabataRest(true);
                      setMainSeconds(10);
                      setTotalSeconds(10);
                      playBeep(660, 0.3);
                   } else {
                      setActiveTimer(null);
                   }
                } else {
                   setIsTabataRest(false);
                   setTabataRound(prev => prev + 1);
                   setMainSeconds(20);
                   setTotalSeconds(20);
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
  }, [activeTimer, isPrepping, prepCount, mainSeconds, isPaused, isTabataRest, tabataRound, workout.duration, user.guidageAudioEnabled]);

  const startTimer = (type: TimerType, durationMinutes: number) => {
    setActiveTimer(type);
    setIsPrepping(true);
    setPrepCount(5);
    setIsPaused(false);
    
    if (type === 'TABATA') {
      setMainSeconds(20);
      setTotalSeconds(20);
      setTabataRound(1);
      setIsTabataRest(false);
    } else {
      const dur = durationMinutes * 60;
      setMainSeconds(dur);
      setTotalSeconds(dur);
    }
  };

  const calculateCaloriesBurned = () => {
    const MET_VALUES: Record<string, number> = {
      'AMRAP': 12.0,
      'EMOM': 10.5,
      'TABATA': 13.5,
      'STANDARD': 8.0,
      'WARMUP': 4.0,
      'STRETCHING': 2.5
    };

    const met = MET_VALUES[workout.timerType] || 8.0;
    const weight = parseFloat(user.weight) || 75;
    const duration = parseInt(workout.duration) || 30;
    
    const kcal = Math.round((met * 3.5 * weight / 200) * duration);
    return kcal;
  };

  const handleAction = (status: WorkoutStatus) => {
    if (status === 'completed') {
      const kcal = calculateCaloriesBurned();
      setCalculatedCalories(kcal);
      setShowCompletionSummary(true);
      updateWorkoutStatus(workout.id, status);
    } else {
      updateWorkoutStatus(workout.id, status);
      if (status === 'cancelled' || status === 'rescheduled') navigate('/');
    }
    setShowOptions(false);
    setShowCancelConfirm(false);
  };

  const handleBenchmarkSelect = (benchmark: Partial<Workout>) => {
    replaceWorkout(workout.id, {
      ...benchmark,
      type: 'CrossFit',
      intensity: 'Intense',
    });
    setShowBenchmarkPicker(false);
    setShowOptions(false);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isPrepping ? (prepCount / 5) : (mainSeconds / totalSeconds);
  const strokeDasharray = 2 * Math.PI * 140;
  const strokeDashoffset = strokeDasharray * (1 - progress);

  const extractExercises = () => {
    return workout.wod
      .filter(item => !item.includes(':'))
      .map(item => {
        const name = item.replace(/[0-9]|m\s|reps\s|min\s|s\s/g, '').trim().toLowerCase();
        const key = Object.keys(EXERCISE_LIBRARY).find(k => name.includes(k));
        return { original: item, key, data: key ? EXERCISE_LIBRARY[key] : null };
      })
      .filter(item => item.data);
  };

  if (!workout) return <div className="p-10 text-center">Aucune séance prévue.</div>;

  return (
    <div className="flex-1 pb-40 overflow-y-auto no-scrollbar relative">
      {/* Benchmark Picker Modal */}
      {showBenchmarkPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background-dark/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-surface-dark border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tight">Choisir un Benchmark</h3>
              <button onClick={() => setShowBenchmarkPicker(false)} className="size-8 rounded-full bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3 no-scrollbar">
              {CROSSFIT_BENCHMARKS.map((benchmark, i) => (
                <button 
                  key={i}
                  onClick={() => handleBenchmarkSelect(benchmark)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center justify-between transition-all group active:scale-[0.98]"
                >
                  <div className="text-left">
                    <p className="text-lg font-black text-primary uppercase leading-none mb-1">{benchmark.title}</p>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{benchmark.objective}</p>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">add_circle</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Completion Summary Modal */}
      {showCompletionSummary && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-background-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-surface-dark border border-primary/20 rounded-[40px] p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 flex flex-col items-center text-center">
            <div className="size-24 rounded-full bg-success/20 flex items-center justify-center text-success mb-6 border-4 border-success/30 animate-bounce">
              <span className="material-symbols-outlined text-6xl filled">check_circle</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Mission Accomplie !</h2>
            <p className="text-text-secondary text-sm font-medium mb-8">Excellent travail, soldat. Votre condition opérationnelle s'améliore.</p>
            
            <div className="w-full grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Énergie</p>
                <p className="text-2xl font-black text-white">{calculatedCalories} <span className="text-xs font-normal text-text-secondary">kcal</span></p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Durée</p>
                <p className="text-2xl font-black text-white">{workout.duration}</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/')}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-background-dark/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-surface-dark border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="relative h-64 bg-background-dark">
              <img src={selectedExercise.data.img} className="w-full h-full object-cover opacity-80" alt={selectedExercise.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent"></div>
              <button 
                onClick={() => setSelectedExercise(null)} 
                className="absolute top-6 right-6 size-10 rounded-full bg-background-dark/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">{selectedExercise.name}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">{selectedExercise.data.desc}</p>
              
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">tips_and_updates</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Conseil de l'IA</p>
                </div>
                <p className="text-sm font-bold text-white italic">"{selectedExercise.data.tips}"</p>
              </div>

              <button 
                onClick={() => setSelectedExercise(null)}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background-dark/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-surface-dark border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300 flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
              <span className="material-symbols-outlined text-4xl">delete_forever</span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Annuler la séance ?</h3>
            <p className="text-text-secondary text-sm font-medium mb-8">Êtes-vous sûr de vouloir annuler cette séance ? Cela impactera votre progression du Cycle 1.</p>
            
            <div className="w-full space-y-3">
              <button 
                onClick={() => handleAction('cancelled')}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Confirmer l'annulation
              </button>
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="w-full bg-white/5 border border-white/10 text-text-secondary py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
              >
                Conserver la séance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Overlay */}
      {activeTimer && (
        <div className={`fixed inset-0 z-[100] bg-background-dark flex flex-col items-center justify-center p-6 text-center transition-colors duration-500 ${isTabataRest ? 'bg-blue-900/40' : (mainSeconds <= 5 && !isPrepping ? 'bg-primary/20' : 'bg-background-dark/95')} backdrop-blur-xl`}>
          <button onClick={() => setActiveTimer(null)} className="absolute top-6 right-6 size-12 rounded-full bg-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="mb-12">
            <h2 className="text-primary text-xs font-black uppercase tracking-[0.4em] mb-2">{activeTimer}</h2>
            {activeTimer === 'TABATA' && !isPrepping && (
               <div className="flex flex-col items-center gap-1">
                 <p className="text-white text-lg font-black uppercase tracking-widest">Round {tabataRound}/8</p>
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isTabataRest ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-primary/20 text-primary border-primary/30'}`}>
                   {isTabataRest ? 'Repos' : 'Travail'}
                 </span>
               </div>
            )}
          </div>

          <div className="relative size-[320px] flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90 size-full">
              <circle cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
              <circle cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={strokeDasharray} style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease', strokeLinecap: 'round' }} className={`${isPrepping ? 'text-primary animate-pulse' : (isTabataRest ? 'text-blue-400' : 'text-primary')}`} />
            </svg>
            {isPrepping ? (
              <div className="text-[120px] font-black text-primary animate-in zoom-in duration-300">{prepCount}</div>
            ) : (
              <div className={`flex flex-col items-center animate-in zoom-in duration-300 ${mainSeconds <= 5 ? 'animate-pulse scale-110 transition-transform' : ''}`}>
                <div className={`text-[90px] font-black tabular-nums leading-none drop-shadow-2xl ${isTabataRest ? 'text-blue-400' : (mainSeconds <= 5 ? 'text-red-500' : 'text-white')}`}>{formatTime(mainSeconds)}</div>
                {mainSeconds <= 5 && mainSeconds > 0 && <p className="text-primary font-black uppercase tracking-[0.2em] text-xs mt-4">Préparez-vous !</p>}
              </div>
            )}
          </div>

          {!isPrepping && (
            <div className="mt-16 flex gap-6">
              <button onClick={() => setIsPaused(!isPaused)} className={`size-20 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all ${isPaused ? 'bg-green-500 text-background-dark' : 'bg-white/10 text-white border border-white/20'}`}><span className="material-symbols-outlined text-4xl">{isPaused ? 'play_arrow' : 'pause'}</span></button>
              <button onClick={() => setActiveTimer(null)} className="size-20 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 active:scale-95 transition-all"><span className="material-symbols-outlined text-4xl">stop</span></button>
            </div>
          )}
        </div>
      )}

      {/* AppBar */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background-dark/95 p-4 backdrop-blur-md border-b border-white/10">
        <button onClick={() => navigate('/')} className="flex size-10 items-center justify-center rounded-full hover:bg-white/10"><span className="material-symbols-outlined">arrow_back</span></button>
        <h2 className="text-lg font-bold">Semaine {workout.week} • Séance {workout.id.split('-')[1]}</h2>
        <button onClick={() => setShowOptions(!showOptions)} className="flex size-10 items-center justify-center rounded-full hover:bg-white/10"><span className="material-symbols-outlined">more_vert</span></button>
        
        {showOptions && (
          <div className="absolute right-4 top-16 w-64 bg-surface-dark border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
            <button onClick={() => setShowBenchmarkPicker(true)} className="w-full text-left p-4 hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors text-primary"><span className="material-symbols-outlined">auto_fix_high</span><span className="text-sm font-bold">Remplacer par un Benchmark</span></button>
            <button onClick={() => handleAction('rescheduled')} className="w-full text-left p-4 hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors"><span className="material-symbols-outlined text-blue-400">calendar_month</span><span className="text-sm font-bold">Reprogrammer</span></button>
            <button onClick={() => { setShowOptions(false); setShowCancelConfirm(true); }} className="w-full text-left p-4 hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors text-red-400"><span className="material-symbols-outlined">cancel</span><span className="text-sm font-bold">Annuler la séance</span></button>
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
          <button onClick={() => startTimer('WARMUP', 5)} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-green-500 shadow-lg ring-4 ring-background-dark z-10"><span className="material-symbols-outlined text-xl">accessibility_new</span></button>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold">1. Échauffement</h3>
            <span className="text-[10px] font-black text-green-500 border border-green-500/30 px-2 py-0.5 rounded">5 MIN</span>
          </div>
          <ul className="space-y-1">{workout.warmup.map((item, i) => (<li key={i} className="text-sm text-text-secondary">• {item}</li>))}</ul>
        </div>

        {workout.force && (
          <div className="relative pl-12">
            <div className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-blue-500 shadow-lg ring-4 ring-background-dark z-10"><span className="material-symbols-outlined text-xl">fitness_center</span></div>
            <h3 className="text-lg font-bold mb-2">2. Force Opérationnelle</h3>
            <div className="bg-surface-dark p-3 rounded-xl border border-white/5">{workout.force.map((item, i) => (<p key={i} className="text-sm font-bold text-blue-400">{item}</p>))}</div>
          </div>
        )}

        <div className="relative pl-12">
          <button onClick={() => startTimer(workout.timerType, parseInt(workout.duration))} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-primary shadow-lg ring-4 ring-background-dark z-10"><span className="material-symbols-outlined text-xl">bolt</span></button>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">3. Corps de séance ({workout.timerType})</h3>
            <span className="text-xs font-black text-primary">{workout.duration}</span>
          </div>
          <div className="bg-surface-dark p-4 rounded-xl border-l-4 border-primary shadow-lg space-y-2">
            {workout.wod.map((item, i) => (<p key={i} className={`text-sm ${item.includes(':') ? 'font-black text-primary uppercase' : 'text-white'}`}>{item}</p>))}
          </div>

          {/* Section Exercices Guidés */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-3">Exercices Guidés</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {extractExercises().map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedExercise({ name: item.original, data: item.data })}
                  className="shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl active:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-sm">visibility</span>
                  <span className="text-xs font-bold text-white whitespace-nowrap">{item.original.split(':').pop()?.trim()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative pl-12">
          <button onClick={() => startTimer('STRETCHING', 5)} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-indigo-500 shadow-lg ring-4 ring-background-dark z-10"><span className="material-symbols-outlined text-xl">self_improvement</span></button>
          <h3 className="text-lg font-bold mb-2">4. Retour au calme</h3>
          <ul className="space-y-1">{workout.cooldown.map((item, i) => (<li key={i} className="text-sm text-text-secondary">• {item}</li>))}</ul>
        </div>

        <div className="relative pl-12 pb-10">
          <div className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-surface-dark border border-white/20 shadow-lg ring-4 ring-background-dark z-10"><span className="material-symbols-outlined text-xl text-text-secondary">check_circle</span></div>
          <h3 className="text-lg font-bold mb-3">5. Valider la séance</h3>
          <button onClick={() => handleAction('completed')} className="w-full bg-primary text-background-dark font-black py-4 rounded-2xl text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">Séance Terminée</button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetail;
