
import React, { useState, useEffect } from 'react';
import { WorkoutSession, UserProfile, PhaseType, WorkoutType, StrengthEntry, MetConEntry, SetEntry } from '../types';
import { Dumbbell, Heart, CheckCircle2, PlayCircle, Watch, Trophy, Activity, Timer, ArrowRight, Hash, Ruler, ClipboardList, Sparkles } from 'lucide-react';

interface LabViewProps {
  workout: WorkoutSession;
  week: number;
  phase: PhaseType;
  user: UserProfile;
  isCompleted: boolean;
  onComplete: (data?: any) => void;
}

const LabView: React.FC<LabViewProps> = ({ workout, week, phase, user, isCompleted, onComplete }) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [strengthEntries, setStrengthEntries] = useState<StrengthEntry[]>([]);
  const [metconData, setMetconData] = useState<MetConEntry>({ format: '', rounds: 0, reps: 0 });
  const [manualDistance, setManualDistance] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [watchData, setWatchData] = useState<any | null>(null);
  const [yogaDone, setYogaDone] = useState(false);

  useEffect(() => {
    const initial = workout.movements.map(m => {
      const isSkill = !!m.isSkill;
      const repsParts = m.reps?.split('x') || ["1", "8"];
      const setsCount = isSkill ? 1 : (phase === PhaseType.PEAK && workout.title.includes("Max Effort") ? 5 : parseInt(repsParts[0] || "3"));
      
      const workSets: SetEntry[] = Array.from({ length: setsCount }).map(() => ({
        weight: parseInt(m.prescribed?.replace(/\D/g, '') || "0"),
        reps: parseInt(repsParts[1] || (m.reps?.includes('EMOM') ? "1" : "8")),
        completed: false
      }));

      // Smart Warm-up Generator
      const warmups: SetEntry[] = (m.warmups || []).map(w => ({
        weight: parseInt(w.weight),
        reps: parseInt(w.reps),
        completed: false,
        isWarmup: true
      }));

      return {
        exercise: m.name,
        isSkill: isSkill,
        sets: [...warmups, ...workSets]
      };
    });
    setStrengthEntries(initial);
    setMetconData({ format: workout.cardio?.activity?.includes('AMRAP') ? 'AMRAP' : (workout.cardio?.activity?.includes('RFT') ? 'RFT' : 'Session'), rounds: 0, reps: 0 });
    setSessionActive(false);
    setWatchData(null);
    setManualDistance('');
    setYogaDone(false);
  }, [workout, phase]);

  const toggleSet = (mIdx: number, sIdx: number) => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    const updated = [...strengthEntries];
    if (updated[mIdx]) {
      updated[mIdx].sets[sIdx].completed = !updated[mIdx].sets[sIdx].completed;
      setStrengthEntries(updated);
    }
  };

  const updateWeight = (mIdx: number, sIdx: number, val: string) => {
    const updated = [...strengthEntries];
    if (updated[mIdx]) {
      updated[mIdx].sets[sIdx].weight = parseInt(val) || 0;
      setStrengthEntries(updated);
    }
  };

  const simulateWatchSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setWatchData({ 
        avgHr: Math.floor(Math.random() * (155 - 145) + 145), 
        peakHr: 178, 
        duration: workout.cardio?.durationMinutes || 30,
        source: 'Apple Watch Series 9'
      });
      if ('vibrate' in navigator) navigator.vibrate([20, 100, 20]);
    }, 1800);
  };

  const isRelationalComplete = () => {
    if (workout.type === WorkoutType.RECOVERY) return yogaDone;
    const strengthComplete = strengthEntries.every(e => e.sets.every(s => s.completed));
    if (workout.type === WorkoutType.METCON || (workout.cardio && (workout.cardio.activity.includes('AMRAP') || workout.cardio.activity.includes('RFT')))) {
       return strengthComplete && (metconData.rounds > 0 || metconData.reps > 0);
    }
    if (workout.type === WorkoutType.ENDURANCE) {
       return (!!watchData || manualDistance !== '');
    }
    return strengthComplete;
  };

  const handleCommit = () => {
    const performanceData = {
      strength: strengthEntries,
      cardio: watchData ? {
        ...watchData,
        distanceMeters: manualDistance ? parseFloat(manualDistance) * 1609.34 : undefined,
        durationSeconds: watchData.duration * 60,
        activity: workout.cardio?.activity || 'Unknown'
      } : (manualDistance ? {
        activity: workout.cardio?.activity || 'Manual Entry',
        distanceMeters: parseFloat(manualDistance) * 1609.34,
        durationSeconds: (workout.cardio?.durationMinutes || 0) * 60
      } : undefined),
      metcon: (workout.type === WorkoutType.METCON || (workout.cardio && (workout.cardio.activity.includes('AMRAP') || workout.cardio.activity.includes('RFT')))) ? metconData : undefined,
      yogaDone,
      syncedFromWatch: !!watchData
    };
    onComplete(performanceData);
  };

  if (isCompleted) {
    return (
      <div className="glass p-12 rounded-[44px] flex flex-col items-center text-center space-y-6 apple-shadow border-green-500/20 bg-green-500/[0.02] animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
          <Trophy size={56} className="text-green-500 animate-bounce" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Session Archived</h2>
          <p className="text-white/40 text-sm mt-2 font-medium">Synced with Local Health Storage</p>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
        </div>
        <div className="pt-4 flex gap-8">
           <div className="text-center">
             <p className="text-xl font-black">{week}</p>
             <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Week</p>
           </div>
           <div className="w-px h-8 bg-white/10"></div>
           <div className="text-center">
             <p className="text-xl font-black text-orange-500">+{strengthEntries.length * 3 + 15}</p>
             <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Hybrid XP</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Target Insights */}
      {sessionActive && (workout.cardio?.pace || workout.cardio?.targetHr) && (
        <div className="glass p-5 rounded-[30px] border-blue-500/20 bg-blue-500/5 flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <Timer size={18} className="text-blue-400" />
            <div>
              <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Target Split/Intensity</p>
              <p className="text-sm font-bold text-white">{workout.cardio.pace || workout.cardio.targetHr}</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-blue-500/40" />
        </div>
      )}

      <div className="glass-dark p-8 rounded-[44px] apple-shadow relative overflow-hidden border border-white/5 transition-all duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 opacity-50"></div>
        
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-black tracking-tighter leading-none">{workout.title}</h2>
            <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/40">
              {workout.type}
            </div>
          </div>
          <p className="text-white/40 text-xs mt-3 font-medium leading-relaxed">{workout.description}</p>
        </div>

        {!sessionActive ? (
          <div className="py-14 text-center space-y-6">
             <button 
                onClick={() => setSessionActive(true)}
                className="w-24 h-24 bg-orange-500 rounded-[34px] flex items-center justify-center shadow-[0_20px_40px_rgba(255,149,0,0.3)] hover:scale-105 active:scale-95 transition-all group mx-auto"
             >
                <PlayCircle size={44} fill="white" className="text-orange-500 ml-1 group-hover:scale-110 transition-transform" />
             </button>
             <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Initialize Session</p>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Connect iPhone 17 Sensors</p>
             </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {workout.type === WorkoutType.RECOVERY ? (
              <div 
                onClick={() => setYogaDone(!yogaDone)}
                className={`p-10 text-center border rounded-[34px] transition-all cursor-pointer ${
                  yogaDone ? 'bg-orange-500/20 border-orange-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 transition-all ${
                  yogaDone ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/30'
                }`}>
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-lg font-black mb-2">{yogaDone ? 'Recovery Completed' : 'Session in Progress'}</h4>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Focus on Parasympathetic Shift</p>
              </div>
            ) : (
              <div className="space-y-6">
                {strengthEntries.map((entry, mIdx) => (
                  <div key={mIdx} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Movement {mIdx + 1}</p>
                        <h4 className="text-base font-black flex items-center gap-2">
                          <Dumbbell size={16} className="text-orange-500" /> {entry.exercise}
                        </h4>
                      </div>
                      <span className="text-[10px] font-black text-orange-500/50 uppercase tracking-widest bg-orange-500/5 px-2 py-1 rounded-lg">
                        {workout.movements[mIdx]?.reps}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {entry.sets.map((set, sIdx) => (
                        <div key={sIdx} className="flex gap-3 items-center group">
                          {entry.isSkill ? (
                             <button 
                              onClick={() => toggleSet(mIdx, sIdx)}
                              className={`flex-1 glass rounded-2xl px-6 py-5 flex items-center justify-between transition-all active:scale-[0.98] ${
                                set.completed ? 'bg-orange-500 border-transparent text-white' : 'bg-white/[0.03] border-white/5 text-white/60'
                              }`}
                             >
                               <div className="flex flex-col items-start">
                                 <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Skill Set</span>
                                 <span className="text-sm font-black uppercase tracking-widest">Commit Movement</span>
                               </div>
                               <CheckCircle2 size={20} className={set.completed ? 'text-white' : 'text-white/10'} />
                             </button>
                          ) : (
                            <>
                              <div className={`flex-1 glass bg-white/[0.03] rounded-2xl px-5 py-3.5 flex items-center justify-between border-white/5 focus-within:border-orange-500/40 transition-all ${set.isWarmup ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                                      {set.isWarmup ? 'Warmup' : `Set ${sIdx + 1 - (entry.sets.filter(s => s.isWarmup).length)}`}
                                    </span>
                                    {set.isWarmup && <Sparkles size={10} className="text-blue-400" />}
                                  </div>
                                  <input 
                                    type="number" 
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    value={set.weight}
                                    onChange={(e) => updateWeight(mIdx, sIdx, e.target.value)}
                                    className="bg-transparent text-xl font-black w-24 outline-none text-white focus:text-orange-500"
                                  />
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                     <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Reps</p>
                                     <p className="text-xs font-black">{set.reps}</p>
                                  </div>
                                  <span className="text-[10px] font-black text-white/20 uppercase">LBS</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => toggleSet(mIdx, sIdx)}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                                  set.completed ? 'bg-orange-500 text-white shadow-xl scale-105' : 'bg-white/5 text-white/10 border border-white/10'
                                }`}
                              >
                                <CheckCircle2 size={24} />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(workout.type === WorkoutType.METCON || (workout.cardio && (workout.cardio.activity.includes('AMRAP') || workout.cardio.activity.includes('RFT')))) && (
               <div className="mt-8 glass p-6 rounded-[34px] border-orange-500/20 bg-orange-500/[0.03] space-y-6">
                 <div className="flex items-center gap-3">
                   <ClipboardList size={20} className="text-orange-500" />
                   <span className="text-[11px] font-black uppercase text-orange-500 tracking-widest">MetCon Performance</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Rounds</label>
                     <input 
                        type="number" 
                        value={metconData.rounds || ''} 
                        onChange={(e) => setMetconData({...metconData, rounds: parseInt(e.target.value) || 0})}
                        placeholder="0"
                        className="w-full glass bg-black/40 rounded-2xl px-5 py-4 text-2xl font-black text-white outline-none focus:border-orange-500/50 transition-all"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Add. Reps</label>
                     <input 
                        type="number" 
                        value={metconData.reps || ''} 
                        onChange={(e) => setMetconData({...metconData, reps: parseInt(e.target.value) || 0})}
                        placeholder="0"
                        className="w-full glass bg-black/40 rounded-2xl px-5 py-4 text-2xl font-black text-white outline-none focus:border-orange-500/50 transition-all"
                     />
                   </div>
                 </div>
               </div>
            )}

            {workout.cardio && (
              <div className="mt-8 glass p-6 rounded-[34px] border-blue-500/20 bg-blue-500/[0.03] animate-in slide-in-from-bottom-4 space-y-6">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                        <Watch size={20} />
                     </div>
                     <span className="text-[11px] font-black uppercase text-blue-400 tracking-widest">Health Relay</span>
                   </div>
                   {watchData ? (
                     <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                       Synced
                     </div>
                   ) : (
                     <button 
                      onClick={simulateWatchSync} 
                      disabled={syncing} 
                      className="text-[10px] font-black uppercase text-white/30 border border-white/10 rounded-full px-4 py-2 hover:bg-white/5 transition-all"
                     >
                       {syncing ? 'Connecting...' : 'Fetch Cardio'}
                     </button>
                   )}
                </div>
                
                <div>
                  <h4 className="text-xl font-black tracking-tight mb-2">{workout.cardio.activity}</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{workout.cardio.notes}</p>
                </div>

                {!(workout.cardio.activity.includes('AMRAP') || workout.cardio.activity.includes('RFT')) && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Manual Distance Override</label>
                      <Ruler size={14} className="text-white/20" />
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01"
                        value={manualDistance} 
                        onChange={(e) => setManualDistance(e.target.value)}
                        placeholder="Enter miles..."
                        className="w-full glass bg-black/40 rounded-2xl px-5 py-4 text-xl font-black text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase tracking-widest">MILES</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">Target Time</p>
                      <p className="text-xl font-black">{watchData?.duration || workout.cardio.durationMinutes} <span className="text-[10px] font-bold text-white/20">MIN</span></p>
                   </div>
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">Avg Pulse</p>
                      <p className="text-xl font-black text-blue-400">{watchData?.avgHr || '--'} <span className="text-[10px] font-bold text-white/20">BPM</span></p>
                   </div>
                </div>
              </div>
            )}

            <button 
              onClick={handleCommit}
              disabled={!isRelationalComplete()}
              className={`w-full py-6 text-sm font-black rounded-3xl apple-shadow uppercase tracking-[0.3em] transition-all active:scale-95 ${
                isRelationalComplete() 
                  ? 'bg-white text-black hover:scale-[1.01]' 
                  : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
              }`}
            >
              Commit to Storage
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabView;
