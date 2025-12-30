
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { dbService } from '../db';
import { User, Shield, Bell, HelpCircle, ChevronRight, Calendar, Cloud, Database, HardDrive, RefreshCw, AlertCircle, FileDown, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, setUser }) => {
  const [syncing, setSyncing] = useState(false);
  
  const updateProfile = (key: keyof UserProfile, value: string | number) => {
    setUser(prev => ({ ...prev, [key]: value }));
  };

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

  const triggerCloudSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      if ('vibrate' in navigator) navigator.vibrate([10, 50, 10]);
    }, 2000);
  };

  const exportData = async () => {
    const sessions = await dbService.getAllSessions();
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Week,Phase,Type,Title\n"
      + sessions.map(s => `${s.id},${s.week},${s.phase},${s.type},${s.title}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hybrid_pro_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-32">
      {/* 1. Athlete Identity & Profile (Simplified) */}
      <section className="glass p-6 rounded-[34px] border-white/5">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-orange-500 flex items-center justify-center font-black text-2xl text-white">
              {user.name.charAt(0)}
           </div>
           <div>
              <h3 className="text-xl font-black text-white">{user.name}</h3>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Active Athlete</p>
           </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Full Name</label>
            <input 
              type="text" 
              value={user.name}
              onChange={(e) => updateProfile('name', e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

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
        </div>
      </section>

      {/* 2. Performance Manifest & Export */}
      <section className="glass p-6 rounded-[34px] border-white/5">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Data Manifest</h3>
        <div className="space-y-3">
          <button 
            onClick={exportData}
            className="w-full glass p-5 rounded-3xl flex items-center justify-between group active:scale-95 transition-all hover:bg-white/[0.08] border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="text-blue-500"><FileDown size={18} /></div>
              <span className="text-sm font-bold tracking-tight">Export 52-Week Summary</span>
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">CSV</span>
          </button>
        </div>
      </section>

      {/* 3. Program Calibration */}
      <section className="glass p-6 rounded-[34px] border-orange-500/20">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-orange-500" size={20} />
          <h3 className="text-sm font-black uppercase tracking-widest text-orange-500">Program Engine</h3>
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
           </div>
        </div>
      </section>

      {/* 4. Tech Settings (Minimized) */}
      <section className="glass p-5 rounded-[28px] border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <RefreshCw size={14} className="text-white/20" />
             <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Technical Sub-system</span>
           </div>
           <div className="flex gap-2">
              <button onClick={triggerCloudSync} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-blue-400 transition-colors">
                <Cloud size={14} />
              </button>
              <button className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/40 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
           </div>
        </div>
      </section>

      <div className="pt-8 text-center pb-12">
        <p className="text-[10px] text-white/10 uppercase tracking-[0.4em] font-black">HPP Hybrid Core v3.0.0</p>
        <p className="text-[8px] text-white/5 uppercase mt-1">Architecture: Local-First IndexedDB Relay</p>
      </div>
    </div>
  );
};

export default SettingsView;
