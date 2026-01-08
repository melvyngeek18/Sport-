
import React, { useState } from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { COLORS } from '../constants';
import { useUser } from '../context/UserContext';
import { HealthMetric } from '../types';

const HealthTracking: React.FC = () => {
  const [range, setRange] = useState('30j');
  const { user, healthHistory, addHealthMetric } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newWeight, setNewWeight] = useState(user.weight);
  const [newSystolic, setNewSystolic] = useState('120');
  const [newDiastolic, setNewDiastolic] = useState('80');
  const [newHR, setNewHR] = useState('60');

  const handleSaveMetric = () => {
    const metric: HealthMetric = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(newWeight),
      heartRate: parseInt(newHR),
      bloodPressure: {
        systolic: parseInt(newSystolic),
        diastolic: parseInt(newDiastolic)
      }
    };
    addHealthMetric(metric);
    setIsModalOpen(false);
  };

  const latestMetric = healthHistory[healthHistory.length - 1] || {
    weight: user.weight,
    heartRate: 60,
    bloodPressure: { systolic: 120, diastolic: 80 }
  };

  return (
    <div className="flex-1 pb-24 overflow-y-auto no-scrollbar relative">
      {/* Modal / Overlay pour la saisie */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-surface-dark border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight">Nouvelle Mesure</h2>
              <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-full bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block ml-1">Poids (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-background-dark border border-white/10 rounded-2xl p-4 text-lg font-bold focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block ml-1">Systolique (mmHg)</label>
                  <input 
                    type="number" 
                    value={newSystolic}
                    onChange={(e) => setNewSystolic(e.target.value)}
                    className="w-full bg-background-dark border border-white/10 rounded-2xl p-4 text-lg font-bold focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block ml-1">Diastolique (mmHg)</label>
                  <input 
                    type="number" 
                    value={newDiastolic}
                    onChange={(e) => setNewDiastolic(e.target.value)}
                    className="w-full bg-background-dark border border-white/10 rounded-2xl p-4 text-lg font-bold focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block ml-1">Fréq. Cardiaque (bpm)</label>
                <input 
                  type="number" 
                  value={newHR}
                  onChange={(e) => setNewHR(e.target.value)}
                  className="w-full bg-background-dark border border-white/10 rounded-2xl p-4 text-lg font-bold focus:border-primary outline-none transition-colors"
                />
              </div>

              <button 
                onClick={handleSaveMetric}
                className="w-full bg-primary text-background-dark py-4 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TopBar */}
      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
        <h1 className="text-lg font-bold tracking-tight text-center flex-1">Suivi Poids & Santé</h1>
        <button className="p-2 rounded-full hover:bg-white/5">
          <span className="material-symbols-outlined text-2xl">notifications</span>
        </button>
      </header>

      {/* Date Range Selector */}
      <div className="px-4 py-4 flex gap-3 overflow-x-auto no-scrollbar">
        {['7j', '30j', '3m', '1an'].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all shrink-0 ${
              range === r ? 'bg-primary text-background-dark' : 'bg-surface-dark text-text-secondary'
            }`}
          >
            {r === '30j' ? '30 Jours' : r.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Alerte si tension élevée */}
      {latestMetric.bloodPressure.systolic >= 140 && (
        <div className="px-4 py-2">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="size-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined filled">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-red-400">Vigilance : Tension Élevée</h3>
                <p className="text-[10px] text-red-300 font-medium">Vos dernières mesures ({latestMetric.bloodPressure.systolic}/{latestMetric.bloodPressure.diastolic}) sont au-dessus des seuils recommandés.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="p-4 space-y-4">
        {/* Weight Card */}
        <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="size-2 rounded-full bg-primary"></span>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Poids</p>
              </div>
              <p className="text-4xl font-black">{user.weight} <span className="text-lg font-medium text-text-secondary">kg</span></p>
            </div>
            <div className="text-right">
              <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-[10px] font-black">Stable</span>
              <p className="text-[9px] text-text-secondary mt-1 font-bold">vs mesure précédente</p>
            </div>
          </div>
          
          <div className="h-40 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthHistory}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="weight" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" animationDuration={1000} />
                <Tooltip 
                  contentStyle={{ background: '#27211b', border: 'none', borderRadius: '12px' }}
                  itemStyle={{ color: '#f48c25' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Pressure Card */}
        <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="size-2 rounded-full bg-red-500"></span>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Tension Artérielle</p>
              </div>
              <p className="text-4xl font-black">
                {latestMetric.bloodPressure.systolic}/{latestMetric.bloodPressure.diastolic} 
                <span className="text-lg font-medium text-text-secondary ml-2">mmHg</span>
              </p>
            </div>
            <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${latestMetric.bloodPressure.systolic >= 140 ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-green-500/10 text-green-500 border-green-500/30'}`}>
              {latestMetric.bloodPressure.systolic >= 140 ? 'Attention' : 'Normal'}
            </span>
          </div>

          <div className="mt-8 mb-4">
             <div className="flex justify-between text-[10px] font-black text-text-secondary uppercase mb-2">
               <span>Optimale</span>
               <span>Normale</span>
               <span>Élevée</span>
             </div>
             <div className="h-3 w-full bg-white/5 rounded-full flex overflow-hidden">
               <div className="h-full bg-green-500/30 w-1/3 border-r border-background-dark"></div>
               <div className="h-full bg-yellow-500/30 w-1/3 border-r border-background-dark"></div>
               <div className="h-full bg-red-500/30 w-1/3"></div>
             </div>
             <div className="relative h-6 mt-1 transition-all duration-500" style={{ transform: `translateX(${Math.min(latestMetric.bloodPressure.systolic - 100, 80)}%)` }}>
                <div className="absolute left-0 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-primary"></div>
                  <span className="text-[9px] font-black text-primary mt-1">{latestMetric.bloodPressure.systolic}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Heart Rate Card */}
        <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-sm">
           <div className="flex items-center gap-2 mb-6">
             <span className="material-symbols-outlined text-primary text-xl">ecg_heart</span>
             <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Fréquence Cardiaque</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-white/5 p-3 rounded-xl border border-white/5">
               <p className="text-[10px] text-text-secondary font-bold mb-1">Dernière mesure</p>
               <p className="text-xl font-black">{latestMetric.heartRate} <span className="text-xs font-normal text-text-secondary">bpm</span></p>
             </div>
             <div className="bg-white/5 p-3 rounded-xl border border-white/5">
               <p className="text-[10px] text-text-secondary font-bold mb-1">Tendance</p>
               <div className="flex items-center gap-1 text-[9px] text-green-500 font-bold mt-1 uppercase">
                 <span className="material-symbols-outlined text-[12px]">check_circle</span> stable
               </div>
             </div>
           </div>

           <div className="h-32 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={healthHistory}>
                 <Area type="monotone" dataKey="heartRate" stroke={COLORS.primary} strokeWidth={2} fillOpacity={0.1} fill={COLORS.primary} animationDuration={1000} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 bg-primary text-background-dark px-5 rounded-2xl flex items-center gap-3 shadow-xl shadow-primary/30 active:scale-95 hover:scale-105 transition-all"
        >
          <span className="material-symbols-outlined font-black">add</span>
          <span className="text-sm font-black uppercase tracking-wider">Nouvelle Mesure</span>
        </button>
      </div>
    </div>
  );
};

export default HealthTracking;
