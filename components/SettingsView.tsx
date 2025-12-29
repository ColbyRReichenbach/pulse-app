
import React from 'react';
import { UserProfile } from '../types';
import { User, Shield, Bell, HelpCircle, ChevronRight, Calendar } from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, setUser }) => {
  const updateProfile = (key: keyof UserProfile, value: string | number) => {
    setUser(prev => ({ ...prev, [key]: value }));
  };

  // Logic to set current program week
  const handleWeekJump = (weekNum: string) => {
    const week = parseInt(weekNum) || 1;
    const daysOffset = (week - 1) * 7;
    const newStartDate = new Date();
    newStartDate.setDate(newStartDate.getDate() - daysOffset);
    updateProfile('startDate', newStartDate.toISOString());
  };

  const getCurrentWeekFromDate = () => {
    const start = new Date(user.startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Program Synchronization */}
      <section className="glass p-6 rounded-[34px] border-orange-500/20">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-orange-500" size={20} />
          <h3 className="text-sm font-black uppercase tracking-widest text-orange-500">Program Logic</h3>
        </div>
        <div className="space-y-4">
           <div className="flex flex-col gap-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Current Active Week</label>
             <div className="flex items-center gap-3">
               <input 
                  type="number" 
                  min="1"
                  max="52"
                  value={getCurrentWeekFromDate()}
                  onChange={(e) => handleWeekJump(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-black text-white focus:outline-none focus:border-orange-500 transition-colors"
               />
               <span className="text-xs font-black text-white/20 uppercase tracking-widest">Of 52</span>
             </div>
             <p className="text-[9px] text-white/30 italic mt-1 leading-relaxed">
               Changing this adjusts your "Start Date" to align the engine logic with your current progress.
             </p>
           </div>
        </div>
      </section>

      {/* 1RM Calibration */}
      <section className="glass p-6 rounded-[34px] border-white/5">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Biometric Baseline</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Squat', key: 'maxSquat', unit: 'lbs' },
            { label: 'Deadlift', key: 'maxDeadlift', unit: 'lbs' },
            { label: 'Bench', key: 'maxBench', unit: 'lbs' },
            { label: '1 Mile', key: 'maxMileSeconds', unit: 'sec' }
          ].map((item) => (
            <div key={item.key} className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/30 uppercase font-black mb-1">{item.label}</p>
              <div className="flex items-end gap-1">
                <input 
                  type="number" 
                  value={(user as any)[item.key]}
                  onChange={(e) => updateProfile(item.key as any, parseFloat(e.target.value) || 0)}
                  className="bg-transparent text-xl font-black w-full outline-none focus:text-orange-500 transition-colors"
                />
                <span className="text-[9px] font-bold text-white/20">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Menu Options */}
      <div className="space-y-3">
        {[
          { icon: <User size={18} />, label: 'Athlete Identity' },
          { icon: <Shield size={18} />, label: 'Privacy & Health Relay' },
          { icon: <Bell size={18} />, label: 'Push Directives' },
          { icon: <HelpCircle size={18} />, label: 'Support Manifest' }
        ].map((item, i) => (
          <div key={i} className="glass p-5 rounded-3xl flex items-center justify-between group cursor-pointer active:scale-95 transition-all hover:bg-white/[0.08] border-white/5">
            <div className="flex items-center gap-4">
              <div className="text-white/30 group-hover:text-orange-500 transition-all">{item.icon}</div>
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:translate-x-1 transition-transform" />
          </div>
        ))}
      </div>

      <div className="pt-8 text-center pb-12">
        <p className="text-[10px] text-white/10 uppercase tracking-[0.4em] font-black">HPP Core v2.4.0</p>
        <button className="mt-6 text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors">Terminate Session</button>
      </div>
    </div>
  );
};

export default SettingsView;
