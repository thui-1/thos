import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Square, Minimize2, Loader2 } from 'lucide-react';
import { AppConfig, WindowState } from '../types';
import { useSettings } from '../store/settings';

interface WindowProps {
  windowState: WindowState;
  app: AppConfig;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdateWindow: (id: string, updates: Partial<WindowState>) => void;
  onOpenApp: (appId: string, initialProps?: Record<string, any>) => void;
}

const ResizeHandle = ({ direction, onResizeStart }: { direction: string, onResizeStart: (e: React.PointerEvent, dir: string) => void }) => {
  const cursors: Record<string, string> = {
    n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
    ne: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize', sw: 'nesw-resize',
  };
  
  const positions: Record<string, string> = {
    n: 'top-0 left-2 right-2 h-2 -translate-y-1',
    s: 'bottom-0 left-2 right-2 h-2 translate-y-1',
    e: 'right-0 top-2 bottom-2 w-2 translate-x-1',
    w: 'left-0 top-2 bottom-2 w-2 -translate-x-1',
    ne: 'top-0 right-0 w-3 h-3 -translate-y-1 translate-x-1',
    nw: 'top-0 left-0 w-3 h-3 -translate-y-1 -translate-x-1',
    se: 'bottom-0 right-0 w-3 h-3 translate-y-1 translate-x-1',
    sw: 'bottom-0 left-0 w-3 h-3 translate-y-1 -translate-x-1',
  };

  return (
    <div 
      className={`absolute ${positions[direction]} z-50`} 
      style={{ cursor: cursors[direction] }}
      onPointerDown={(e) => onResizeStart(e, direction)}
    />
  );
};

