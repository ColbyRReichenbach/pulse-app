
import React from 'react';
import { LayoutDashboard, Compass, Sparkles, UserCircle2, ChevronUp } from 'lucide-react';

interface TabBarProps {
  activeTab: 'lab' | 'roadmap' | 'analytics' | 'settings';
  setActiveTab: (tab: 'lab' | 'roadmap' | 'analytics' | 'settings') => void;
  minimized: boolean;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab, minimized }) => {
  const tabs = [
    { id: 'lab', icon: <LayoutDashboard size={22} />, label: 'Lab' },
    { id: 'roadmap', icon: <Compass size={22} />, label: 'Plan' },
    { id: 'analytics', icon: <Sparkles size={22} />, label: 'Hub' },
    { id: 'settings', icon: <UserCircle2 size={22} />, label: 'Profile' },
  ] as const;

  if (minimized) {
    return (
      <div className="fixed bottom-8 right-6 z-50 animate-in fade-in zoom-in duration-300">
        <button 
          onClick={() => {
            const main = document.querySelector('main');
            if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`w-14 h-14 glass-dark rounded-full border flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all ${
            activeTab === 'analytics' ? 'border-indigo-500/30 text-indigo-400' : 'border-orange-500/30 text-orange-500'
          }`}
        >
          {tabs.find(t => t.id === activeTab)?.icon}
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${activeTab === 'analytics' ? 'bg-indigo-500' : 'bg-orange-500'}`}>
             <ChevronUp size={10} className="text-white" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass rounded-[34px] p-2 flex justify-between items-center z-50 apple-shadow animate-in slide-in-from-bottom-10 duration-500">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if ('vibrate' in navigator) navigator.vibrate(5);
              setActiveTab(tab.id);
            }}
            className={`flex flex-col items-center justify-center py-3 px-5 rounded-[26px] transition-all duration-300 relative ${
              isActive ? 'text-white scale-105' : 'text-white/30 hover:text-white/50'
            }`}
          >
            {isActive && (
              <div className={`absolute inset-0 rounded-[26px] glow-active -z-10 shadow-lg ${tab.id === 'analytics' ? 'bg-indigo-500/20' : 'bg-white/10'}`}></div>
            )}
            <div className={`transition-transform duration-300 ${isActive ? 'translate-y-[-2px]' : ''} ${isActive && tab.id === 'analytics' ? 'text-indigo-400' : ''}`}>
              {tab.icon}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-[0.1em] mt-1 transition-all duration-300 ${isActive ? 'opacity-100 max-h-4' : 'opacity-0 max-h-0'} ${isActive && tab.id === 'analytics' ? 'text-indigo-400' : ''}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default TabBar;
