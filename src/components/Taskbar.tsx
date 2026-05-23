import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Command, Wifi, Battery, Volume2, Bell, Power } from 'lucide-react';
import { AppConfig, WindowState } from '../types';
import { useSettings } from '../store/settings';
import { useNotifications } from '../store/notifications';

interface TaskbarProps {
  apps: AppConfig[];
  windows: WindowState[];
  onOpenApp: (appId: string) => void;
  onToggleMinimize: (windowId: string) => void;
  onToggleStart: () => void;
  isStartOpen: boolean;
  onToggleNotif: () => void;
  isNotifOpen: boolean;
  onToggleShutdown: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ 
  apps, windows, onOpenApp, onToggleMinimize, onToggleStart, isStartOpen, onToggleNotif, isNotifOpen, onToggleShutdown
}) => {
  const { settings } = useSettings();
  const { unreadCount } = useNotifications();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const int = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(int);
  }, []);

  const getAccentClass = (type: 'bg' | 'text' | 'indicator') => {
    switch (settings.accent) {
      case 'blue': return type === 'bg' ? 'bg-blue-500/40 text-blue-200' : type === 'indicator' ? 'bg-blue-400' : 'text-blue-500';
      case 'green': return type === 'bg' ? 'bg-green-500/40 text-green-200' : type === 'indicator' ? 'bg-green-400' : 'text-green-500';
      case 'red': return type === 'bg' ? 'bg-red-500/40 text-red-200' : type === 'indicator' ? 'bg-red-400' : 'text-red-500';
      case 'orange': return type === 'bg' ? 'bg-orange-500/40 text-orange-200' : type === 'indicator' ? 'bg-orange-400' : 'text-orange-500';
      default: return type === 'bg' ? 'bg-indigo-500/40 text-indigo-200' : type === 'indicator' ? 'bg-indigo-400' : 'text-indigo-500';
    }
  };

  return (
    <div className={`absolute bottom-0 left-0 w-full h-12 backdrop-blur-md border-t flex items-center justify-between px-2 z-50 transition-colors
      ${settings.theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-slate-200/80 border-slate-300'}
    `}>
      <div className="flex items-center gap-1 h-full py-1">
        <button 
          onClick={onToggleStart}
          className={`h-full aspect-square flex items-center justify-center rounded-lg transition-colors overflow-hidden
            ${isStartOpen ? 'bg-[#E95420]' : (settings.theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-slate-800')}
          `}
        >
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#E95420] to-[#C7161E] flex items-center justify-center text-white shadow-sm transition-transform ${isStartOpen ? 'scale-90' : 'hover:scale-105'}`}>
            <Command className="w-5 h-5" strokeWidth={3} />
          </div>
        </button>

        {/* Pinned Icons */}
        <div className={`w-px h-6 mx-1 ${settings.theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}></div>
        {apps.map(app => {
          const isOpen = windows.some(w => w.appId === app.id);
          const activeWindow = windows.find(w => w.appId === app.id && !w.isMinimized);
          return (
            <button
              key={app.id}
              onClick={() => {
                if (isOpen) {
                  // If it's open, toggle minimize on the first instance
                  const firstInstance = windows.find(w => w.appId === app.id);
                  if (firstInstance) {
                    onToggleMinimize(firstInstance.id);
                  }
                } else {
                  onOpenApp(app.id);
                }
              }}
              className={`relative h-full aspect-square flex items-center justify-center rounded-lg transition-colors p-2
                ${activeWindow ? (settings.theme === 'dark' ? 'bg-white/10' : 'bg-white/50 shadow-sm') : (settings.theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5')}
              `}
              title={app.name}
            >
              {app.icon}
              {isOpen && (
                <div className={`absolute bottom-0 w-3 h-1 rounded-t-full transition-all ${activeWindow ? getAccentClass('indicator') : 'bg-slate-400'}`}></div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 pr-2">
        {/* System Tray */}
        <button 
          onClick={onToggleNotif}
          className={`flex items-center gap-3 h-full px-3 rounded-lg cursor-pointer transition-colors
            ${isNotifOpen ? getAccentClass('bg') : (settings.theme === 'dark' ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-black/10')}
          `}
        >
          <Wifi className="w-4 h-4" />
          <Volume2 className="w-4 h-4" />
          <Battery className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button 
          onClick={onToggleNotif}
          className={`relative h-full flex items-center justify-center px-3 rounded-lg cursor-pointer transition-colors
            ${isNotifOpen ? getAccentClass('bg') : (settings.theme === 'dark' ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-black/10')}
          `}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <div className="absolute top-1/2 right-1 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </button>

        {/* Time */}
        <div className={`flex items-center h-full text-xs font-medium px-4 rounded-lg cursor-default select-none transition-colors
          ${settings.theme === 'dark' ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-black/10'}
        `}>
          <div className="flex flex-col items-end justify-center">
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{time.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Power */}
        <button 
          onClick={onToggleShutdown}
          className={`h-full flex items-center justify-center px-3 rounded-lg cursor-pointer transition-colors text-red-500 hover:bg-red-500/10`}
          title="Shutdown"
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
