
import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';

const Onboarding: React.FC = () => {
  const { initializeProfile } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    rank: 'Caporal',
    age: '30',
    weight: '80',
    height: '180',
    photoUrl: 'https://picsum.photos/seed/firefighter/200/200', // Photo par défaut
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    initializeProfile({
      ...formData,
      objective: 'Relance cardio & Technique (Cycle 1)'
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark p-6 justify-center">
      <div className="mb-8 text-center">
        <span className="material-symbols-outlined text-primary text-6xl mb-2 animate-pulse">local_fire_department</span>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Bienvenue sur FireFit</h1>
        <p className="text-text-secondary text-sm mt-1">Initialisons votre profil opérationnel.</p>
      </div>

      <div className="bg-surface-dark border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
        
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-xl font-bold text-center">Qui êtes-vous ?</h2>
            
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                <div className="w-28 h-28 rounded-full border-4 border-primary/30 overflow-hidden bg-background-dark flex items-center justify-center shadow-inner">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-text-secondary">person</span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-primary text-background-dark rounded-full p-2 border-4 border-surface-dark shadow-lg">
                  <span className="material-symbols-outlined text-sm font-bold">photo_camera</span>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Ajouter une photo</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 block mb-1">Nom complet</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full bg-background-dark border border-white/10 rounded-2xl p-4 font-bold focus:border-primary outline-none text-white" 
                  placeholder="Jean Dupont" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 block mb-1">Grade</label>
                <select 
                  name="rank" 
                  value={formData.rank} 
                  onChange={handleChange} 
                  className="w-full bg-background-dark border border-white/10 rounded-2xl p-4 font-bold focus:border-primary outline-none appearance-none text-white"
                >
                  <option>Sapeur</option>
                  <option>Caporal</option>
                  <option>Caporal-Chef</option>
                  <option>Sergent</option>
                  <option>Sergent-Chef</option>
                  <option>Adjudant</option>
                  <option>Lieutenant</option>
                  <option>Capitaine</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleNext} 
              disabled={!formData.name} 
              className="w-full bg-primary text-background-dark font-black py-4 rounded-2xl disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-primary/20"
            >
              CONTINUER
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-xl font-bold">Vos Mensurations</h2>
            <p className="text-xs text-text-secondary">Ces données serviront de référence de base pour votre historique de santé.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 block mb-1">Poids (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-background-dark border border-white/10 rounded-2xl p-4 font-bold focus:border-primary outline-none text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 block mb-1">Taille (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-background-dark border border-white/10 rounded-2xl p-4 font-bold focus:border-primary outline-none text-white" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1 block mb-1">Âge</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-background-dark border border-white/10 rounded-2xl p-4 font-bold focus:border-primary outline-none text-white" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleBack} className="flex-1 bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl active:scale-95 transition-all">RETOUR</button>
              <button onClick={handleNext} className="flex-[2] bg-primary text-background-dark font-black py-4 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all">DERNIÈRE ÉTAPE</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-300 text-center">
            <h2 className="text-xl font-bold">Prêt pour l'action ?</h2>
            <div className="flex flex-col items-center">
              <img src={formData.photoUrl} alt="Final" className="w-24 h-24 rounded-full border-4 border-primary mb-4 object-cover shadow-xl" />
              <p className="text-lg font-black">{formData.name}</p>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">{formData.rank}</p>
            </div>
            <p className="text-sm text-text-secondary px-4">Votre programme de réathlétisation sur 6 mois est prêt. Vos mesures actuelles ont été enregistrées comme point de départ.</p>
            <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Référence initiale</p>
              <p className="text-2xl font-black text-white">{formData.weight}kg • {formData.height}cm</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleSubmit} className="w-full bg-primary text-background-dark font-black py-5 rounded-2xl shadow-xl shadow-primary/30 active:scale-95 text-lg transition-all">DÉMARRER LE PROGRAMME</button>
              <button onClick={handleBack} className="text-text-secondary text-xs font-bold uppercase tracking-widest">Corriger mes infos</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
