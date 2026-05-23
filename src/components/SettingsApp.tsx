import React from 'react';
import { useSettings } from '../store/settings';

export const SettingsApp = () => {
  const { settings, setSettings } = useSettings();

  const isDark = settings.theme === 'dark';

  return (
    <div className={`flex flex-col h-full p-6 select-text transition-colors overflow-y-auto
      ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-50 text-slate-900'}
    `}>
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      
      <div className="space-y-8 max-w-md">
        {/* Appearance */}
        <div>
          <h3 className={`text-sm font-medium uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Appearance</h3>
          <div className={`flex p-1 rounded-lg transition-colors ${isDark ? 'bg-slate-700/50' : 'bg-slate-200'}`}>
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all
                ${!isDark ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-600/50'}
              `}
              onClick={() => setSettings({ theme: 'light' })}
            >
              Light
            </button>
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all
                ${isDark ? 'bg-slate-600 shadow text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300'}
              `}
              onClick={() => setSettings({ theme: 'dark' })}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <h3 className={`text-sm font-medium uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Accent Color</h3>
          <div className="flex gap-4">
             {['indigo', 'blue', 'green', 'red', 'orange'].map((color) => {
               const colorClasses = {
                 indigo: 'bg-indigo-500',
                 blue: 'bg-blue-500',
                 green: 'bg-green-500',
                 red: 'bg-red-500',
                 orange: 'bg-orange-500'
               }[color];

               const isSelected = settings.accent === color;

               return (
                 <button
                   key={color}
                   onClick={() => setSettings({ accent: color as any })}
                   className={`w-10 h-10 rounded-full transition-all flex items-center justify-center
                     ${colorClasses}
                     ${isSelected ? (isDark ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : 'ring-2 ring-offset-2 ring-offset-slate-50 ring-slate-900') : 'hover:scale-110'}
                   `}
                   aria-label={`Select ${color} accent color`}
                 >
                   {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full opacity-70"></div>}
                 </button>
               );
             })}
          </div>
        </div>

        {/* Wallpaper */}
        <div>
          <h3 className={`text-sm font-medium uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Wallpaper</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
               { id: 'default-1', style: { background: 'linear-gradient(to bottom right, #a18cd1 0%, #fbc2eb 100%)' } },
               { id: 'default-2', style: { background: 'linear-gradient(to bottom right, #84fab0 0%, #8fd3f4 100%)' } },
               { id: 'default-3', style: { background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' } },
               { id: 'default-4', style: { background: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' } },
               { id: 'default-5', style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } }
            ].map(wp => (
              <button
                key={wp.id}
                style={wp.style}
                onClick={() => setSettings({ wallpaper: wp.style.background })}
                className={`h-20 rounded-lg transition-all
                  ${settings.wallpaper === wp.style.background ? (isDark ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : 'ring-2 ring-offset-2 ring-offset-slate-50 ring-slate-900') : 'hover:scale-105 opacity-80 hover:opacity-100'}
                `}
              />
            ))}
            
            {/* Custom File Upload Option */}
            <div className="relative h-20">
              <label 
                className={`absolute inset-0 flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-all
                  ${isDark ? 'border-slate-600 hover:border-slate-400 bg-slate-800' : 'border-slate-300 hover:border-slate-500 bg-slate-50'}
                `}
              >
                <div className="text-xs font-medium">Custom</div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="w-0 h-0 opacity-0" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string;
                        if (dataUrl) setSettings({ wallpaper: dataUrl });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <button
               onClick={() => setSettings({ wallpaper: 'default-1' })} // Revert to default generated gradient
               className={`h-20 rounded-lg text-sm font-medium border border-slate-300 transition-all flex items-center justify-center
                  ${settings.wallpaper === 'default-1' || !settings.wallpaper || (!settings.wallpaper.startsWith('http') && !settings.wallpaper.startsWith('data:') && !settings.wallpaper.startsWith('linear-gradient')) ? (isDark ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : 'ring-2 ring-offset-2 ring-offset-slate-50 ring-slate-900') : 'hover:scale-105'}
               `}
             >
               Default
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
