
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // État local temporaire pour l'édition
  const [localData, setLocalData] = useState(user);

  // Synchroniser l'état local si l'utilisateur global change
  useEffect(() => {
    setLocalData(user);
  }, [user]);

  // État pour le mode édition
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    updateUser(localData);
    setIsEditing(false);
  };

  const handlePhotoEditTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLocalData({ ...localData, photoUrl: base64String });
        if (!isEditing) {
          updateUser({ ...localData, photoUrl: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleNotification = () => {
    const newVal = !user.notificationsEnabled;
    updateUser({ notificationsEnabled: newVal });
  };

  const toggleAudio = () => {
    const newVal = !user.guidageAudioEnabled;
    updateUser({ guidageAudioEnabled: newVal });
  };

  return (
    <div className="flex-1 pb-24 overflow-y-auto no-scrollbar">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* AppBar */}
      <div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md p-4 pb-2 flex items-center justify-between border-b border-white/5">
        <button onClick={() => navigate(-1)} className="size-12 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold tracking-tight text-center flex-1">
          {isEditing ? 'Édition du Profil' : 'Mon Profil'}
        </h2>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="text-primary text-sm font-bold uppercase tracking-widest">Modifier</button>
        ) : (
          <button onClick={handleSave} className="text-success text-sm font-bold uppercase tracking-widest">Sauver</button>
        )}
      </div>

      {/* Profile Header */}
      <div className="p-8 flex flex-col items-center text-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-cover bg-center border-4 border-surface-dark shadow-2xl transition-all overflow-hidden">
            <img src={localData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button onClick={handlePhotoEditTrigger} className={`absolute bottom-1 right-1 p-2 rounded-full border-4 border-background-dark shadow-md transition-colors ${isEditing ? 'bg-success text-white' : 'bg-primary text-background-dark'}`}>
            <span className="material-symbols-outlined text-lg leading-none font-bold">{isEditing ? 'add_a_photo' : 'photo_camera'}</span>
          </button>
        </div>

        {isEditing ? (
          <div className="mt-4 w-full max-w-[250px] space-y-2">
            <input type="text" value={localData.name} onChange={(e) => setLocalData({...localData, name: e.target.value})} className="w-full bg-surface-dark border border-primary/30 rounded-lg p-2 text-center text-xl font-black text-white outline-none" placeholder="Nom" />
            <input type="text" value={localData.objective} onChange={(e) => setLocalData({...localData, objective: e.target.value})} className="w-full bg-surface-dark border border-white/10 rounded-lg p-2 text-center text-xs font-bold text-primary outline-none" placeholder="Objectif (ex: Relance cardio)" />
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-black mt-4">{user.name}</h3>
            <p className="text-text-secondary text-sm font-bold tracking-wider uppercase mt-1">{user.rank} • {user.age} ans</p>
          </>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="px-4 flex gap-3 mb-8">
        {[
          { key: 'weight', icon: 'monitor_weight', val: localData.weight, unit: 'kg', label: 'Poids' },
          { key: 'height', icon: 'height', val: localData.height, unit: 'cm', label: 'Taille' },
          { key: 'objective', icon: 'ads_click', val: localData.objective, unit: '', label: 'Objectif' },
        ].map((stat, i) => (
          <div key={i} className={`flex-1 p-4 rounded-2xl border flex flex-col items-center gap-1 shadow-sm ${isEditing ? 'bg-surface-dark border-primary/20' : 'bg-surface-dark border-white/5'}`}>
            <span className="material-symbols-outlined text-primary text-xl mb-1">{stat.icon}</span>
            <p className="text-center font-black leading-tight text-sm">
              {stat.val} <span className="text-[10px] font-normal text-text-secondary">{stat.unit}</span>
            </p>
            <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Settings Section */}
      <div className="px-4 space-y-6">
        <div>
          <h4 className="text-lg font-bold mb-4 ml-2">Préférences Opérationnelles</h4>
          <div className="space-y-3">
            <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Rappels (12h00)</p>
                  <p className="text-[10px] text-text-secondary">Notification d'entraînement</p>
                </div>
              </div>
              <button 
                onClick={toggleNotification}
                className={`w-12 h-6 rounded-full relative p-1 transition-colors flex items-center ${user.notificationsEnabled ? 'bg-primary justify-end' : 'bg-white/10 justify-start'}`}
              >
                <div className="size-4 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>

            <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">campaign</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Guidage Audio IA</p>
                  <p className="text-[10px] text-text-secondary">Coach vocal par Gemini</p>
                </div>
              </div>
              <button 
                onClick={toggleAudio}
                className={`w-12 h-6 rounded-full relative p-1 transition-colors flex items-center ${user.guidageAudioEnabled ? 'bg-primary justify-end' : 'bg-white/10 justify-start'}`}
              >
                <div className="size-4 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="pt-4 pb-8 flex flex-col items-center">
            <button className="flex items-center gap-3 text-red-400 font-bold text-sm bg-red-400/10 px-6 py-3 rounded-2xl border border-red-400/20 w-full justify-center active:scale-[0.98]">
              <span className="material-symbols-outlined">logout</span>
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
