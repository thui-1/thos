import React, { useState } from 'react';
import { TerminalSquare, FileText, Globe, Calculator as CalcIcon, Folder, File, HardDrive, Image as ImageIcon, ChevronUp, Trash2, RotateCcw, AlertTriangle, Settings as SettingsIcon, Search, Bold, Italic, Underline, Clock, Timer, StopCircle, Play, Pause, RotateCcw as ResetIcon } from 'lucide-react';
import { AppConfig } from '../types';
import { SettingsApp } from '../components/SettingsApp';

const ClockApp = () => {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'clock' | 'stopwatch'>('clock');
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white select-none">
      <div className="flex bg-slate-800 p-1 gap-1">
        <button 
          onClick={() => setActiveTab('clock')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${activeTab === 'clock' ? 'bg-slate-700 shadow-inner text-blue-400' : 'hover:bg-slate-700/50 text-slate-400'}`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Clock</span>
        </button>
        <button 
          onClick={() => setActiveTab('stopwatch')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${activeTab === 'stopwatch' ? 'bg-slate-700 shadow-inner text-blue-400' : 'hover:bg-slate-700/50 text-slate-400'}`}
        >
          <Timer className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Stopwatch</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {activeTab === 'clock' ? (
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-48 h-48 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm shadow-2xl">
              {/* Analog Clock Marks */}
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-1 h-3 bg-slate-600" 
                  style={{ transform: `rotate(${i * 30}deg) translateY(-88px)` }}
                />
              ))}
              {/* Hands */}
              <div 
                className="absolute w-1 h-16 bg-slate-400 rounded-full origin-bottom"
                style={{ transform: `rotate(${time.getHours() * 30 + time.getMinutes() * 0.5}deg) translateY(-32px)` }}
              />
              <div 
                className="absolute w-1.5 h-20 bg-blue-500 rounded-full origin-bottom"
                style={{ transform: `rotate(${time.getMinutes() * 6}deg) translateY(-40px)` }}
              />
              <div 
                className="absolute w-0.5 h-24 bg-red-500 rounded-full origin-bottom"
                style={{ transform: `rotate(${time.getSeconds() * 6}deg) translateY(-48px)` }}
              />
              <div className="w-3 h-3 rounded-full bg-white z-10 shadow-lg" />
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-mono tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]">
                {formatTime(time)}
              </div>
              <div className="text-slate-500 font-medium mt-2 uppercase tracking-widest text-[10px]">
                {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12">
            <div className="text-7xl font-mono tracking-tighter text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]">
              {formatStopwatch(stopwatchTime)}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${isRunning ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
              >
                {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <button 
                onClick={() => { setStopwatchTime(0); setIsRunning(false); }}
                className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition-all shadow-lg active:scale-95"
              >
                <ResetIcon className="w-8 h-8" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: string[];
  parent?: string;
  originalParent?: string;
  content?: string;
}

let globalFileSystem: Record<string, FileNode> = {
  'root': { id: 'root', name: 'Root', type: 'folder', children: ['docs', 'pics', 'sys'] },
  'docs': { id: 'docs', name: 'Documents', type: 'folder', children: ['readme'], parent: 'root' },
  'pics': { id: 'pics', name: 'Pictures', type: 'folder', children: ['photo1', 'photo2'], parent: 'root' },
  'sys': { id: 'sys', name: 'System', type: 'folder', children: [], parent: 'root' },
  'trash': { id: 'trash', name: 'Trash', type: 'folder', children: [] },
  'readme': { id: 'readme', name: 'welcome.txt', type: 'file', parent: 'docs', content: 'Welcome to TH OS!\n\nThis is a simulated operating system built with React and Tailwind CSS.\n\nYou can explore the files, open apps, and even use the terminal.' },
  'photo1': { id: 'photo1', name: 'wallpaper.png', type: 'file', parent: 'pics' },
  'photo2': { id: 'photo2', name: 'profile.jpg', type: 'file', parent: 'pics' },
};

const FS_UPDATE_EVENT = 'fs_update';
const triggerFsUpdate = (newFs: Record<string, FileNode>) => {
  globalFileSystem = newFs;
  window.dispatchEvent(new CustomEvent(FS_UPDATE_EVENT, { detail: newFs }));
};

const UbuntuFolderIcon = ({ isSelected, className }: { isSelected?: boolean, className?: string }) => {
  return (
    <Folder 
      className={`${className || 'w-full h-full'} transition-colors ${isSelected ? 'text-[#E95420]' : 'text-[#f1b44c]'}`} 
      fill="currentColor" 
      strokeWidth={1.5}
    />
  );
};

const FileExplorerApp = ({ initialFolderId = 'root', onOpenApp }: { initialFolderId?: string, onOpenApp?: (appId: string, props?: any) => void }) => {
  const [fs, setFs] = useState(globalFileSystem);
  const [currentFolderId, setCurrentFolderId] = useState(initialFolderId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, fileId: string | null }>({ visible: false, x: 0, y: 0, fileId: null });
  const [clipboard, setClipboard] = useState<{ id: string, action: 'copy' } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleMove = (draggedId: string, targetParentId: string) => {
    if (!draggedId || !targetParentId || draggedId === targetParentId) return;
    const item = fs[draggedId];
    if (!item || item.parent === targetParentId) return;

    // Prevent moving into itself or its own children
    let currParentId: string | undefined = targetParentId;
    while (currParentId) {
      if (currParentId === draggedId) return;
      currParentId = fs[currParentId]?.parent;
    }

    const newFs = { ...fs };
    const oldParentId = item.parent;

    // Special case for trash
    if (targetParentId === 'trash') {
      handleDelete(draggedId);
      return;
    }

    // Remove from old parent
    if (oldParentId && newFs[oldParentId]) {
      newFs[oldParentId] = {
        ...newFs[oldParentId],
        children: (newFs[oldParentId].children || []).filter(id => id !== draggedId)
      };
    }

    // Add to new parent
    if (newFs[targetParentId]) {
      newFs[targetParentId] = {
        ...newFs[targetParentId],
        children: [...(newFs[targetParentId].children || []), draggedId]
      };
    }

    // Update item's parent
    newFs[draggedId] = {
      ...item,
      parent: targetParentId,
      originalParent: undefined // Clear original parent if moving out of trash manually
    };

    updateFs(newFs);
  };

  React.useEffect(() => {
    const handleFsUpdate = (e: Event) => {
      setFs((e as CustomEvent).detail);
    };
    window.addEventListener(FS_UPDATE_EVENT, handleFsUpdate);
    return () => window.removeEventListener(FS_UPDATE_EVENT, handleFsUpdate);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, fileId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    
    let x = e.clientX;
    let y = e.clientY;
    const menuWidth = 160;
    const menuHeight = 200;
    
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight;

    setContextMenu({ visible: true, x, y, fileId });
    if (fileId && !isRenaming) {
      setSelectedId(fileId);
    }
  };

  const handleCopy = () => {
    if (contextMenu.fileId) {
      setClipboard({ id: contextMenu.fileId, action: 'copy' });
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handlePaste = () => {
    if (!clipboard || !fs[clipboard.id] || currentFolderId === 'trash') return;
    const sourceNode = fs[clipboard.id];
    setContextMenu(prev => ({ ...prev, visible: false }));

    const newFs = { ...fs };
    
    const copyNode = (nodeId: string, parentId: string, nameSuffix: string = ''): string => {
      const node = newFs[nodeId];
      if (!node) return '';
      const newId = `${node.type}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const newNode: FileNode = { ...node, id: newId, parent: parentId, name: node.name + nameSuffix };
      newFs[newId] = newNode;
      
      if (node.type === 'folder' && node.children) {
        newNode.children = node.children.map(childId => copyNode(childId, newId, '')).filter(Boolean);
      }
      return newId;
    };

    const newId = copyNode(clipboard.id, currentFolderId, ' - Copy');
    if (newId) {
      const parent = newFs[currentFolderId];
      if (parent && parent.children) {
        newFs[currentFolderId] = { ...parent, children: [...parent.children, newId] };
      }
      updateFs(newFs);
    }
  };

  const handleStartRenameFromContext = () => {
    if (contextMenu.fileId) {
      setSelectedId(contextMenu.fileId);
      setRenameValue(fs[contextMenu.fileId].name);
      setIsRenaming(true);
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const folder = fs[currentFolderId];
  let items: FileNode[] = [];
  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    items = Object.values<FileNode>(fs).filter(node => 
      node.id !== 'root' && node.id !== 'trash' && node.name.toLowerCase().includes(lowerQuery)
    );
  } else {
    items = folder?.children?.map(id => fs[id]).filter(Boolean) as FileNode[] || [];
  }

  const updateFs = (newFs: Record<string, FileNode>) => {
    triggerFsUpdate(newFs);
  };

  const handleUp = () => {
    if (folder?.parent) {
      setCurrentFolderId(folder.parent);
      setSelectedId(null);
      setIsRenaming(false);
    }
  };

  const handleCreate = (type: 'file' | 'folder') => {
    const id = `${type}_${Date.now()}`;
    const name = type === 'folder' ? 'New Folder' : 'New File.txt';
    const newNode: FileNode = { id, name, type, parent: currentFolderId };
    if (type === 'folder') newNode.children = [];
    
    updateFs({
      ...fs,
      [id]: newNode,
      [currentFolderId]: {
        ...folder,
        children: [...(folder.children || []), id]
      }
    });
    setSelectedId(id);
    setRenameValue(name);
    setIsRenaming(true);
  };

  const handleRenameCommit = () => {
    if (selectedId && renameValue.trim()) {
      updateFs({
        ...fs,
        [selectedId]: {
          ...fs[selectedId],
          name: renameValue.trim()
        }
      });
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameCommit();
    if (e.key === 'Escape') setIsRenaming(false);
  };

  const handleDelete = (idToDelete?: string) => {
    const targetId = idToDelete || selectedId;
    if (targetId && !['root', 'docs', 'pics', 'sys', 'trash'].includes(targetId)) {
      const itemToTrash = fs[targetId];
      if (!itemToTrash) return;
      const currentParentId = itemToTrash.parent;
      
      if (itemToTrash.parent === 'trash') {
        // Permanently delete
        const newFs = { ...fs };
        const trashFolder = newFs['trash'];
        if (trashFolder) {
          newFs['trash'] = {
            ...trashFolder,
            children: (trashFolder.children || []).filter(id => id !== targetId)
          };
        }
        delete newFs[targetId];
        updateFs(newFs);
      } else {
        // Move to trash
        const newFs = { ...fs };
        
        if (currentParentId && newFs[currentParentId]) {
          newFs[currentParentId] = {
            ...newFs[currentParentId],
            children: (newFs[currentParentId].children || []).filter(id => id !== targetId)
          };
        }
        
        const trashFolder = newFs['trash'] || { id: 'trash', name: 'Trash', type: 'folder', children: [] };
        newFs['trash'] = {
          ...trashFolder,
          children: [...(trashFolder.children || []), targetId]
        };
        
        newFs[targetId] = {
          ...itemToTrash,
          parent: 'trash',
          originalParent: currentParentId
        };
        
        updateFs(newFs);
      }
      if (selectedId === targetId) {
        setSelectedId(null);
      }
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleRestore = () => {
    if (selectedId) {
      const item = fs[selectedId];
      if (item && item.parent === 'trash' && item.originalParent) {
        const targetParentId = fs[item.originalParent] ? item.originalParent : 'root';
        const newFs = { ...fs };
        
        const trashFolder = newFs['trash'];
        if (trashFolder) {
          newFs['trash'] = {
            ...trashFolder,
            children: (trashFolder.children || []).filter(id => id !== selectedId)
          };
        }
        
        newFs[targetParentId] = {
          ...newFs[targetParentId],
          children: [...(newFs[targetParentId].children || []), selectedId]
        };
        
        newFs[selectedId] = {
          ...item,
          parent: targetParentId,
          originalParent: undefined
        };
        
        updateFs(newFs);
        setSelectedId(null);
      }
    }
  };

  const handleEmptyTrash = () => {
    const newFs = { ...fs };
    const trashFolder = newFs['trash'];
    if (trashFolder && trashFolder.children) {
      // Find all nested items to delete properly? Simple way is fine.
      // But we just delete top level items in trash since directories inside trash won't be accessed
      trashFolder.children.forEach(id => {
        delete newFs[id];
      });
      newFs['trash'] = {
        ...trashFolder,
        children: []
      };
      updateFs(newFs);
    }
    setShowEmptyTrashConfirm(false);
    setSelectedId(null);
  };

  const currentPathNames = [];
  let curr: FileNode | undefined = folder;
  while (curr) {
    currentPathNames.unshift(curr.name);
    curr = curr.parent ? fs[curr.parent] : undefined;
  }
  const pathString = currentPathNames.join(' / ');

  return (
    <div className="flex flex-col h-full bg-slate-50/90 backdrop-blur-md text-slate-900 font-sans shadow-inner overflow-hidden" onClick={() => { setSelectedId(null); setIsRenaming(false); }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-md border-b border-slate-200 shadow-sm z-10" onClick={e => e.stopPropagation()}>
        <button 
          onClick={handleUp} 
          disabled={!folder?.parent}
          className="p-1.5 rounded-md hover:bg-black/5 disabled:opacity-40 transition-colors"
          title="Up"
        >
          <ChevronUp className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm shadow-inner flex items-center transition-all focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400">
          <span className="text-slate-600 truncate font-medium">{searchQuery ? `Search Results for "${searchQuery}"` : pathString}</span>
        </div>
        <div className="w-56 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm shadow-inner flex items-center ml-2 transition-all focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search files..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full outline-none bg-transparent placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5 ml-3 border-l border-slate-300 pl-3">
          {currentFolderId !== 'trash' && (
            <>
              <button onClick={() => handleCreate('folder')} className="p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors flex items-center gap-1.5" title="New Folder">
                <UbuntuFolderIcon className="w-4 h-4" /> <span className="text-xs font-medium hidden md:inline">New Folder</span>
              </button>
              <button onClick={() => handleCreate('file')} className="p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors flex items-center gap-1.5" title="New File">
                <FileText className="w-4 h-4" /> <span className="text-xs font-medium hidden md:inline">New File</span>
              </button>
            </>
          )}
          <button 
            onClick={() => {
              if (selectedId) {
                setRenameValue(fs[selectedId].name);
                setIsRenaming(true);
              }
            }} 
            disabled={!selectedId || currentFolderId === 'trash'}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40 flex items-center gap-1.5"
            title="Rename"
          >
            <span className="text-xs font-medium hidden md:inline">Rename</span>
          </button>
          {currentFolderId === 'trash' && selectedId && (
            <button 
              onClick={handleRestore}
              className="p-1.5 rounded-md hover:bg-green-50 hover:text-green-600 text-slate-600 transition-colors flex items-center gap-1.5"
              title="Restore"
            >
              <RotateCcw className="w-4 h-4" /> <span className="text-xs font-medium hidden md:inline">Restore</span>
            </button>
          )}
          {currentFolderId === 'trash' && (
            <button 
              onClick={() => setShowEmptyTrashConfirm(true)}
              disabled={fs['trash']?.children?.length === 0}
              className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors disabled:opacity-40 flex items-center gap-1.5 ml-1"
              title="Empty Trash"
            >
              <AlertTriangle className="w-4 h-4" /> <span className="text-xs font-medium hidden md:inline">Empty Trash</span>
            </button>
          )}
          <button 
            onClick={handleDelete}
            disabled={!selectedId || ['root', 'docs', 'pics', 'sys', 'trash'].includes(selectedId)}
            className="p-1.5 rounded-md hover:bg-red-100 hover:text-red-700 text-slate-600 transition-colors disabled:opacity-40 flex items-center gap-1.5 ml-1"
            title={currentFolderId === 'trash' ? "Delete Permanently" : "Move to Trash"}
          >
            <Trash2 className="w-4 h-4" /> <span className="text-xs font-medium hidden md:inline">Delete</span>
          </button>
        </div>
      </div>
      {/* Sidebar & Content area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className="w-52 bg-slate-100/60 backdrop-blur-sm border-r border-slate-200/80 p-3 flex flex-col gap-1 overflow-y-auto shrink-0 z-0" onClick={e => e.stopPropagation()}>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2 mt-1">Quick Access</div>
          <button 
            onClick={() => setCurrentFolderId('root')} 
            onDragOver={(e) => { e.preventDefault(); setDragOverId('root'); }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverId(null);
              const draggedId = e.dataTransfer.getData('text/plain');
              handleMove(draggedId, 'root');
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentFolderId === 'root' ? 'bg-blue-500 text-white shadow-sm' : dragOverId === 'root' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200/60 text-slate-700'}`}
          >
            <HardDrive className={`w-4 h-4 ${currentFolderId === 'root' ? 'text-blue-100' : 'text-slate-500'}`} /> Root
          </button>
          <button 
            onClick={() => setCurrentFolderId('docs')} 
            onDragOver={(e) => { e.preventDefault(); setDragOverId('docs'); }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverId(null);
              const draggedId = e.dataTransfer.getData('text/plain');
              handleMove(draggedId, 'docs');
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentFolderId === 'docs' ? 'bg-blue-500 text-white shadow-sm' : dragOverId === 'docs' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200/60 text-slate-700'}`}
          >
            <UbuntuFolderIcon className="w-4 h-4" isSelected={currentFolderId === 'docs' || dragOverId === 'docs'} /> Documents
          </button>
          <button 
            onClick={() => setCurrentFolderId('pics')} 
            onDragOver={(e) => { e.preventDefault(); setDragOverId('pics'); }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverId(null);
              const draggedId = e.dataTransfer.getData('text/plain');
              handleMove(draggedId, 'pics');
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentFolderId === 'pics' ? 'bg-blue-500 text-white shadow-sm' : dragOverId === 'pics' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200/60 text-slate-700'}`}
          >
            <ImageIcon className={`w-4 h-4 ${currentFolderId === 'pics' || dragOverId === 'pics' ? 'text-white' : 'text-purple-500'}`} /> Pictures
          </button>
          <div className="my-2 border-b border-slate-200/60"></div>
          <button 
            onClick={() => setCurrentFolderId('trash')} 
            onDragOver={(e) => { e.preventDefault(); setDragOverId('trash'); }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverId(null);
              const draggedId = e.dataTransfer.getData('text/plain');
              handleMove(draggedId, 'trash');
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentFolderId === 'trash' ? 'bg-blue-500 text-white shadow-sm' : dragOverId === 'trash' ? 'bg-red-100 text-red-700' : 'hover:bg-slate-200/60 text-slate-700'}`}
          >
            <Trash2 className={`w-4 h-4 ${currentFolderId === 'trash' || dragOverId === 'trash' ? 'text-white' : 'text-slate-600'}`} /> Trash
          </button>
        </div>
        {/* Main Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Content */}
          <div 
            className="flex-1 p-6 overflow-auto bg-white"
            onContextMenu={e => handleContextMenu(e, null)}
          >
          {searchQuery && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Search className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-lg font-medium text-slate-600">No items match your search.</p>
              <p className="text-sm mt-1">Try another keyword or <button className="text-blue-500 hover:underline" onClick={() => setSearchQuery('')}>clear search</button>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-4">
              {items.map(item => {
              const isSelected = selectedId === item.id;
              const isEditing = isSelected && isRenaming;

              return (
                <div 
                  key={item.id}
                  draggable={!['root', 'trash'].includes(item.id)}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', item.id);
                  }}
                  onDragOver={(e) => {
                    if (item.type === 'folder' && item.id !== selectedId) {
                      e.preventDefault();
                      setDragOverId(item.id);
                    }
                  }}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverId(null);
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (item.type === 'folder' && draggedId !== item.id) {
                      handleMove(draggedId, item.id);
                    }
                  }}
                  onContextMenu={(e) => handleContextMenu(e, item.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isEditing) setSelectedId(item.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (item.type === 'folder') {
                      setCurrentFolderId(item.id);
                      setSelectedId(null);
                      setIsRenaming(false);
                      setSearchQuery('');
                    } else if (item.name.toLowerCase().endsWith('.txt')) {
                      onOpenApp?.('notepad', { fileId: item.id });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isSelected && !isEditing) {
                      e.preventDefault();
                      setRenameValue(item.name);
                      setIsRenaming(true);
                    }
                  }}
                  tabIndex={0}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer group transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset ${isSelected ? 'bg-blue-50 border border-blue-200 shadow-sm' : dragOverId === item.id ? 'bg-blue-100 border border-blue-400 shadow-md scale-105' : 'border border-transparent hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm'}`}
                  title={item.type === 'folder' ? 'Double click to open' : item.name}
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-1 drop-shadow-sm group-hover:scale-105 transition-transform duration-200">
                    {item.type === 'folder' ? (
                      <UbuntuFolderIcon isSelected={isSelected} className="w-14 h-14" />
                    ) : item.name.endsWith('.png') || item.name.endsWith('.jpg') ? (
                      <ImageIcon className={`w-14 h-14 transition-colors ${isSelected ? 'text-purple-500' : 'text-purple-400 group-hover:text-purple-500'}`} strokeWidth={1.5} />
                    ) : (
                      <FileText className={`w-14 h-14 transition-colors ${isSelected ? 'text-slate-500' : 'text-slate-400 group-hover:text-slate-500'}`} strokeWidth={1.5} />
                    )}
                  </div>
                  {isEditing ? (
                    <input
                      autoFocus
                      className="text-xs text-center w-full bg-white border-2 border-blue-400 rounded-md outline-none px-1 py-0.5 text-slate-900 shadow-sm"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={handleRenameCommit}
                      onKeyDown={handleRenameKeyDown}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex flex-col items-center w-full px-1">
                      <span 
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setRenameValue(item.name);
                          setIsRenaming(true);
                        }}
                        className={`text-xs text-center break-words w-full select-none line-clamp-2 leading-tight ${isSelected ? 'text-blue-800 font-medium' : 'text-slate-700 font-medium'}`}
                      >
                          {item.name}
                      </span>
                      {searchQuery && (
                        <div className="text-[10px] text-slate-400 font-normal mt-1 pointer-events-none truncate max-w-full" title={item.parent === 'root' ? '/' : item.parent}>
                          in {item.parent === 'root' ? '/' : fs[item.parent]?.name || item.parent}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {items.length === 0 && !searchQuery && (
              <div className="col-span-full h-48 flex flex-col items-center justify-center text-slate-400 text-sm pointer-events-none">
                <UbuntuFolderIcon className="w-16 h-16 opacity-30" />
                <p>This folder is empty.</p>
              </div>
            )}
            </div>
          )}
        </div>
        
        {/* Preview Pane */}
        {selectedId && fs[selectedId] && (
          <div className="w-72 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="text-sm font-bold text-slate-800">Preview</div>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 flex items-center justify-center bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
                {fs[selectedId].type === 'folder' ? (
                  <UbuntuFolderIcon className="w-24 h-24 drop-shadow-md" />
                ) : fs[selectedId].name.endsWith('.png') || fs[selectedId].name.endsWith('.jpg') ? (
                  <ImageIcon className="w-20 h-20 text-purple-500 drop-shadow-md" strokeWidth={1.5} />
                ) : (
                  <div className="w-full h-full text-[9px] text-slate-500 font-mono overflow-hidden leading-[1.3] break-all p-1 whitespace-pre-wrap">
                    {Array.from({length: 8}).map((_, i) => "10110010 01101001 00100000 1101001\n").join('')}
                    {Array.from({length: 4}).map((_, i) => "00101011 11000101\n").join('')}
                  </div>
                )}
              </div>
              <div className="text-center w-full px-2">
                <div className="font-semibold text-slate-800 break-words text-lg leading-tight mb-1">{fs[selectedId].name}</div>
                <div className="text-sm text-slate-500 capitalize">{fs[selectedId].type}</div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 mt-2 border border-slate-100">
              <div className="text-xs text-slate-600 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Location</span>
                  <span className="font-mono text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 truncate" title={fs[selectedId].parent === 'root' ? '/' : fs[selectedId].parent}>
                    {fs[selectedId].parent === 'root' ? '/' : fs[selectedId].parent}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white">
                  <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Size</span>
                  <span className="font-mono text-slate-800 font-medium">{fs[selectedId].type === 'folder' ? '--' : '1.2 KB'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                   <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Modified</span>
                   <span className="text-slate-800 font-medium whitespace-nowrap">Today, 10:42 AM</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 min-w-[160px] text-sm text-slate-700"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.fileId ? (
            <>
              {fs[contextMenu.fileId]?.type === 'folder' && (
                <button 
                  className="w-full text-left px-4 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => {
                    setCurrentFolderId(contextMenu.fileId!);
                    setSelectedId(null);
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                >
                  Open
                </button>
              )}
              <button 
                className="w-full text-left px-4 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={handleCopy}
              >
                Copy
              </button>
              <button 
                className="w-full text-left px-4 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={handleStartRenameFromContext}
              >
                Rename
              </button>
              <div className="h-px bg-slate-200 my-1"></div>
              <button 
                className="w-full text-left px-4 py-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => handleDelete(contextMenu.fileId!)}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button 
                className="w-full text-left px-4 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-700"
                onClick={handlePaste}
                disabled={!clipboard || currentFolderId === 'trash'}
              >
                Paste
              </button>
              <div className="h-px bg-slate-200 my-1"></div>
              <button 
                className="w-full text-left px-4 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => { handleCreate('folder'); setContextMenu(prev => ({ ...prev, visible: false })); }}
              >
                New Folder
              </button>
              <button 
                className="w-full text-left px-4 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => { handleCreate('file'); setContextMenu(prev => ({ ...prev, visible: false })); }}
              >
                New File
              </button>
            </>
          )}
        </div>
      )}

      {/* Empty Trash Confirmation Modal */}
      {showEmptyTrashConfirm && (
        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-50 rounded-b-xl">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-bold">Empty Trash?</h3>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete all items in the Trash? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button 
                onClick={() => setShowEmptyTrashConfirm(false)}
                className="px-4 py-2 rounded text-sm font-medium hover:bg-slate-100 text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleEmptyTrash}
                className="px-4 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TerminalApp = ({ onClose, onOpenApp }: { onClose?: () => void, onOpenApp?: (appId: string, props?: any) => void }) => {
  const [log, setLog] = useState<string[]>(['Welcome to TH OS Terminal v1.0.0', 'Type "help" for a list of commands.']);
  const [input, setInput] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [currentDirId, setCurrentDirId] = useState('root');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const validCommands = ['help', 'clear', 'date', 'echo', 'whoami', 'mkdir', 'touch', 'exit', 'shutdown', 'reboot', 'cd', 'ls', 'cat', 'edit', 'rm'];

  const getPath = (id: string): string => {
    if (id === 'root') return '~';
    const node = globalFileSystem[id];
    if (!node) return '~';
    if (!node.parent || node.parent === 'root') return `~/${node.name}`;
    return `${getPath(node.parent)}/${node.name}`;
  };

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [log, input]);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmdString = input.trim();
      const parts = cmdString.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      
      let output = '';
      if (cmdString !== '') {
        switch (cmd.toLowerCase()) {
          case 'help': output = 'Available commands: help, clear, date, echo, whoami, mkdir, touch, exit, shutdown, reboot, cd, ls, cat, edit, rm'; break;
          case 'clear': setLog([]); setInput(''); setCursorPos(0); return;
          case 'date': output = new Date().toString(); break;
          case 'whoami': output = 'guest_user'; break;
          case 'exit': 
            output = 'Session closed.'; 
            if (onClose) setTimeout(onClose, 500);
            break;
          case 'shutdown': 
          case 'reboot':
            output = 'Simulating shutdown...'; 
            setTimeout(() => window.location.reload(), 1000); 
            break;
          case 'cd': {
            if (!args[0] || args[0] === '~') {
               setCurrentDirId('root');
               break;
            }
            if (args[0] === '..') {
               const currentDir = globalFileSystem[currentDirId];
               if (currentDir && currentDir.parent) {
                 setCurrentDirId(currentDir.parent);
               }
               break;
            }
            const currentDir = globalFileSystem[currentDirId];
            const childIds = currentDir?.children || [];
            const targetFolderId = childIds.find(id => {
               const node = globalFileSystem[id];
               return node && node.type === 'folder' && node.name === args[0];
            });
            if (targetFolderId) {
               setCurrentDirId(targetFolderId);
            } else {
               output = `cd: ${args[0]}: No such directory`;
            }
            break;
          }
          case 'ls': {
            const currentDir = globalFileSystem[currentDirId];
            const childIds = currentDir?.children || [];
            const names = childIds.map(id => globalFileSystem[id]?.name).filter(Boolean);
            output = names.length > 0 ? names.join('  ') : '';
            break;
          }
          case 'cat': {
            if (!args[0]) { output = 'cat: missing file operand'; break; }
            const currentDir = globalFileSystem[currentDirId];
            const childIds = currentDir?.children || [];
            const targetFileId = childIds.find(id => {
               const node = globalFileSystem[id];
               return node && node.type === 'file' && node.name === args[0];
            });
            if (targetFileId) {
               output = globalFileSystem[targetFileId].content || '(Empty file)'; 
            } else {
               output = `cat: ${args[0]}: No such file`;
            }
            break;
          }
          case 'edit': {
            if (!args[0]) { output = 'edit: missing file operand'; break; }
            const currentDir = globalFileSystem[currentDirId];
            const childIds = currentDir?.children || [];
            let targetFileId = childIds.find(id => {
               const node = globalFileSystem[id];
               return node && node.type === 'file' && node.name === args[0];
            });

            if (!targetFileId) {
              // Create file if it doesn't exist
              targetFileId = `file_${Date.now()}`;
              const newNode: FileNode = { id: targetFileId, name: args[0], type: 'file', parent: currentDirId };
              triggerFsUpdate({
                ...globalFileSystem,
                [targetFileId]: newNode,
                [currentDirId]: {
                  ...globalFileSystem[currentDirId],
                  children: [...(globalFileSystem[currentDirId].children || []), targetFileId]
                }
              });
              output = `Created and opening ${args[0]}...`;
            } else {
              output = `Opening ${args[0]}...`;
            }
            
            onOpenApp?.('notepad', { fileId: targetFileId });
            break;
          }
          case 'mkdir': {
            if (!args[0]) { output = 'mkdir: missing operand'; break; }
            const name = args[0];
            const id = `folder_${Date.now()}`;
            const newNode: FileNode = { id, name, type: 'folder', children: [], parent: currentDirId };
            triggerFsUpdate({
              ...globalFileSystem,
              [id]: newNode,
              [currentDirId]: {
                ...globalFileSystem[currentDirId],
                children: [...(globalFileSystem[currentDirId].children || []), id]
              }
            });
            break;
          }
          case 'touch': {
            if (!args[0]) { output = 'touch: missing file operand'; break; }
            const name = args[0];
            const id = `file_${Date.now()}`;
            const newNode: FileNode = { id, name, type: 'file', parent: currentDirId };
            triggerFsUpdate({
              ...globalFileSystem,
              [id]: newNode,
              [currentDirId]: {
                ...globalFileSystem[currentDirId],
                children: [...(globalFileSystem[currentDirId].children || []), id]
              }
            });
            break;
          }
          case 'rm': {
            if (!args[0]) { output = 'rm: missing operand'; break; }
            const currentDir = globalFileSystem[currentDirId];
            const childIds = currentDir?.children || [];
            const targetId = childIds.find(id => {
               const node = globalFileSystem[id];
               return node && node.name === args[0];
            });
            
            if (targetId) {
               if (['root', 'docs', 'pics', 'sys', 'trash'].includes(targetId)) {
                 output = `rm: cannot remove '${args[0]}': System protected`;
                 break;
               }
               const newFs = { ...globalFileSystem };
               // Remove from parent children
               newFs[currentDirId] = {
                 ...newFs[currentDirId],
                 children: (newFs[currentDirId].children || []).filter(id => id !== targetId)
               };
               // Remove node itself
               delete newFs[targetId];
               triggerFsUpdate(newFs);
               output = `Removed ${args[0]}`;
            } else {
               output = `rm: cannot remove '${args[0]}': No such file or directory`;
            }
            break;
          }
          default: if(cmdString.startsWith('echo ')) { output = cmdString.substring(5); } else { output = `Command not found: ${cmd}`; } break;
        }
      }
      setLog(prev => [...prev, `guest@th-os:${getPath(currentDirId)}$ ${cmdString}`, ...(output ? [output] : [])]);
      setInput('');
      setCursorPos(0);
    }
  };

  const renderLogLine = (line: string, i: number) => {
    if (line.startsWith('> ')) {
      const cmdString = line.substring(2);
      const match = cmdString.match(/^(\S+)(.*)$/);
      if (!match) return <div key={i}><span className="mr-2 text-green-500 font-bold">&gt;</span><span className="text-green-400">{cmdString}</span></div>;
      
      const cmd = match[1];
      const args = match[2];
      const isValid = validCommands.includes(cmd.toLowerCase());
      
      return (
        <div key={i}>
          <span className="mr-2 text-green-500 font-bold">&gt;</span>
          <span className={isValid ? 'text-blue-400 font-bold' : 'text-red-400'}>{cmd}</span>
          <span className="text-yellow-200">{args}</span>
        </div>
      );
    }

    if (line.startsWith('guest@th-os:')) {
      const matchFull = line.match(/^(guest@th-os:\S+\$ )(.*)$/);
      if (!matchFull) {
        return <div key={i}><span className="text-slate-300 whitespace-pre-wrap">{line}</span></div>;
      }
      
      const prompt = matchFull[1];
      const cmdString = matchFull[2];
      const match = cmdString.match(/^(\S+)(.*)$/);
      
      const cmd = match ? match[1] : cmdString;
      const args = match ? match[2] : '';
      const isValid = validCommands.includes(cmd.toLowerCase());
      
      return (
        <div key={i} className="flex flex-wrap">
          <span className="mr-2 text-green-500 font-bold">{prompt}</span>
          {cmdString ? (
            <span>
              <span className={isValid ? 'text-blue-400 font-bold' : 'text-red-400'}>{cmd}</span>
              <span className="text-yellow-200">{args}</span>
            </span>
          ) : null}
        </div>
      );
    }

    return <div key={i} className="text-slate-300 whitespace-pre-wrap">{line}</div>;
  };

  const renderActiveInput = () => {
    const match = input.match(/^(\S+)(.*)$/);
    const cmdLength = match ? match[1].length : input.length;
    const isValid = validCommands.includes((match ? match[1] : input).toLowerCase());

    const chars = (input + ' ').split('');
    
    return chars.map((char, index) => {
      let colorClass = 'text-green-400';
      if (index < cmdLength) {
         colorClass = isValid ? 'text-blue-400 font-bold' : 'text-red-400';
      } else if (index >= cmdLength && char !== ' ') {
         colorClass = 'text-yellow-200';
      }
      
      const isCursor = index === cursorPos;
      
      return (
        <span 
          key={index} 
          className={`${colorClass} ${isCursor ? 'bg-green-400 text-black terminal-blink' : ''}`}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-black/95">
      <div className="flex bg-slate-200 border-b border-slate-300 text-xs text-slate-800 py-0.5 px-2 select-none shadow-sm">
        <div className="px-2 py-1 hover:bg-black/10 rounded cursor-pointer">File</div>
        <div className="px-2 py-1 hover:bg-black/10 rounded cursor-pointer">Edit</div>
        <div className="px-2 py-1 hover:bg-black/10 rounded cursor-pointer">View</div>
        <div className="px-2 py-1 hover:bg-black/10 rounded cursor-pointer">Terminal</div>
        <div className="px-2 py-1 hover:bg-black/10 rounded cursor-pointer">Help</div>
      </div>
      <div 
        className="flex-1 flex flex-col font-mono text-sm p-4 overflow-auto text-green-400"
        onClick={() => inputRef.current?.focus()}
        ref={containerRef}
      >
      <style>{`
        @keyframes terminalBlink {
          0%, 100% { background-color: transparent; color: inherit; }
          50% { background-color: #4ade80; color: #000; }
        }
        .terminal-blink {
          animation: terminalBlink 1s step-end infinite;
        }
      `}</style>
      {log.map((line, i) => renderLogLine(line, i))}
      <div className="flex mt-1 relative flex-wrap">
        <span className="mr-2 text-green-500 font-bold">guest@th-os:{getPath(currentDirId)}$</span>
        <div className="flex-1 whitespace-pre">
          {renderActiveInput()}
        </div>
        <input 
          ref={inputRef}
          autoFocus 
          className="absolute inset-0 bg-transparent outline-none border-none text-transparent caret-transparent ml-4 opacity-0" 
          value={input} 
          onChange={e => {
            setInput(e.target.value);
            setCursorPos(e.target.selectionStart || 0);
          }} 
          onSelect={e => setCursorPos(e.currentTarget.selectionStart || 0)}
          onKeyDown={handleCommand}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </div>
    </div>
  );
};

const NotepadApp = ({ fileId }: { fileId?: string }) => {
  const [fs, setFs] = useState(globalFileSystem);
  const file = fileId ? fs[fileId] : null;
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleFsUpdate = (e: Event) => {
      setFs((e as CustomEvent).detail);
    };
    window.addEventListener(FS_UPDATE_EVENT, handleFsUpdate);
    return () => window.removeEventListener(FS_UPDATE_EVENT, handleFsUpdate);
  }, []);

  React.useEffect(() => {
    if (file && editorRef.current) {
      editorRef.current.innerHTML = file.content || '';
    }
  }, [file?.id]);

  const handleSave = () => {
    if (fileId && file && editorRef.current) {
      const content = editorRef.current.innerHTML;
      const newFs = {
        ...fs,
        [fileId]: { ...file, content }
      };
      triggerFsUpdate(newFs);
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Menu Bar */}
      <div className="flex bg-slate-100 border-b border-slate-200 text-[11px] text-slate-700 py-0.5 px-2 select-none items-center shadow-sm">
        <div className="px-2 py-1 font-bold text-slate-900 border-r border-slate-300 mr-2">{file ? file.name : 'Untitled.txt'}</div>
        <div className="px-2 py-0.5 hover:bg-black/5 rounded cursor-pointer transition-colors" onClick={handleSave}>Save</div>
        <div className="px-2 py-0.5 hover:bg-black/5 rounded cursor-pointer transition-colors">Edit</div>
        <div className="px-2 py-0.5 hover:bg-black/5 rounded cursor-pointer transition-colors">Insert</div>
      </div>
      
      {/* Formatting Toolbar */}
      <div className="flex bg-slate-50 border-b border-slate-200 p-1 gap-1 items-center shadow-sm">
        <button 
          onClick={() => execCommand('bold')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-700"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button 
          onClick={() => execCommand('italic')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-700"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button 
          onClick={() => execCommand('underline')}
          className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-700"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1"></div>
        <div className="text-[10px] text-slate-400 ml-2 font-medium uppercase tracking-wider">Rich Text Mode</div>
      </div>

      {/* Editor Content */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={() => {
            // Optional: Auto-save or sync state here if needed, 
            // but for this sim, explicit Save is fine.
        }}
        className="flex-1 w-full p-6 text-slate-800 font-sans outline-none overflow-auto prose prose-slate max-w-none" 
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&#x0009;');
          }
        }}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: "Start typing your notes here...";
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

const BrowserApp = () => {
  const [url, setUrl] = useState('https://example.com');
  const [input, setInput] = useState('https://example.com');

  return (
    <div className="flex flex-col h-full bg-white text-slate-900">
      <div className="flex items-center gap-2 p-2 bg-slate-100 border-b border-slate-200">
        <div className="flex gap-1.5 px-2">
          {/* Fake browser controls */}
          <div className="w-3 h-3 rounded-full bg-slate-300"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300"></div>
        </div>
        <input 
          className="flex-1 px-3 py-1 bg-white border border-slate-300 rounded font-sans text-sm" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setUrl(input)}
        />
      </div>
      <div className="flex-1 flex justify-center items-center bg-slate-50 relative overflow-hidden">
        {/* We use an iframe, but restrict it slightly. Not all sites allow iframe viewing. Note: google.com won't load in an iframe. */}
        <iframe src={url} className="w-full h-full border-none" title="browser window" />
      </div>
    </div>
  );
};

const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');

  const btnClass = "bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded flex items-center justify-center text-lg font-medium transition-colors select-none cursor-pointer";
  
  const handleBtn = (val: string) => {
    if (val === 'C') return setDisplay('0');
    if (val === '=') {
      try {
        // Safe evaluation of simple math
        setDisplay(new Function('return ' + display)().toString());
      } catch {
        setDisplay('Error');
      }
      return;
    }
    setDisplay(prev => prev === '0' && val !== '.' ? val : prev + val);
  };

  const btns = ['7','8','9','/','4','5','6','*','1','2','3','-','C','0','.','+','='];

  return (
    <div className="flex flex-col h-full bg-slate-800 text-white p-4">
      <div className="flex-1 flex items-end justify-end pb-4 text-4xl font-light font-mono truncate">
        {display}
      </div>
      <div className="h-[75%] grid grid-cols-4 gap-2">
        {btns.map(b => (
          <div 
            key={b} 
            onClick={() => handleBtn(b)} 
            className={`${btnClass} ${b === '=' ? 'col-span-4 bg-orange-500 hover:bg-orange-400' : ''}`}
          >
            {b}
          </div>
        ))}
      </div>
    </div>
  );
};

const UbuntuIcon = ({ children, color, size = 'large' }: { children: React.ReactNode, color: string, size?: 'small' | 'large' }) => {
  return (
    <div className={`
      relative flex items-center justify-center rounded-[22%] overflow-hidden shadow-md
      bg-gradient-to-br ${color}
      ${size === 'large' ? 'w-full h-full' : 'w-full h-full'}
    `}>
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-30" />
      <div className="absolute top-0 left-0 right-0 h-[45%] bg-white/10 rounded-t-full -mt-2 blur-[1px]" />
      <div className="relative z-10 w-[65%] h-[65%] flex items-center justify-center text-white drop-shadow-sm">
        {children}
      </div>
    </div>
  );
};

export const APPS: AppConfig[] = [
  {
    id: 'explorer',
    name: 'Files',
    icon: (
      <UbuntuIcon color="from-[#F9D423] to-[#FF9D00]">
        <Folder className="w-full h-full text-white" fill="currentColor" fillOpacity={0.4} />
      </UbuntuIcon>
    ),
    component: <FileExplorerApp />,
    defaultWidth: 700,
    defaultHeight: 500
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: (
      <UbuntuIcon color="from-[#333333] to-[#000000]">
        <TerminalSquare className="w-full h-full text-white" />
      </UbuntuIcon>
    ),
    component: <TerminalApp />,
    defaultWidth: 600,
    defaultHeight: 400
  },
  {
    id: 'notepad',
    name: 'Notes',
    icon: (
      <UbuntuIcon color="from-[#FFB92E] to-[#FF8C00]">
        <FileText className="w-full h-full text-white" />
      </UbuntuIcon>
    ),
    component: <NotepadApp />,
    defaultWidth: 500,
    defaultHeight: 500
  },
  {
    id: 'browser',
    name: 'Browser',
    icon: (
      <UbuntuIcon color="from-[#4FACFE] to-[#00F2FE]">
        <Globe className="w-full h-full text-white" />
      </UbuntuIcon>
    ),
    component: <BrowserApp />,
    defaultWidth: 800,
    defaultHeight: 600
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: (
      <UbuntuIcon color="from-[#434343] to-[#262626]">
        <CalcIcon className="w-full h-full text-white" />
      </UbuntuIcon>
    ),
    component: <CalculatorApp />,
    defaultWidth: 300,
    defaultHeight: 400
  },
  {
    id: 'trash',
    name: 'Trash',
    icon: (
      <UbuntuIcon color="from-[#A1A1A1] to-[#636363]">
        <Trash2 className="w-full h-full text-white" />
      </UbuntuIcon>
    ),
    component: <FileExplorerApp initialFolderId="trash" />,
    defaultWidth: 700,
    defaultHeight: 500
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: (
      <UbuntuIcon color="from-[#333333] to-[#000000]">
        <SettingsIcon className="w-full h-full text-white" />
      </UbuntuIcon>
    ),
    component: <SettingsApp />,
    defaultWidth: 500,
    defaultHeight: 400
  },
  {
    id: 'clock',
    name: 'Clock',
    icon: (
      <img src="/src/assets/clock.png" alt="Clock" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
    ),
    component: <ClockApp />,
    defaultWidth: 400,
    defaultHeight: 500
  }
];
