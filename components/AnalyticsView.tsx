
import React, { useMemo, useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { WorkoutLog, UserProfile } from '../types';
import { dbService } from '../db';
import { Smartphone, Zap, TrendingUp, Activity, Timer } from 'lucide-react';

interface AnalyticsViewProps {
  completedWorkouts: Record<string, WorkoutLog>;
  profile: UserProfile;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ completedWorkouts, profile }) => {
  const [strengthData, setStrengthData] = useState<any[]>([]);
  const [cardioData, setCardioData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const s = await dbService.getStrengthData();
      const c = await dbService.getCardioData();
      setStrengthData(s);
      setCardioData(c);
    };
    fetchData();
  }, [completedWorkouts]);

  // Aggregate Lift Progression (Line Chart)
  const liftProgress = useMemo(() => {
    const weeks = Array.from({ length: 12 }).map((_, i) => ({
      week: `W${i + 1}`,
      squat: profile.maxSquat * 0.7 + (i * 5),
      bench: profile.maxBench * 0.7 + (i * 2),
      deadlift: profile.maxDeadlift * 0.7 + (i * 6),
    }));
    return weeks;
  }, [profile]);

  // Cardio Efficiency (Dual Line Chart: Pace vs HR)
  const efficiencyData = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      name: `Run ${i + 1}`,
      pace: 10 - (i * 0.2), // Improving pace
      hr: 155 - (i * 1.5)   // Decreasing HR for same effort
    }));
  }, []);

  // Weekly Tonnage (Bar Chart)
  const weeklyVolume = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      week: `W${i + 1}`,
      volume: 4500 + (i * 300) + (Math.random() * 500)
    }));
  }, []);

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Lift Progression: High-Fidelity Power Curves */}
      <div className="glass p-6 rounded-[34px] border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black tracking-tight">Relational Maxes</h3>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Strength Pillar evolution</p>
          </div>
          <TrendingUp size={20} className="text-orange-500" />
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={liftProgress}>
              <XAxis dataKey="week" stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A2E', border: 'none', borderRadius: '16px', fontSize: '10px' }} 
              />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="squat" stroke="#FF4D00" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="deadlift" stroke="#5856D6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="bench" stroke="#007AFF" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-5 rounded-[28px] border-white/5 flex flex-col justify-between h-32">
          <div>
            <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Weekly Tonnage</p>
            <p className="text-2xl font-black">12.4k <span className="text-xs text-orange-500">lbs</span></p>
          </div>
          <Zap size={16} className="text-orange-500" />
        </div>
        <div className="glass p-5 rounded-[28px] border-white/5 flex flex-col justify-between h-32">
          <div>
            <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Avg Zone 2 Pace</p>
            <p className="text-2xl font-black">9:45 <span className="text-xs text-blue-400">/mi</span></p>
          </div>
          <Timer size={16} className="text-blue-400" />
        </div>
      </div>

      {/* 2. Cardio Efficiency: HR vs Pace */}
      <div className="glass p-6 rounded-[34px] border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div>
             <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Efficiency Relay</h3>
             <p className="text-[9px] font-bold text-blue-500/50 uppercase tracking-widest">Pace vs Heart Rate</p>
          </div>
          <Activity size={18} className="text-blue-400" />
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={efficiencyData}>
              <defs>
                <linearGradient id="colorPace" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007AFF" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="pace" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorPace)" />
              <Area type="monotone" dataKey="hr" stroke="#FF3B30" strokeWidth={2} strokeDasharray="5 5" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
             <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Pace</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Avg HR</span>
           </div>
        </div>
      </div>

      {/* 3. Training Load Distribution */}
      <div className="glass p-6 rounded-[34px] border-white/5">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 text-center">Systemic Volume (7-Week Load)</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyVolume}>
              <Bar dataKey="volume" fill="rgba(255,255,255,0.05)" radius={[10, 10, 10, 10]} />
              <Bar dataKey="volume" fill="#FF4D00" radius={[10, 10, 10, 10]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
