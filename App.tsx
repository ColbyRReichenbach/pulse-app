
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { INITIAL_USER_PROFILE, getWorkoutForDay } from './constants';
import { UserProfile, PhaseType, UserProgress, WorkoutLog, WorkoutType } from './types';
import LabView from './components/LabView';
import RoadmapView from './components/RoadmapView';
import IntelligenceHub from './components/IntelligenceHub';
import SettingsView from './components/SettingsView';
import TabBar from './components/TabBar';
import WeeklyProgress from './components/WeeklyProgress';
import { dbService } from './db';
import { Trophy, Star, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('hpp_progress');
    return saved ? JSON.parse(saved) : { currentWeek: 1, completedWorkouts: {} };
  });

  const [activeTab, setActiveTab] = useState<'lab' | 'roadmap' | 'analytics' | 'settings'>('lab');
  const [viewDate, setViewDate] = useState(new Date());
  const [isNavMinimized, setIsNavMinimized] = useState(false);
  const [prEvent, setPrEvent] = useState<{ exercise: string, weight: number } | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const initDb = async () => {
      await dbService.init();
      const savedProfile = await dbService.getProfile();
      if (savedProfile) {
        setUser(savedProfile);
      }
      setLoading(false);
    };
    initDb();
  }, []);

  // Robust Scroll Listener for Main UI
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const top = e.currentTarget.scrollTop;
    if (top > 30 && !isNavMinimized) setIsNavMinimized(true);
    if (top <= 30 && isNavMinimized) setIsNavMinimized(false);
  };

  useEffect(() => {
    setIsNavMinimized(false);
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    if (!loading) {
      dbService.saveProfile(user);
    }
  }, [user, loading]);

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

  const phaseColorClass = useMemo(() => {
    switch (currentPhase) {
      case PhaseType.AEROBIC_BASE: return 'phase-aerobic';
      case PhaseType.STRENGTH_THRESHOLD: return 'phase-strength';
      case PhaseType.PEAK: return 'phase-peak';
      case PhaseType.WASHOUT: return 'phase-washout';
      default: return '';
    }
  }, [currentPhase]);

  const currentWorkout = useMemo(() => {
    return getWorkoutForDay(currentPhase, currentWeek, dayOfWeek, user);
  }, [currentPhase, currentWeek, dayOfWeek, user]);

  const detectPRs = (data: any) => {
    const prs: { exercise: string, weight: number }[] = [];
    if (data.strength) {
      data.strength.forEach((entry: any) => {
        const maxSetWeight = Math.max(...entry.sets.map((s: any) => s.weight));
        if (entry.exercise.toLowerCase().includes('squat') && maxSetWeight > user.maxSquat) {
          prs.push({ exercise: 'Squat', weight: maxSetWeight });
          setUser(prev => ({ ...prev, maxSquat: maxSetWeight }));
        }
        if (entry.exercise.toLowerCase().includes('deadlift') && maxSetWeight > user.maxDeadlift) {
          prs.push({ exercise: 'Deadlift', weight: maxSetWeight });
          setUser(prev => ({ ...prev, maxDeadlift: maxSetWeight }));
        }
        if (entry.exercise.toLowerCase().includes('bench') && maxSetWeight > user.maxBench) {
          prs.push({ exercise: 'Bench Press', weight: maxSetWeight });
          setUser(prev => ({ ...prev, maxBench: maxSetWeight }));
        }
      });
    }
    if (data.cardio && data.cardio.activity.toLowerCase().includes('1 mile') && data.cardio.durationSeconds < user.maxMileSeconds) {
       prs.push({ exercise: '1 Mile Run', weight: data.cardio.durationSeconds });
       setUser(prev => ({ ...prev, maxMileSeconds: data.cardio.durationSeconds }));
    }
    if (prs.length > 0) {
      setPrEvent(prs[0]);
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 200]);
      setTimeout(() => setPrEvent(null), 5000);
    }
  };

  const handleCompleteWorkout = async (performanceData?: any) => {
    const newLog: WorkoutLog = {
      week: currentWeek,
      day: dayOfWeek,
      date: dateKey,
      completed: true,
      performanceData: { ...performanceData, timestamp: new Date().toISOString() }
    };
    detectPRs(performanceData);
    await dbService.saveWorkout(newLog, currentPhase, currentWorkout.type, currentWorkout.title);
    setProgress(prev => ({
      ...prev,
      completedWorkouts: { ...prev.completedWorkouts, [dateKey]: newLog }
    }));
    if ('vibrate' in navigator) navigator.vibrate([10, 30, 10, 50]);
  };

  const isCompleted = !!progress.completedWorkouts[dateKey];

  if (loading) return null;

  return (
    <div className={`flex flex-col h-screen max-w-lg mx-auto relative overflow-hidden bg-black selection:bg-orange-500/30 transition-colors duration-1000 ${phaseColorClass}`}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[120%] h-[120%] opacity-20 mesh-bg blur-[100px]"></div>
      </div>

      {prEvent && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in zoom-in-95 duration-500 pointer-events-none">
          <div className="glass-dark p-12 rounded-[50px] text-center space-y-4 border-orange-500/50 apple-shadow shadow-[0_0_100px_rgba(255,149,0,0.3)] bg-black/80 backdrop-blur-3xl">
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
              <Star size={50} fill="white" className="text-white" />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">New Personal Record</h2>
              <h3 className="text-4xl font-black tracking-tighter mt-2">{prEvent.exercise}</h3>
              <p className="text-5xl font-black text-white mt-4">{prEvent.weight}</p>
            </div>
          </div>
        </div>
      )}
      
      <main 
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 pt-16 pb-40 hide-scrollbar z-10 relative scroll-smooth transition-transform duration-500"
      >
        <header className="mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_12px_#FF9500]"></span>
              <p className="font-black tracking-[0.2em] text-[10px] uppercase text-orange-500">{todayLabel}</p>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">
              {activeTab === 'lab' ? 'The Lab' : 
               activeTab === 'roadmap' ? 'Roadmap' : 
               activeTab === 'analytics' ? 'Insights' : 'Profile'}
            </h1>
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
              onSubViewScroll={(min) => setIsNavMinimized(min)}
            />
          )}

          {activeTab === 'analytics' && (
            <IntelligenceHub user={user} history={progress.completedWorkouts} />
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
        onToggle={() => {
          setIsNavMinimized(false);
          mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default App;
