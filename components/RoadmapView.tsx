
import React, { useState } from 'react';
import { UserProfile, PhaseType, WorkoutLog } from '../types';
import { PHASES, getWorkoutForDay } from '../constants';
import { Target, Lock, CheckCircle2, Calendar, X, ChevronRight } from 'lucide-react';

interface RoadmapViewProps {
  currentWeek: number;
  profile: UserProfile;
  completedWorkouts: Record<string, WorkoutLog>;
}

const PhaseCalendar: React.FC<{ phase: any; profile: UserProfile; onClose: () => void }> = ({ phase, profile, onClose }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col">
      <div className="p-6 flex justify-between items-center border-b border-white/10">
        <div>
          <h2 className="text-xl font-black text-white">{phase.name}</h2>
          <p className="text-[10px] uppercase font-bold text-orange-500 tracking-widest">Master Blueprint</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
        {days.map((day) => {
          // Sample a workout from the middle of the phase to show progression
          const sampleWorkout = getWorkoutForDay(phase.id, phase.weeks[0], day, profile);
          return (
            <div key={day} className="glass p-5 rounded-[28px] border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <p className="text-4xl font-black">{day.charAt(0)}</p>
               </div>
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-1">{day}</p>
                 <h4 className="text-lg font-bold mb-2">{sampleWorkout.title}</h4>
                 <div className="flex flex-wrap gap-2">
                   {sampleWorkout.movements.slice(0, 3).map((m, i) => (
                     <span key={i} className="text-[9px] bg-white/5 px-2 py-1 rounded-lg border border-white/5 text-white/60">
                       {m.name}
                     </span>
                   ))}
                   {sampleWorkout.cardio && (
                      <span className="text-[9px] bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/10 text-blue-400">
                        {sampleWorkout.cardio.activity}
                      </span>
                   )}
                 </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RoadmapView: React.FC<RoadmapViewProps> = ({ currentWeek, profile, completedWorkouts }) => {
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
            className={`glass p-5 rounded-[28px] border transition-all relative overflow-hidden active:scale-[0.98] cursor-pointer ${
              isCurrent ? 'border-orange-500/40 bg-orange-500/5 shadow-[0_0_30px_rgba(255,149,0,0.05)]' : 'border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  isPast ? 'bg-green-500 text-white' : 
                  isCurrent ? 'bg-orange-500 text-white' : 
                  'bg-white/10 text-white/20'
                }`}>
                  {isPast ? <CheckCircle2 size={20} /> : phase.id}
                </div>
                <div>
                  <h3 className={`text-sm font-black tracking-tight ${isFuture ? 'text-white/40' : 'text-white'}`}>
                    {phase.name}
                  </h3>
                  <p className="text-[10px] text-white/30 font-bold tracking-widest uppercase">Weeks {phase.weeks[0]}-{phase.weeks[1]}</p>
                </div>
              </div>
              <Calendar size={16} className={`${isCurrent ? 'text-orange-500' : 'text-white/20'}`} />
            </div>

            {isCurrent && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Current Objective</span>
                  </div>
                  <span className="text-[10px] font-black text-white/40">{completionPct}% COMPLETE</span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed italic pr-8">"{phase.description}"</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${completionPct}%` }}></div>
                </div>
                <button className="w-full py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  View Full Layout <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {selectedPhase && (
        <PhaseCalendar phase={selectedPhase} profile={profile} onClose={() => setSelectedPhase(null)} />
      )}
      
      <div className="pt-8 text-center">
        <div className="inline-block p-1 rounded-full bg-white/5 border border-white/5">
          <div className="px-4 py-2 rounded-full bg-black/50 text-[9px] text-white/40 uppercase font-black tracking-[0.3em]">
            Program End: Cycle 52
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