export const WindowComponent: React.FC<WindowProps> = ({ 
  windowState, app, onClose, onMinimize, onMaximize, onFocus, onUpdateWindow, onOpenApp
}) => {
  const { settings } = useSettings();
  const [pos, setPos] = useState(windowState.position);
  const [size, setSize] = useState(windowState.size);
  const [isLoading, setIsLoading] = useState(true);
  const posRef = useRef(pos);
  const sizeRef = useRef(size);

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!windowState.isMaximized) {
      setPos(windowState.position);
      setSize(windowState.size);
      posRef.current = windowState.position;
      sizeRef.current = windowState.size;
    }
  }, [windowState.position, windowState.size, windowState.isMaximized]);

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    // Only drag on left click
    if (e.button !== 0) return;
    
    // Prevent default to avoid text selection artifacts
    // e.preventDefault(); // Sometimes prevents inputs inside if not careful, but title bar has no inputs
    
    if (windowState.isMaximized) return; // Cannot drag maximized
    onFocus(windowState.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = posRef.current.x;
    const startPosY = posRef.current.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const newPos = {
        x: startPosX + (moveEvent.clientX - startX),
        y: Math.max(0, startPosY + (moveEvent.clientY - startY)) // Prevent dragging above top edge
      };
      setPos(newPos);
      posRef.current = newPos;
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      onUpdateWindow(windowState.id, { position: posRef.current });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleResizeStart = (e: React.PointerEvent, dir: string) => {
    if (e.button !== 0 || windowState.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus(windowState.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = posRef.current.x;
    const startPosY = posRef.current.y;
    const startWidth = sizeRef.current.width;
    const startHeight = sizeRef.current.height;

    const MIN_W = 300;
    const MIN_H = 200;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      if (dir.includes('e')) newWidth = Math.max(MIN_W, startWidth + dx);
      if (dir.includes('s')) newHeight = Math.max(MIN_H, startHeight + dy);
      if (dir.includes('w')) {
        newWidth = Math.max(MIN_W, startWidth - dx);
        if (newWidth > MIN_W) newX = startPosX + dx;
      }
      if (dir.includes('n')) {
        newHeight = Math.max(MIN_H, startHeight - dy);
        if (newHeight > MIN_H) newY = Math.max(0, startPosY + dy);
      }

      const newSize = { width: newWidth, height: newHeight };
      const newPos = { x: newX, y: newY };
      
      setSize(newSize);
      setPos(newPos);
      sizeRef.current = newSize;
      posRef.current = newPos;
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      onUpdateWindow(windowState.id, { 
        position: posRef.current,
        size: sizeRef.current
      });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: pos.y + 20 }}
      animate={{ 
        opacity: windowState.isMinimized ? 0 : 1, 
        scale: windowState.isMinimized ? 0.9 : 1,
        width: windowState.isMaximized ? '100vw' : size.width,
        height: windowState.isMaximized ? 'calc(100vh - 48px)' : size.height,
        x: windowState.isMaximized ? 0 : pos.x,
        y: windowState.isMaximized ? 0 : (windowState.isMinimized ? pos.y + 40 : pos.y)
      }}
      exit={{ opacity: 0, scale: 0.95, y: pos.y + 20 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      onPointerDown={() => onFocus(windowState.id)}
      style={{ 
        zIndex: windowState.zIndex,
        pointerEvents: windowState.isMinimized ? 'none' : 'auto'
      }}
      className={`absolute flex flex-col backdrop-blur-xl border overflow-hidden transition-colors shadow-2xl
        ${windowState.isMaximized ? 'rounded-none' : `rounded-xl ${settings.theme === 'dark' ? 'drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]' : 'drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)]'}`}
        ${settings.theme === 'dark' ? 'bg-slate-900/80 border-white/10 text-white' : 'bg-white/80 border-slate-300 text-slate-900'}
      `}
    >
      {/* Resize Handles */}
      {!windowState.isMaximized && (
        <>
          <ResizeHandle direction="n" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="s" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="e" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="w" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="ne" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="nw" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="se" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="sw" onResizeStart={handleResizeStart} />
        </>
      )}

      {/* Title Bar */}
      <div 
        className={`flex flex-none items-center justify-between px-3 py-2 select-none transition-colors
          ${settings.theme === 'dark' ? 'bg-black/40 border-b border-white/5' : 'bg-slate-200/60 border-b border-slate-300'}
          ${windowState.isMaximized ? 'cursor-default' : 'cursor-move'}
        `} 
        onDoubleClick={() => onMaximize(windowState.id)}
        onPointerDown={handleTitlePointerDown}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-4 h-4">{app.icon}</div>
          <span className={`text-sm font-medium ${settings.theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{app.name}</span>
        </div>
        <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation() /* Prevent drag when clicking buttons */}>
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }}
            className={`p-1 rounded-full transition-colors ${settings.theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-black/10 text-slate-600 hover:text-black'}`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(windowState.id); }}
            className={`p-1 rounded-full transition-colors ${settings.theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-black/10 text-slate-600 hover:text-black'}`}
          >
            {windowState.isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }}
            className={`p-1 hover:bg-red-500/80 rounded-full transition-colors ${settings.theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-white'}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* App Content */}
      <div className="flex-1 overflow-hidden pointer-events-auto relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 ${settings.theme === 'dark' ? 'bg-slate-900/40' : 'bg-white/40'}`}
            >
              <div className="relative">
                <Loader2 className="w-8 h-8 text-[#E95420] animate-spin" />
                <div className="absolute inset-0 blur-sm opacity-50 text-[#E95420]">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <span className="text-xs font-medium tracking-wider uppercase opacity-60">Starting...</span>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-full" 
              onPointerDown={(e) => e.stopPropagation()}
            >
              {React.isValidElement(app.component) 
                ? React.cloneElement(app.component as React.ReactElement<any>, { 
                    windowId: windowState.id, 
                    onClose: () => onClose(windowState.id),
                    setIsLoading: setIsLoading,
                    onOpenApp: onOpenApp,
                    ...(windowState.initialProps || {})
                  }) 
                : app.component}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
