
import React from 'react';
import { WorkoutLog } from '../types';

interface WeeklyProgressProps {
  viewDate: Date;
  setViewDate: (d: Date) => void;
  completedWorkouts: Record<string, WorkoutLog>;
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ viewDate, setViewDate, completedWorkouts }) => {
  const getDaysOfCurrentWeek = () => {
    const current = new Date(viewDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(current.setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDays = getDaysOfCurrentWeek();
  const todayKey = new Date().toISOString().split('T')[0];

  return (
    <div className="flex justify-between items-center mb-8 px-1">
      {weekDays.map((date) => {
        const key = date.toISOString().split('T')[0];
        const isCompleted = !!completedWorkouts[key];
        const isSelected = viewDate.toDateString() === date.toDateString();
        const isToday = todayKey === key;
        
        return (
          <button 
            key={key} 
            onClick={() => {
              if ('vibrate' in navigator) navigator.vibrate(5);
              setViewDate(date);
            }}
            className="flex flex-col items-center gap-2 group outline-none"
          >
            <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${isSelected ? 'text-orange-500' : 'text-white/20'}`}>
              {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
            </span>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
              isCompleted 
                ? 'bg-orange-500 border-transparent shadow-[0_0_15px_rgba(255,149,0,0.4)]' 
                : isSelected 
                  ? 'border-orange-500 bg-orange-500/10' 
                  : isToday
                    ? 'border-white/40 bg-white/5'
                    : 'border-white/5 bg-white/2 hover:border-white/20'
            }`}>
              {isCompleted ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <span className={`text-[10px] font-bold ${isSelected ? 'text-orange-500' : 'text-white/20'}`}>
                  {date.getDate()}
                </span>
              )}
            </div>
            {isToday && !isCompleted && !isSelected && (
              <div className="w-1 h-1 rounded-full bg-orange-500/50"></div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default WeeklyProgress;
