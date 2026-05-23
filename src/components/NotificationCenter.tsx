import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../store/notifications';
import { useSettings } from '../store/settings';
import { Bell, X, Check, Trash2, Box, Wifi, Volume2, Battery, Moon, Sun, Monitor, Shield, LogOut, Power, User } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { settings, setSettings } = useSettings();
  const { notifications, markAsRead, markAllAsRead, clearAll, clearNotification } = useNotifications();

  const toggleTheme = () => {
    setSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-transparent"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`absolute right-4 bottom-16 w-80 h-[500px] flex flex-col z-50 rounded-2xl shadow-2xl border backdrop-blur-xl overflow-hidden
              ${settings.theme === 'dark' ? 'bg-slate-900/80 border-white/10 text-white' : 'bg-white/80 border-slate-300 text-slate-900'}
            `}
          >
            {/* Quick Settings Section */}
            <div className={`p-4 grid grid-cols-4 gap-2 border-b shrink-0 ${settings.theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
              <button 
                onClick={() => {}} 
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${settings.theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                  <Wifi className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium opacity-80">Wi-Fi</span>
              </button>
              <button 
                onClick={() => {}} 
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${settings.theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-500 text-white flex items-center justify-center shadow-sm">
                   <Box className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium opacity-80">BT</span>
              </button>
              <button 
                onClick={toggleTheme}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${settings.theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${settings.theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-amber-400 text-white'}`}>
                  {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-medium opacity-80">{settings.theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
              <button 
                onClick={() => {}} 
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${settings.theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm">
                  <Power className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium opacity-80">Power</span>
              </button>
            </div>

            {/* Volume/Brightness Sliders */}
            <div className={`p-4 flex flex-col gap-4 border-b shrink-0 ${settings.theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 opacity-70" />
                <div className={`flex-1 h-1 rounded-full relative ${settings.theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
                  <div className="absolute inset-y-0 left-0 w-3/4 bg-blue-500 rounded-full" />
                  <div className="absolute top-1/2 left-[75%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md cursor-pointer border border-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 opacity-70" />
                <div className={`flex-1 h-1 rounded-full relative ${settings.theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
                  <div className="absolute inset-y-0 left-0 w-2/3 bg-orange-400 rounded-full" />
                  <div className="absolute top-1/2 left-[66%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md cursor-pointer border border-orange-400" />
                </div>
              </div>
            </div>

            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${settings.theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <button onClick={onClose} className={`p-1 rounded-full transition-colors ${settings.theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <Bell className="w-12 h-12 mb-3" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={notif.id}
                    className={`relative p-4 rounded-xl flex flex-col gap-1 transition-colors
                      ${!notif.read ? (settings.theme === 'dark' ? 'bg-white/10' : 'bg-slate-100/80') : (settings.theme === 'dark' ? 'bg-white/5 opacity-70' : 'bg-slate-50 opacity-70')}
                    `}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                  >
                    {!notif.read && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"></div>}
                    <div className="flex items-center gap-2 mb-1">
                      {notif.appId && <Box className="w-4 h-4 opacity-70" />}
                      <span className="text-xs font-medium opacity-80 flex-1 truncate">
                        {notif.appId || 'System'}
                      </span>
                      <span className="text-[10px] opacity-60">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearNotification(notif.id); }}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 -mr-2 -my-2 rounded-md ${settings.theme === 'dark' ? 'hover:bg-white/20' : 'hover:bg-black/10'}`}
                      >
                         <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="font-semibold text-sm leading-tight">{notif.title}</div>
                    <div className="text-xs opacity-80 leading-snug">{notif.message}</div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={`p-3 border-t flex justify-end gap-2 text-xs font-medium ${settings.theme === 'dark' ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                {notifications.some(n => !n.read) && (
                  <button onClick={markAllAsRead} className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${settings.theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}>
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button onClick={clearAll} className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors text-red-500 ${settings.theme === 'dark' ? 'hover:bg-red-500/20' : 'hover:bg-red-100'}`}>
                  <Trash2 className="w-3 h-3" /> Clear all
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
