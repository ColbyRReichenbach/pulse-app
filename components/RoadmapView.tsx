
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PhaseType, WorkoutLog } from '../types';
import { PHASES, getWorkoutForDay } from '../constants';
import { Target, Lock, CheckCircle2, Calendar, X, ChevronRight } from 'lucide-react';

interface PhaseCalendarProps {
  phase: any;
  profile: UserProfile;
  onClose: () => void;
  onScroll: (minimized: boolean) => void;
}

const PhaseCalendar: React.FC<PhaseCalendarProps> = ({ phase, profile, onClose, onScroll }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const handleInternalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    onScroll(top > 30);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-400 flex flex-col">
      <div className="p-8 flex justify-between items-center border-b border-white/10 z-[210] glass">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter">{phase.name}</h2>
          <p className="text-[10px] uppercase font-black text-orange-500 tracking-[0.3em] mt-1">Operational Protocol</p>
        </div>
        <button 
          onClick={onClose} 
          className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center active:scale-90 transition-transform shadow-lg"
        >
          <X size={24} />
        </button>
      </div>
      
      <div 
        onScroll={handleInternalScroll}
        className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar animate-in slide-in-from-bottom-6 duration-600"
      >
        {days.map((day, idx) => {
          const sampleWorkout = getWorkoutForDay(phase.id, phase.weeks[0], day, profile);
          return (
            <div key={day} 
              style={{ animationDelay: `${idx * 50}ms` }}
              className="glass p-6 rounded-[34px] border-white/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
               <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                 <p className="text-6xl font-black">{day.charAt(0)}</p>
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">{day}</p>
                 </div>
                 <h4 className="text-xl font-black tracking-tight mb-4">{sampleWorkout.title}</h4>
                 <div className="flex flex-wrap gap-2">
                   {sampleWorkout.movements.slice(0, 3).map((m, i) => (
                     <span key={i} className="text-[10px] font-bold bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-white/60">
                       {m.name}
                     </span>
                   ))}
                 </div>
               </div>
            </div>
          );
        })}
        <div className="h-32"></div>
      </div>
    </div>
  );
};

interface RoadmapViewProps {
  currentWeek: number;
  profile: UserProfile;
  completedWorkouts: Record<string, WorkoutLog>;
  onSubViewScroll: (minimized: boolean) => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ currentWeek, profile, completedWorkouts, onSubViewScroll }) => {
  const [selectedPhase, setSelectedPhase] = useState<any | null>(null);

  return (
    <div className="space-y-4 pb-20">
      {PHASES.map((phase) => {
        const isCurrent = currentWeek >= phase.weeks[0] && currentWeek <= phase.weeks[1];
        const isPast = currentWeek > phase.weeks[1];
        const isFuture = currentWeek < phase.weeks[0];

        const totalPhaseDays = (phase.weeks[1] - phase.weeks[0] + 1) * 7;
        const completedPhaseDays = Object.values(completedWorkouts).filter(l => l.week >= phase.weeks[0] && l.week <= phase.weeks[1]).length;
        const completionPct = Math.min(100, Math.round((completedPhaseDays / totalPhaseDays) * 100));

        return (
          <div 
            key={phase.id} 
            onClick={() => setSelectedPhase(phase)}
            className={`glass p-6 rounded-[34px] border transition-all duration-300 relative overflow-hidden active:scale-[0.98] cursor-pointer group ${
              isCurrent ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                  isPast ? 'bg-green-500 text-white' : 
                  isCurrent ? 'bg-orange-500 text-white' : 
                  'bg-white/10 text-white/20'
                }`}>
                  {isPast ? <CheckCircle2 size={24} /> : phase.id}
                </div>
                <div>
                  <h3 className={`text-lg font-black tracking-tighter ${isFuture ? 'text-white/40' : 'text-white'}`}>
                    {phase.name}
                  </h3>
                  <p className="text-[10px] text-white/30 font-black tracking-[0.2em] uppercase">Weeks {phase.weeks[0]}-{phase.weeks[1]}</p>
                </div>
              </div>
              <Calendar size={18} className={`${isCurrent ? 'text-orange-500' : 'text-white/20'}`} />
            </div>

            {isCurrent && (
              <div className="mt-4 pt-6 border-t border-white/5 space-y-4 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Current Objective</span>
                  </div>
                  <span className="text-[10px] font-black text-white/40">{completionPct}% COMPLETE</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                   <div className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${completionPct}%` }}></div>
                </div>
                <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                  Open Master Calendar <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {selectedPhase && (
        <PhaseCalendar 
          phase={selectedPhase} 
          profile={profile} 
          onClose={() => {
            setSelectedPhase(null);
            onSubViewScroll(false);
          }} 
          onScroll={onSubViewScroll}
        />
      )}
    </div>
  );
};

export default RoadmapView;
