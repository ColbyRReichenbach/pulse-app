
import React from 'react';
import { LayoutDashboard, Compass, Sparkles, UserCircle2, ChevronUp } from 'lucide-react';

interface TabBarProps {
  activeTab: 'lab' | 'roadmap' | 'analytics' | 'settings';
  setActiveTab: (tab: 'lab' | 'roadmap' | 'analytics' | 'settings') => void;
  minimized: boolean;
  onToggle: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab, minimized, onToggle }) => {
  const tabs = [
    { id: 'lab', icon: <LayoutDashboard size={22} />, label: 'Lab' },
    { id: 'roadmap', icon: <Compass size={22} />, label: 'Plan' },
    { id: 'analytics', icon: <Sparkles size={22} />, label: 'Hub' },
    { id: 'settings', icon: <UserCircle2 size={22} />, label: 'Profile' },
  ] as const;

  const currentIcon = tabs.find(t => t.id === activeTab)?.icon;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[120] pointer-events-none flex justify-center pb-10">
      <div className="relative w-[90%] max-w-sm flex justify-center items-center h-20">
        
        {/* Full Tab Bar Navigation */}
        <nav 
          className={`absolute glass rounded-[40px] p-2 flex justify-between items-center apple-shadow pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] w-full border-white/10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] ${
            minimized ? 'opacity-0 scale-90 translate-y-12 blur-lg pointer-events-none' : 'opacity-100 scale-100 translate-y-0 blur-0'
          }`}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if ('vibrate' in navigator) navigator.vibrate(5);
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-center justify-center py-4 px-6 rounded-[32px] transition-all duration-300 relative ${
                  isActive ? 'text-white scale-105' : 'text-white/30 hover:text-white/50'
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 rounded-[32px] glow-active -z-10 shadow-lg ${tab.id === 'analytics' ? 'bg-indigo-500/20' : 'bg-white/10'}`}></div>
                )}
                <div className={`transition-transform duration-300 ${isActive ? 'translate-y-[-4px]' : ''} ${isActive && tab.id === 'analytics' ? 'text-indigo-400' : ''}`}>
                  {tab.icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-1 transition-all duration-300 absolute bottom-2 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${isActive && tab.id === 'analytics' ? 'text-indigo-400' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Minimized Floating Icon */}
        <div 
          className={`absolute bottom-0 right-0 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] pointer-events-auto ${
            minimized ? 'opacity-100 scale-100 translate-y-0 translate-x-0' : 'opacity-0 scale-0 translate-y-20 translate-x-20 pointer-events-none'
          }`}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className={`w-16 h-16 glass-dark rounded-full border flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.6)] active:scale-90 transition-all ${
              activeTab === 'analytics' ? 'border-indigo-500/50 text-indigo-400' : 'border-orange-500/50 text-orange-500'
            }`}
          >
            <div className="relative">
              {currentIcon}
              <div className={`absolute -top-6 -right-6 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center ${activeTab === 'analytics' ? 'bg-indigo-500 shadow-[0_0_12px_#5856D6]' : 'bg-orange-500 shadow-[0_0_12px_#FF9500]'}`}>
                 <ChevronUp size={14} className="text-white" />
              </div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default TabBar;
