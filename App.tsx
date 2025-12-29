
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { INITIAL_USER_PROFILE, getWorkoutForDay } from './constants';
import { UserProfile, PhaseType, UserProgress, WorkoutLog } from './types';
import LabView from './components/LabView';
import RoadmapView from './components/RoadmapView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import TabBar from './components/TabBar';
import WeeklyProgress from './components/WeeklyProgress';
import { dbService } from './db';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hpp_user');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('hpp_progress');
    return saved ? JSON.parse(saved) : { currentWeek: 1, completedWorkouts: {} };
  });

  const [activeTab, setActiveTab] = useState<'lab' | 'roadmap' | 'analytics' | 'settings'>('lab');
  const [viewDate, setViewDate] = useState(new Date());
  const [isNavMinimized, setIsNavMinimized] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dbService.init().catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return;
      const scrollTop = mainRef.current.scrollTop;
      setIsNavMinimized(scrollTop > 40);
    };
    const main = mainRef.current;
    if (main) main.addEventListener('scroll', handleScroll);
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('hpp_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hpp_progress', JSON.stringify(progress));
  }, [progress]);

  const todayLabel = useMemo(() => {
    return viewDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  }, [viewDate]);

  const dateKey = useMemo(() => viewDate.toISOString().split('T')[0], [viewDate]);
  const dayOfWeek = useMemo(() => viewDate.toLocaleDateString('en-US', { weekday: 'long' }), [viewDate]);

  const currentWeek = useMemo(() => {
    const start = new Date(user.startDate);
    const diffTime = viewDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(52, Math.floor(diffDays / 7) + 1));
  }, [user.startDate, viewDate]);

  const currentPhase = useMemo(() => {
    if (currentWeek >= 9 && currentWeek <= 20) return PhaseType.STRENGTH_THRESHOLD;
    if (currentWeek >= 21 && currentWeek <= 32) return PhaseType.PEAK;
    if (currentWeek >= 33 && currentWeek <= 36) return PhaseType.WASHOUT;
    if (currentWeek >= 37) return PhaseType.RECALIBRATION;
    return PhaseType.AEROBIC_BASE;
  }, [currentWeek]);

  const currentWorkout = useMemo(() => {
    return getWorkoutForDay(currentPhase, currentWeek, dayOfWeek, user);
  }, [currentPhase, currentWeek, dayOfWeek, user]);

  const handleCompleteWorkout = async (performanceData?: any) => {
    const newLog: WorkoutLog = {
      week: currentWeek,
      day: dayOfWeek,
      date: dateKey,
      completed: true,
      performanceData: {
        ...performanceData,
        timestamp: new Date().toISOString()
      }
    };

    // Save to Relational DB with dynamic context
    await dbService.saveWorkout(newLog, currentPhase, currentWorkout.type, currentWorkout.title);

    // Save to State for UI reactivity
    setProgress(prev => ({
      ...prev,
      completedWorkouts: { ...prev.completedWorkouts, [dateKey]: newLog }
    }));

    if ('vibrate' in navigator) navigator.vibrate([10, 30, 10, 50]);
  };

  const isCompleted = !!progress.completedWorkouts[dateKey];

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto relative overflow-hidden bg-black selection:bg-orange-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[120%] h-[120%] opacity-20 mesh-bg blur-[100px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[70%] bg-orange-600/5 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full"></div>
      </div>
      
      <main 
        ref={mainRef}
        className="flex-1 overflow-y-auto px-6 pt-16 pb-40 hide-scrollbar z-10 relative scroll-smooth"
      >
        <header className="mb-6 flex justify-between items-start">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_12px_#FF9500]"></span>
              <p className="text-orange-500 font-black tracking-[0.2em] text-[10px] uppercase">
                {todayLabel}
              </p>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white leading-none mt-2">
              {activeTab === 'lab' ? 'The Lab' : 
               activeTab === 'roadmap' ? 'Roadmap' : 
               activeTab === 'analytics' ? 'Pulse' : 'Profile'}
            </h1>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">
              Week {currentWeek} • Phase {currentPhase}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl border border-white/10 glass flex items-center justify-center overflow-hidden shrink-0 shadow-2xl active:scale-90 transition-transform cursor-pointer">
             <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-orange-500 flex items-center justify-center font-black text-sm text-white">
                {user.name.charAt(0)}
             </div>
          </div>
        </header>

        {activeTab === 'lab' && (
          <WeeklyProgress 
            viewDate={viewDate}
            setViewDate={setViewDate}
            completedWorkouts={progress.completedWorkouts}
          />
        )}

        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'lab' && (
            <LabView 
              workout={currentWorkout} 
              week={currentWeek} 
              phase={currentPhase} 
              user={user} 
              isCompleted={isCompleted}
              onComplete={handleCompleteWorkout}
            />
          )}
          
          {activeTab === 'roadmap' && (
            <RoadmapView 
              currentWeek={currentWeek} 
              profile={user} 
              completedWorkouts={progress.completedWorkouts}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView completedWorkouts={progress.completedWorkouts} profile={user} />
          )}

          {activeTab === 'settings' && (
            <SettingsView user={user} setUser={setUser} />
          )}
        </div>
      </main>

      <TabBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        minimized={isNavMinimized}
      />
    </div>
  );
};

export default App;
