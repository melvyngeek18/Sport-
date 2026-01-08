
import React from 'react';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 pb-24 overflow-y-auto no-scrollbar">
      {/* AppBar */}
      <div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md p-4 pb-3 flex items-center justify-between border-b border-white/5">
        <h2 className="text-2xl font-bold tracking-tight">Historique</h2>
        <button className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">tune</span>
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

      {/* Content */}
      <div className="px-4 py-4 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Octobre 2023</h3>
          <div className="space-y-4">
            {/* Card 1 */}
            <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden shadow-sm">
              <div className="p-4 flex items-center gap-4">
                <div className="size-14 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/10 shrink-0">
                  <span className="text-[10px] text-text-secondary font-bold uppercase">Oct</span>
                  <span className="text-xl font-black">24</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">Circuit Opérationnel</h4>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-primary font-bold">
                      <span className="material-symbols-outlined text-sm filled">local_fire_department</span>
                      Intense
                    </div>
                    <span className="size-1 rounded-full bg-white/20"></span>
                    <span className="text-text-secondary">45 min</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-secondary rotate-90">chevron_right</span>
              </div>
              
              <div className="bg-white/[0.02] border-t border-white/5 p-4 space-y-3">
                 <div className="flex justify-between text-xs">
                   <span className="text-text-secondary">Pompes</span>
                   <span className="font-black">4 x 15</span>
                 </div>
                 <div className="flex justify-between text-xs">
                   <span className="text-text-secondary">Tractions</span>
                   <span className="font-black">3 x 8</span>
                 </div>
                 <button className="w-full mt-2 py-2.5 rounded-xl border border-primary text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-colors">
                   Répéter la séance
                 </button>
              </div>
            </div>

            {/* Simple Card */}
            <div className="bg-surface-dark rounded-2xl border border-white/5 p-4 flex items-center gap-4 shadow-sm">
              <div className="size-14 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/10 shrink-0">
                <span className="text-[10px] text-text-secondary font-bold uppercase">Oct</span>
                <span className="text-xl font-black">22</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">Renfo Musculaire</h4>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-yellow-500 font-bold">
                    <span className="material-symbols-outlined text-sm filled">bolt</span>
                    Modéré
                  </div>
                  <span className="size-1 rounded-full bg-white/20"></span>
                  <span className="text-text-secondary">1h 10m</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Septembre 2023</h3>
          <div className="bg-surface-dark rounded-2xl border border-white/5 p-4 flex items-center gap-4 shadow-sm opacity-80">
            <div className="size-14 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/10 shrink-0">
              <span className="text-[10px] text-text-secondary font-bold uppercase">Sep</span>
              <span className="text-xl font-black">28</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">Manœuvre Incendie</h4>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-primary font-bold">
                  <span className="material-symbols-outlined text-sm filled">local_fire_department</span>
                  Intense
                </div>
                <span className="size-1 rounded-full bg-white/20"></span>
                <span className="text-text-secondary">2h 00m</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-text-secondary">chevron_right</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
