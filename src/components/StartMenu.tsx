import React, { useState } from 'react';
import { AppConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../store/settings';
import { Search, Power, AlertTriangle, X } from 'lucide-react';

interface StartMenuProps {
  isOpen: boolean;
  apps: AppConfig[];
  onOpenApp: (appId: string) => void;
  onToggleShutdown: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, apps, onOpenApp, onToggleShutdown }) => {
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');

  const getAccentClass = () => {
    switch (settings.accent) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'orange': return 'bg-orange-500';
      default: return 'bg-indigo-500';
    }
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Clear search on open/close
  React.useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`absolute top-0 left-0 w-full bottom-12 backdrop-blur-2xl z-40 flex flex-col transition-colors
            ${settings.theme === 'dark' ? 'bg-slate-900/95' : 'bg-slate-100/95'}
          `}
        >
          <div className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full gap-12 p-8 overflow-y-auto">
            <div className="w-full flex justify-between items-center px-4 self-start top-8 max-w-7xl mx-auto mb-8 shrink-0">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${settings.theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E95420] to-[#C7161E] flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/20">
                  <span className="text-sm">AD</span>
                </div>
                <div className="flex flex-col">
                  <div className={`text-base font-semibold leading-tight ${settings.theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Admin</div>
                  <div className={`text-[10px] font-medium opacity-60 uppercase tracking-wider ${settings.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>ubuntu system</div>
                </div>
              </div>
              
              <div className={`flex items-center w-64 md:w-96 px-4 py-2 rounded-full border transition-colors ${settings.theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white/50 border-slate-300 text-slate-800'} backdrop-blur-sm shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50`}>
                <Search className={`w-5 h-5 mr-3 ${settings.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                <input 
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none placeholder-slate-500"
                  autoFocus
                />
              </div>

              <button 
                onClick={onToggleShutdown}
                className={`p-3 rounded-full transition-all hover:scale-110 active:scale-95 ${settings.theme === 'dark' ? 'bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500' : 'bg-black/5 hover:bg-red-500/20 text-slate-500 hover:text-red-500'}`}
                title="Power Options"
              >
                <Power className="w-5 h-5" />
              </button>
            </div>
            
            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-x-8 gap-y-12 w-full justify-items-center mt-8 px-4">
                {filteredApps.map(app => (
                  <button 
                    key={app.id} 
                    onClick={() => {
                      onOpenApp(app.id);
                      setSearchQuery('');
                    }}
                    className={`flex flex-col items-center gap-4 p-4 w-28 rounded-2xl transition-all group
                      ${settings.theme === 'dark' ? 'hover:bg-white/10 text-slate-300 hover:text-white' : 'hover:bg-black/10 text-slate-700 hover:text-black'}
                    `}
                  >
                    <div className="w-16 h-16 group-hover:scale-110 transition-transform flex items-center justify-center drop-shadow-lg">
                      {React.cloneElement(app.icon as React.ReactElement, { className: 'w-full h-full' })}
                    </div>
                    <span className="text-sm font-medium truncate w-full text-center">{app.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center w-full h-64 mt-16 ${settings.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <Search className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">No apps found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

