import React, { useState, useEffect, useRef } from 'react';
import { APPS } from './config/apps';
import { WindowState } from './types';
import { WindowComponent } from './components/Window';
import { Taskbar } from './components/Taskbar';
import { StartMenu } from './components/StartMenu';
import { NotificationCenter } from './components/NotificationCenter';
import { BootScreen } from './components/BootScreen';
import { useSettings } from './store/settings';
import { useNotifications } from './store/notifications';
import { motion, AnimatePresence } from 'motion/react';
import { Power, RotateCw, LogOut, Moon, HardDrive } from 'lucide-react';

import { soundManager } from './lib/audio';

export default function App() {
  const { settings } = useSettings();
  const { addNotification } = useNotifications();
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [powerMenu, setPowerMenu] = useState<{ isOpen: boolean, type: 'shutdown' | 'restart' | 'logoff' | 'sleep' | 'hibernate' | null }>({ isOpen: false, type: null });
  const [isSleeping, setIsSleeping] = useState(false);
  const nextZIndexRef = useRef(10);

  const simulatePowerAction = (action: 'shutdown' | 'restart' | 'logoff' | 'sleep' | 'hibernate') => {
    setPowerMenu({ isOpen: false, type: null });
    
    if (action === 'sleep' || action === 'hibernate') {
      setIsSleeping(true);
      return;
    }

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'black';
    overlay.style.zIndex = '100000';
    overlay.style.transition = 'opacity 1s ease-in-out';
    overlay.style.opacity = '0';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'sans-serif';
    
    const text = document.createElement('div');
    text.style.marginTop = '20px';
    text.style.fontSize = '18px';
    text.style.letterSpacing = '0.05em';
    text.textContent = action === 'shutdown' ? 'Shutting down...' : action === 'restart' ? 'Restarting...' : 'Logging off...';
    
    overlay.appendChild(text);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      if (action === 'logoff') {
        setIsBooting(true);
        document.body.removeChild(overlay);
      } else {
        window.location.reload();
      }
    }, 2000);
  };
  
  const windowsRef = useRef(windows);
  const switcherState = useRef({ isOpen: false, index: 0 });
  const [taskSwitcher, setTaskSwitcher] = useState({ isOpen: false, index: 0 });

  useEffect(() => {
    windowsRef.current = windows;
  }, [windows]);

  useEffect(() => {
    if (!isBooting) {
      const timer = setTimeout(() => {
        addNotification('System Alert', 'Welcome to TH OS. All systems operational.', 'system');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isBooting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'OS') {
        setIsStartOpen(prev => !prev);
      }
      
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        const wins = [...windowsRef.current].sort((a, b) => b.zIndex - a.zIndex);
        if (wins.length === 0) return;
        
        let newIndex = switcherState.current.index;
        if (!switcherState.current.isOpen) {
          switcherState.current.isOpen = true;
          newIndex = wins.length > 1 ? (e.shiftKey ? wins.length - 1 : 1) : 0;
        } else {
          newIndex = e.shiftKey ? newIndex - 1 : newIndex + 1;
          if (newIndex >= wins.length) newIndex = 0;
          if (newIndex < 0) newIndex = wins.length - 1;
        }
        
        switcherState.current.index = newIndex;
        setTaskSwitcher({ isOpen: true, index: newIndex });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || e.key === 'Meta') {
        if (switcherState.current.isOpen) {
           const wins = [...windowsRef.current].sort((a, b) => b.zIndex - a.zIndex);
           const targetWin = wins[switcherState.current.index];
           
           switcherState.current.isOpen = false;
           switcherState.current.index = 0;
           setTaskSwitcher({ isOpen: false, index: 0 });
           
           if (targetWin) {
             setWindows(prev => {
               const win = prev.find(w => w.id === targetWin.id);
               if (!win) return prev;
               nextZIndexRef.current += 1;
               return prev.map(w => w.id === targetWin.id ? { ...w, zIndex: nextZIndexRef.current, isMinimized: false } : w);
             });
           }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleOpenApp = (appId: string, initialProps?: Record<string, any>) => {
    const app = APPS.find(a => a.id === appId);
    if (!app) return;

    setIsStartOpen(false);

    // offset to stack new windows properly
    const offset = (windows.length % 5) * 30;

    nextZIndexRef.current += 1;
    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      appId,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndexRef.current,
      position: { x: 100 + offset, y: 100 + offset },
      size: { width: app.defaultWidth, height: app.defaultHeight },
      initialProps
    };
    
    setWindows(prev => [...prev, newWindow]);
    soundManager.playOpen();
  };

  const handleClose = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    soundManager.playClose();
  };

  const handleMinimize = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        if (!w.isMinimized) soundManager.playMinimize();
        return { ...w, isMinimized: !w.isMinimized };
      }
      return w;
    }));
  };

  const handleMaximize = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        if (!w.isMaximized) soundManager.playMaximize();
        return { ...w, isMaximized: !w.isMaximized };
      }
      return w;
    }));
    handleFocus(id);
  };

  const handleFocus = (id: string) => {
    setWindows(prev => {
      const win = prev.find(w => w.id === id);
      if (!win) return prev;
      if (win.zIndex === nextZIndexRef.current && !win.isMinimized) return prev;
      
      nextZIndexRef.current += 1;
      return prev.map(w => w.id === id ? { ...w, zIndex: nextZIndexRef.current, isMinimized: false } : w);
    });
  };

  const handleUpdateWindow = (id: string, updates: Partial<WindowState>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const handleDesktopClick = () => {
    if (isStartOpen) setIsStartOpen(false);
    if (isNotifOpen) setIsNotifOpen(false);
  };

  const getBackgroundStyle = () => {
    if (settings.wallpaper && (settings.wallpaper.startsWith('http') || settings.wallpaper.startsWith('data:'))) {
      return { 
        backgroundImage: `url(${settings.wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else if (settings.wallpaper && settings.wallpaper.startsWith('linear-gradient')) {
      return { background: settings.wallpaper };
    }
    
    // Default gradient
    return {
      background: settings.theme === 'dark' 
      ? 'radial-gradient(circle at 15% 50%, rgba(40, 20, 80, 0.4) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(20, 40, 100, 0.4) 0%, transparent 50%), linear-gradient(to bottom, #020617, #0f172a)'
      : 'radial-gradient(circle at 15% 50%, rgba(200, 220, 255, 0.5) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(200, 240, 250, 0.5) 0%, transparent 50%), linear-gradient(to bottom, #f8fafc, #e2e8f0)'
    };
  };

  if (isBooting) {
    return <BootScreen onBootComplete={() => setIsBooting(false)} />;
  }

  return (
    <div 
      className={`w-screen h-screen overflow-hidden flex flex-col relative select-none transition-colors duration-500
        ${settings.theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}
      `} 
      style={getBackgroundStyle()} 
      onClick={handleDesktopClick}
    >
      {/* Desktop Area */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* Desktop Icons */}
        <div className="absolute top-4 left-4 flex flex-col gap-4">
          {APPS.map(app => (
            <button
              key={app.id}
              onDoubleClick={() => handleOpenApp(app.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg group w-20 transition-colors
                ${settings.theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'}
              `}
            >
              <div className="w-10 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center">
                {app.icon}
              </div>
              <span className={`text-xs font-medium truncate w-full text-center px-1
                ${settings.theme === 'dark' ? 'text-white shadow-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-slate-900 shadow-white drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'}
              `}>
                {app.name}
              </span>
            </button>
          ))}
        </div>

        {/* Windows */}
        <AnimatePresence>
          {windows.map(win => {
            const app = APPS.find(a => a.id === win.appId);
            if (!app) return null;
            return (
              <WindowComponent
                key={win.id}
                windowState={win}
                app={app}
                onClose={handleClose}
                onMinimize={handleMinimize}
                onMaximize={handleMaximize}
                onFocus={handleFocus}
                onUpdateWindow={handleUpdateWindow}
                onOpenApp={handleOpenApp}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Task Switcher UI */}
      <AnimatePresence>
        {taskSwitcher.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none"
          >
            <div className={`flex flex-wrap items-center justify-center gap-4 p-8 rounded-2xl shadow-2xl max-w-4xl
              ${settings.theme === 'dark' ? 'bg-slate-900/90 text-white border border-white/10' : 'bg-white/90 text-slate-900 border border-black/10'}
            `}>
              {windows.length > 0 && [...windows].sort((a, b) => b.zIndex - a.zIndex).map((win, i) => {
                const app = APPS.find(a => a.id === win.appId);
                if (!app) return null;
                const isSelected = i === taskSwitcher.index;
                return (
                  <div
                    key={win.id}
                    className={`flex flex-col items-center gap-4 p-6 rounded-xl transition-all w-36
                      ${isSelected 
                        ? (settings.theme === 'dark' ? 'bg-white/20 scale-105 shadow-lg' : 'bg-black/10 scale-105 shadow-lg') 
                        : 'opacity-60'}
                    `}
                  >
                    <div className="w-20 h-20 flex items-center justify-center drop-shadow-md">
                      {React.cloneElement(app.icon as React.ReactElement, { className: 'w-full h-full' })}
                    </div>
                    <span className="text-sm font-medium truncate w-full text-center">{app.name}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StartMenu 
        isOpen={isStartOpen} 
        apps={APPS} 
        onOpenApp={handleOpenApp} 
        onToggleShutdown={() => setPowerMenu({ isOpen: true, type: null })}
      />
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      
      <Taskbar
        apps={APPS}
        windows={windows}
        onOpenApp={handleOpenApp}
        onToggleMinimize={handleMinimize}
        onToggleStart={() => setIsStartOpen(!isStartOpen)}
        isStartOpen={isStartOpen}
        onToggleNotif={() => setIsNotifOpen(!isNotifOpen)}
        isNotifOpen={isNotifOpen}
        onToggleShutdown={() => setPowerMenu({ isOpen: true, type: null })}
      />

      {/* Sleep Overlay */}
      <AnimatePresence>
        {isSleeping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSleeping(false)}
            className="fixed inset-0 z-[100000] bg-black cursor-pointer flex items-center justify-center group"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-slate-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Click anywhere to wake up
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Power Options Menu */}
      <AnimatePresence>
        {powerMenu.isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPowerMenu({ isOpen: false, type: null })}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className={`${settings.theme === 'dark' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-800 border-slate-200'} p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Power Options</h3>
                  <p className="text-xs opacity-60">Select an action to perform</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => simulatePowerAction('shutdown')}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.theme === 'dark' ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                >
                  <Power className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold text-sm">Shutdown</div>
                    <div className="text-[10px] opacity-60">Close all apps and turn off the PC</div>
                  </div>
                </button>

                <button 
                  onClick={() => simulatePowerAction('restart')}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.theme === 'dark' ? 'hover:bg-orange-500/20 text-orange-400' : 'hover:bg-orange-50 text-orange-600'}`}
                >
                  <RotateCw className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold text-sm">Restart</div>
                    <div className="text-[10px] opacity-60">Close all apps and restart the PC</div>
                  </div>
                </button>

                <button 
                  onClick={() => simulatePowerAction('logoff')}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.theme === 'dark' ? 'hover:bg-blue-500/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}
                >
                  <LogOut className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold text-sm">Log off</div>
                    <div className="text-[10px] opacity-60">Close your session and go to login</div>
                  </div>
                </button>

                <div className="h-px bg-slate-700/50 my-1"></div>

                <button 
                  onClick={() => simulatePowerAction('sleep')}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.theme === 'dark' ? 'hover:bg-purple-500/20 text-purple-400' : 'hover:bg-purple-50 text-purple-600'}`}
                >
                  <Moon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold text-sm">Sleep</div>
                    <div className="text-[10px] opacity-60">PC stays on but uses low power</div>
                  </div>
                </button>

                <button 
                  onClick={() => simulatePowerAction('hibernate')}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.theme === 'dark' ? 'hover:bg-indigo-500/20 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'}`}
                >
                  <HardDrive className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold text-sm">Hibernate</div>
                    <div className="text-[10px] opacity-60">Save state and turn off power</div>
                  </div>
                </button>
              </div>

              <button 
                onClick={() => setPowerMenu({ isOpen: false, type: null })}
                className={`mt-4 w-full py-2.5 rounded-xl font-semibold transition-colors ${settings.theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
