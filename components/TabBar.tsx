
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
    <div className="fixed bottom-0 left-0 right-0 z-[150] pointer-events-none flex justify-center pb-12">
      <div className="relative w-[90%] max-w-sm flex justify-center items-center h-20">
        
        {/* Full Tab Bar Navigation */}
        <nav 
          className={`absolute glass rounded-[44px] p-2 flex justify-between items-center apple-shadow pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] w-full border-white/10 ${
            minimized ? 'opacity-0 scale-75 translate-y-16 blur-2xl pointer-events-none' : 'opacity-100 scale-100 translate-y-0 blur-0'
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
                className={`flex flex-col items-center justify-center py-4 px-6 rounded-[36px] transition-all duration-300 relative ${
                  isActive ? 'text-white scale-105' : 'text-white/30'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-[36px] bg-white/10 glow-active -z-10 shadow-lg"></div>
                )}
                <div className={`transition-transform duration-300 ${isActive ? 'translate-y-[-4px]' : ''}`}>
                  {tab.icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-1 transition-all duration-300 absolute bottom-2 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Minimized Floating FAB */}
        <div 
          className={`absolute bottom-0 right-0 transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] pointer-events-auto ${
            minimized ? 'opacity-100 scale-100 translate-y-0 translate-x-0' : 'opacity-0 scale-0 translate-y-20 translate-x-20 pointer-events-none'
          }`}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className="w-16 h-16 glass-dark rounded-full border border-orange-500/50 flex items-center justify-center shadow-2xl active:scale-90 transition-all text-orange-500"
          >
            <div className="relative">
              {currentIcon}
              <div className="absolute -top-6 -right-6 w-6 h-6 rounded-full bg-orange-500 border-2 border-black flex items-center justify-center shadow-[0_0_12px_#FF9500]">
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
