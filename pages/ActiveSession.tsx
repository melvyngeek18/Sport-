
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAIVoiceCoach, speakEncouragement } from '../services/geminiService';
import { useUser } from '../context/UserContext';

const ActiveSession: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(12 * 60 + 45); // 12:45
  const [isPaused, setIsPaused] = useState(false);
  const [aiTip, setAiTip] = useState(`Allez ${user.name.split(' ')[0]}, maintien le rythme !`);
  const initialTipRef = useRef(false);

  useEffect(() => {
    let timer: number;
    if (!isPaused && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused, timeLeft]);

  // Occasional AI Tips with Voice
  useEffect(() => {
    const fetchAndSpeakTip = async () => {
      const tip = await getAIVoiceCoach(`Sapeur-Pompier ${user.name} pendant un effort intense`);
      setAiTip(tip);
      if (user.guidageAudioEnabled) {
        speakEncouragement(tip);
      }
    };

    // Premier encouragement au démarrage
    if (!initialTipRef.current) {
      fetchAndSpeakTip();
      initialTipRef.current = true;
    }

    const interval = setInterval(fetchAndSpeakTip, 45000); // Toutes les 45s
    return () => clearInterval(interval);
  }, [user.name, user.guidageAudioEnabled]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark p-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between py-2 mb-6">
        <button onClick={() => navigate(-1)} className="size-12 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold tracking-tight text-white">Séance du Jour</h2>
        <div className="size-12 flex items-center justify-center">
           {user.guidageAudioEnabled && (
             <span className="material-symbols-outlined text-primary animate-pulse">volume_up</span>
           )}
        </div>
      </div>

      <div className="px-2">
        <h1 className="text-[28px] font-black leading-tight mb-1 text-white">Condition Opérationnelle</h1>
        <p className="text-text-secondary text-sm font-medium">{user.rank} • Niveau Avancé</p>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-primary text-[10px] font-black uppercase tracking-widest">Round 3/5</span>
          <span className="text-sm font-bold text-white">60%</span>
        </div>
        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="relative w-full aspect-[4/3] flex flex-col items-center justify-center rounded-3xl bg-surface-dark/50 border-2 border-primary/60 shadow-[0_0_40px_rgba(220,38,38,0.1)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none"></div>
          
          <p className="text-text-secondary text-base font-bold uppercase tracking-[0.2em] mb-4">TRAVAIL</p>
          <div className="text-[110px] leading-none font-black tracking-tighter tabular-nums drop-shadow-xl text-white">
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
            <p className="text-primary text-sm font-black uppercase tracking-widest">INTERVALLE ACTIF</p>
          </div>
        </div>
      </div>

      {/* Current Exercise Card */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-surface-dark mb-6 mt-4">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=800')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        <div className="relative p-6 flex flex-col h-full min-h-[160px] justify-end">
          <span className="inline-flex items-center rounded-lg bg-primary/20 px-2 py-0.5 text-[9px] font-black text-primary border border-primary/30 uppercase tracking-widest w-fit mb-2">
            Exercice en cours
          </span>
          <h3 className="text-white text-3xl font-black tracking-tight">15 Burpees</h3>
          <p className="text-primary/90 text-sm font-bold mt-2 italic">"{aiTip}"</p>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-text-secondary text-lg">fast_forward</span>
            <p className="text-text-secondary text-xs">À suivre : <span className="text-white font-bold">200m Rameur</span></p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/')}
          className="flex-1 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 font-black text-lg hover:bg-white/10 transition-colors text-white"
        >
          <span className="material-symbols-outlined">stop</span>
          Fin
        </button>
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="flex-[2] h-16 rounded-2xl bg-primary flex items-center justify-center gap-2 font-black text-lg text-white shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined font-black">{isPaused ? 'play_arrow' : 'pause'}</span>
          {isPaused ? 'Reprendre' : 'Pause'}
        </button>
      </div>
    </div>
  );
};

export default ActiveSession;
