
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { TimerType, WorkoutStatus, Workout } from '../types';
import { speakEncouragement, getAIVoiceCoach } from '../services/geminiService';
import { CROSSFIT_BENCHMARKS } from '../constants';

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
  const [showBenchmarkPicker, setShowBenchmarkPicker] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<{ name: string, data: any } | null>(null);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState(0);

  // Audio Playlist States
  const [playlist, setPlaylist] = useState<{ name: string, url: string }[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      interval = window.setInterval(async () => {
        if (isPaused) return;

        if (isPrepping) {
          if (prepCount > 0) {
            if (prepCount <= 3) playBeep(440);
            setPrepCount(prev => prev - 1);
          } else {
            setIsPrepping(false);
            playBeep(880, 0.3);
            if (user.guidageAudioEnabled) {
              speakEncouragement(`Attention ! On commence. Donnez tout !`);
            }
          }
        } else {
          if (mainSeconds > 0) {
            setMainSeconds(prev => prev - 1);
            if (mainSeconds <= 4) playBeep(440);

            // Motivations IA périodiques
            if (user.guidageAudioEnabled) {
              if (mainSeconds === Math.floor(totalSeconds / 2)) {
                const tip = await getAIVoiceCoach(`Moitié de la séance ${workout.title}.`);
                speakEncouragement(tip);
              } else if (mainSeconds === 10) {
                speakEncouragement("10 secondes ! Finissez fort !");
              }
            }
          } else {
            // Logique de fin ou de passage Tabata
            if (activeTimer === 'TABATA' && !isTabataRest && tabataRound < 8) {
              setIsTabataRest(true);
              setMainSeconds(10);
              setTotalSeconds(10);
              playBeep(660, 0.3);
              if (user.guidageAudioEnabled) speakEncouragement("Repos.");
            } else if (activeTimer === 'TABATA' && isTabataRest) {
              setIsTabataRest(false);
              setTabataRound(prev => prev + 1);
              setMainSeconds(20);
              setTotalSeconds(20);
              playBeep(880, 0.3);
              if (user.guidageAudioEnabled) speakEncouragement(`Round ${tabataRound + 1}.`);
            } else {
              playBeep(880, 0.5);
              if (user.guidageAudioEnabled) speakEncouragement("Séance terminée. Bien joué soldat.");
              setActiveTimer(null);
            }
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, isPrepping, prepCount, mainSeconds, isPaused, isTabataRest, tabataRound, totalSeconds, user.guidageAudioEnabled, workout.title]);

  const startTimer = (type: TimerType, durationMinutes: number) => {
    setActiveTimer(type);
    setIsPrepping(true);
    setPrepCount(5);
    setIsPaused(false);
    
    if (user.guidageAudioEnabled) {
      speakEncouragement("Mise en place. Début de séance imminent.");
    }
    
    if (type === 'TABATA') {
      setMainSeconds(20);
      setTotalSeconds(20);
      setTabataRound(1);
      setIsTabataRest(false);
    } else {
      const dur = durationMinutes * 60;
      setTotalSeconds(dur);
      setMainSeconds(dur);
    }
  };

  const handlePlaylistUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newTracks = Array.from(files).map((file: File) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setPlaylist(prev => [...prev, ...newTracks]);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlayingMusic(!isPlayingMusic);
  };

  const nextTrack = () => setCurrentTrackIndex(prev => (prev + 1) % playlist.length);

  const calculateCaloriesBurned = () => {
    const MET_VALUES: Record<string, number> = {
      'AMRAP': 12.0, 'EMOM': 10.5, 'TABATA': 13.5, 'STANDARD': 8.0, 'WARMUP': 4.0, 'STRETCHING': 2.5
    };
    const met = MET_VALUES[workout.timerType] || 8.0;
    const weight = parseFloat(user.weight) || 75;
    const duration = parseInt(workout.duration) || 30;
    return Math.round((met * 3.5 * weight / 200) * duration);
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

  return (
    <div className="flex-1 pb-40 overflow-y-auto no-scrollbar relative bg-background-dark text-white">
      <audio 
        ref={audioRef} 
        src={playlist[currentTrackIndex]?.url} 
        onEnded={nextTrack}
        onPlay={() => setIsPlayingMusic(true)}
        onPause={() => setIsPlayingMusic(false)}
      />

      {/* Completion Modal */}
      {showCompletionSummary && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-background-dark/95 backdrop-blur-xl">
          <div className="w-full max-sm bg-surface-dark border border-primary/20 rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="size-24 rounded-full bg-success/20 flex items-center justify-center text-success mb-6 border-4 border-success/30">
              <span className="material-symbols-outlined text-6xl filled">check_circle</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Terminé !</h2>
            <div className="w-full grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Énergie</p>
                <p className="text-2xl font-black">{calculatedCalories} kcal</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Temps</p>
                <p className="text-2xl font-black">{workout.duration}</p>
              </div>
            </div>
            <button onClick={() => navigate('/')} className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Accueil</button>
          </div>
        </div>
      )}

      {/* Timer Overlay & Preparation Indicator */}
      {activeTimer && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center transition-all duration-700 ${isPrepping ? 'bg-primary/20 backdrop-blur-3xl' : (isTabataRest ? 'bg-blue-900/40 backdrop-blur-xl' : 'bg-background-dark/95 backdrop-blur-xl')}`}>
          <button onClick={() => setActiveTimer(null)} className="absolute top-6 right-6 size-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="mb-10 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-primary text-xs font-black uppercase tracking-[0.5em] mb-4">{activeTimer}</h2>
            {isPrepping && (
              <p className="text-white text-lg font-black uppercase tracking-widest animate-pulse">PRÉPARATION</p>
            )}
            {!isPrepping && activeTimer === 'TABATA' && (
               <div className="flex flex-col items-center gap-1">
                 <p className="text-white text-lg font-black uppercase tracking-widest">Round {tabataRound}/8</p>
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isTabataRest ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-primary/20 text-primary border-primary/30'}`}>
                   {isTabataRest ? 'Repos' : 'Travail'}
                 </span>
               </div>
            )}
          </div>

          <div className="relative size-[340px] flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90 size-full">
              <circle cx="170" cy="170" r="150" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-white/5" />
              <circle cx="170" cy="170" r="150" stroke="currentColor" strokeWidth="14" fill="transparent" strokeDasharray={2 * Math.PI * 150} style={{ strokeDashoffset: 2 * Math.PI * 150 * (1 - progress), transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease', strokeLinecap: 'round' }} className={isPrepping ? 'text-primary' : (isTabataRest ? 'text-blue-400' : 'text-primary')} />
            </svg>
            
            <div className="flex flex-col items-center justify-center z-10">
              {isPrepping ? (
                <div className="flex flex-col items-center">
                   <p className="text-primary text-xs font-black uppercase tracking-widest mb-2">PRÊT ?</p>
                   <div className="text-[140px] font-black leading-none text-white drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-in zoom-in duration-300">
                     {prepCount > 0 ? prepCount : "GO"}
                   </div>
                </div>
              ) : (
                <div className={`text-[100px] font-black tabular-nums leading-none ${isTabataRest ? 'text-blue-400' : 'text-white'} drop-shadow-2xl`}>
                  {formatTime(mainSeconds)}
                </div>
              )}
            </div>
          </div>

          {!isPrepping && (
            <div className="mt-16 flex gap-6 animate-in slide-in-from-bottom-4">
              <button onClick={() => setIsPaused(!isPaused)} className={`size-20 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all ${isPaused ? 'bg-green-500 text-black' : 'bg-white/10 text-white border border-white/20'}`}>
                <span className="material-symbols-outlined text-4xl">{isPaused ? 'play_arrow' : 'pause'}</span>
              </button>
              <button onClick={() => setActiveTimer(null)} className="size-20 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 active:scale-90 transition-all">
                <span className="material-symbols-outlined text-4xl">stop</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* AppBar */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background-dark/95 p-4 backdrop-blur-md border-b border-white/10">
        <button onClick={() => navigate('/')} className="flex size-10 items-center justify-center rounded-full hover:bg-white/10"><span className="material-symbols-outlined text-2xl">arrow_back</span></button>
        <h2 className="text-lg font-bold">Entraînement</h2>
        <button onClick={() => setShowOptions(!showOptions)} className="flex size-10 items-center justify-center rounded-full hover:bg-white/10"><span className="material-symbols-outlined text-2xl">more_vert</span></button>
      </div>

      <div className="px-4 pt-6 pb-2">
        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase leading-none text-white">{workout.title}</h1>
        <div className="flex gap-2 mb-6">
           <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black rounded-full border border-primary/30 uppercase tracking-widest">{workout.timerType}</span>
           <span className="px-3 py-1 bg-white/5 text-text-secondary text-[10px] font-black rounded-full border border-white/10 uppercase tracking-widest">{workout.duration}</span>
        </div>
      </div>

      {/* Playlist Selector */}
      <div className="mx-4 mb-8 bg-surface-dark border border-white/10 rounded-[32px] p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">equalizer</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Musique de Combat</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">upload</span> Importer
          </button>
          <input type="file" ref={fileInputRef} onChange={handlePlaylistUpload} multiple accept="audio/*" className="hidden" />
        </div>

        {playlist.length > 0 ? (
          <div className="bg-background-dark/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex-1 overflow-hidden mr-4">
              <p className="text-xs font-bold text-white truncate">{playlist[currentTrackIndex]?.name}</p>
              <p className="text-[9px] text-text-secondary font-medium mt-1 uppercase tracking-widest">Piste {currentTrackIndex + 1}/{playlist.length}</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentTrackIndex(prev => (prev - 1 + playlist.length) % playlist.length)} className="text-white opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-2xl">skip_previous</span></button>
              <button onClick={toggleMusic} className="size-11 rounded-full bg-primary text-white flex items-center justify-center shadow-lg active:scale-90"><span className="material-symbols-outlined text-3xl">{isPlayingMusic ? 'pause' : 'play_arrow'}</span></button>
              <button onClick={nextTrack} className="text-white opacity-60 hover:opacity-100"><span className="material-symbols-outlined text-2xl">skip_next</span></button>
            </div>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 text-center border-2 border-dashed border-white/5 rounded-2xl group active:bg-white/5 transition-colors">
            <p className="text-xs text-text-secondary font-medium">Charger une playlist du mobile</p>
          </button>
        )}
      </div>

      {/* Structure Timeline */}
      <div className="px-4 space-y-8 relative">
        <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-white/5"></div>
        
        <div className="relative pl-12 group">
          <button onClick={() => startTimer('WARMUP', 5)} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-green-500 shadow-lg ring-4 ring-background-dark z-10 transition-transform group-hover:scale-110 active:scale-90"><span className="material-symbols-outlined text-xl text-background-dark font-black">directions_run</span></button>
          <h3 className="text-lg font-bold">1. Échauffement (5m)</h3>
          <ul className="mt-2 space-y-1">{workout.warmup.map((item, i) => (<li key={i} className="text-sm text-text-secondary leading-tight">• {item}</li>))}</ul>
        </div>

        <div className="relative pl-12 group">
          <button onClick={() => startTimer(workout.timerType, parseInt(workout.duration))} className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-primary shadow-lg ring-4 ring-background-dark z-10 transition-transform group-hover:scale-110 active:scale-90"><span className="material-symbols-outlined text-xl text-background-dark font-black">bolt</span></button>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">2. Séance ({workout.timerType})</h3>
            <span className="text-[10px] font-black text-primary px-2 py-0.5 border border-primary/30 rounded uppercase tracking-widest">Action</span>
          </div>
          <div className="bg-surface-dark p-4 rounded-2xl border-l-4 border-primary space-y-3 shadow-xl">
            {workout.wod.map((item, i) => (<p key={i} className={`text-sm leading-tight ${item.includes(':') ? 'font-black text-primary uppercase' : 'text-white font-medium'}`}>{item}</p>))}
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {extractExercises().map((item, idx) => (
              <button key={idx} onClick={() => setSelectedExercise({ name: item.original, data: item.data })} className="shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl active:bg-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{item.original.split(':').pop()?.trim()}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative pl-12 pb-10 group">
          <div className="absolute left-0 top-0 size-10 flex items-center justify-center rounded-full bg-surface-dark border border-white/20 shadow-lg ring-4 ring-background-dark z-10"><span className="material-symbols-outlined text-xl text-text-secondary">check_circle</span></div>
          <h3 className="text-lg font-bold mb-4">3. Clôture de mission</h3>
          <button onClick={() => handleAction('completed')} className="w-full bg-primary text-background-dark font-black py-5 rounded-2xl text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all">Terminer la Séance</button>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-background-dark/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-surface-dark border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-500">
            <div className="relative h-72 bg-background-dark">
              <img src={selectedExercise.data.img} className="w-full h-full object-cover opacity-80" alt={selectedExercise.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent"></div>
              <button onClick={() => setSelectedExercise(null)} className="absolute top-6 right-6 size-12 rounded-full bg-black/50 flex items-center justify-center border border-white/10"><span className="material-symbols-outlined text-2xl">close</span></button>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">{selectedExercise.name}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">{selectedExercise.data.desc}</p>
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Conseil IA</p>
                <p className="text-sm font-bold text-white italic leading-tight">"{selectedExercise.data.tips}"</p>
              </div>
              <button onClick={() => setSelectedExercise(null)} className="w-full bg-primary text-background-dark py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95">Compris</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetail;
