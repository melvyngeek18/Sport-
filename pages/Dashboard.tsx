
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProgram } = useUser();
  const [showReminder, setShowReminder] = useState(false);

  // Calcul du ratio de progression
  const workoutProgress = useMemo(() => {
    const completed = userProgram.filter(w => w.status === 'completed').length;
    const total = userProgram.length;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [userProgram]);

  // Simulation du rappel basé sur l'heure choisie par l'utilisateur
  useEffect(() => {
    if (user.notificationsEnabled) {
      const now = new Date();
      const currentHours = now.getHours();
      
      const [reminderHours] = user.reminderTime.split(':').map(Number);
      
      if (currentHours === reminderHours) {
        setShowReminder(true);
      } else {
        setShowReminder(false);
      }
    } else {
      setShowReminder(false);
    }
  }, [user.notificationsEnabled, user.reminderTime]);

  return (
    <div className="flex-1 pb-24 px-4 overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-background-dark/90 backdrop-blur-md py-4 flex items-center justify-between border-b border-white/5 -mx-4 px-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">local_fire_department</span>
          <h1 className="text-xl font-bold tracking-tight">FireFit Ops</h1>
        </div>
        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-text-secondary">fact_check</span>
          <span className="absolute -top-0.5 -right-1 flex items-center justify-center bg-primary text-[8px] font-black text-white min-w-[20px] h-[16px] px-1.5 rounded-full border border-background-dark shadow-lg ring-1 ring-white/10 animate-in zoom-in duration-300">
            {workoutProgress.completed}/{workoutProgress.total}
          </span>
        </button>
      </header>

      {/* Bandeau de rappel personnalisé */}
      {showReminder && (
        <div className="mt-4 bg-primary p-4 rounded-2xl flex items-center justify-between shadow-xl animate-bounce">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-background-dark font-black">alarm</span>
             <div>
               <p className="text-background-dark font-black text-sm uppercase leading-none">Rappel de {user.reminderTime}</p>
               <p className="text-background-dark/80 text-[10px] font-bold">Soldat, c'est l'heure de votre entraînement !</p>
             </div>
          </div>
          <button onClick={() => setShowReminder(false)} className="text-background-dark">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Program Progress Banner */}
      <section className="mt-4 mb-6 bg-surface-dark border border-primary/20 rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Cycle 1 : Relance</h3>
            <p className="text-[10px] text-text-secondary font-bold">Semaine 2 / 24 • Mois 1</p>
          </div>
          <span className="text-xl font-black text-white">{workoutProgress.percent}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${workoutProgress.percent}%` }}></div>
        </div>
      </section>

      {/* User Greeting */}
      <section className="mb-8 flex items-center gap-4">
        <div className="relative shrink-0">
          <img 
            src={user.photoUrl} 
            alt="Profile" 
            className="w-16 h-16 rounded-full border-2 border-primary object-cover"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-background-dark w-5 h-5 rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold leading-tight">Bonjour, {user.name.split(' ')[0]}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-wider">
              {user.rank}
            </span>
            <span className="text-text-secondary text-sm font-medium">• Forme Optimale</span>
          </div>
        </div>
      </section>

      {/* Thème du programme (Objectif) */}
      <div className="mb-6 bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
         <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">ads_click</span>
         </div>
         <div>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">Thème du programme</p>
            <p className="text-sm font-bold text-white leading-tight">{user.objective}</p>
         </div>
      </div>

      {/* Quick Stats Row */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined filled">monitor_weight</span>
          </div>
          <div>
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Poids Actuel</p>
            <p className="text-lg font-bold text-white">{user.weight} kg</p>
          </div>
        </div>
        <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <span className="material-symbols-outlined filled">height</span>
          </div>
          <div>
            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Taille</p>
            <p className="text-lg font-bold text-white">{user.height} cm</p>
          </div>
        </div>
      </section>

      {/* Hero Card: Today's Workout */}
      <section className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-lg font-bold">À faire aujourd'hui</h3>
          <span className="text-sm text-primary font-medium">Cycle 1 • Séance 1</span>
        </div>
        <div 
          onClick={() => navigate('/training')}
          className="group relative overflow-hidden rounded-2xl bg-surface-dark shadow-xl border border-white/5 cursor-pointer"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center z-0 opacity-40 group-hover:scale-105 transition-transform duration-700" 
            style={{ backgroundImage: "url('https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/70 to-transparent z-10"></div>
          
          <div className="relative z-20 p-6 flex flex-col h-full min-h-[220px] justify-between">
            <div className="flex justify-between items-start">
              <span className="inline-block px-2 py-1 bg-white/10 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                Force + Metcon
              </span>
              <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-white text-sm">bookmark</span>
              </button>
            </div>
            
            <div>
              <h4 className="text-2xl font-bold text-white mb-1 leading-tight">Force Bas du Corps</h4>
              <div className="flex items-center gap-4 text-sm text-gray-300 mb-5">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-lg">timer</span>
                  60 min
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                  Intensité Élevée
                </div>
              </div>
              <button className="w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined filled">play_arrow</span>
                Voir la séance
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
