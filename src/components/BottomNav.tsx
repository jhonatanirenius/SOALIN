import React from 'react';
import { Home, BookOpen, Trophy, BarChart3, User } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenProfile
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Latihan', icon: BookOpen },
    { id: 'tryout', label: 'Tryout', icon: Trophy },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav 
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.3)]"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id || (item.id === 'profile' && currentView === 'auth');
        return (
          <button
            key={item.id}
            id={`btn-bottom-nav-${item.id}`}
            onClick={() => {
              if (item.id === 'profile') {
                onOpenProfile();
              } else {
                onNavigate(item.id);
              }
            }}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
              isActive 
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
