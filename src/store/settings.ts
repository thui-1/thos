import { useState, useEffect } from 'react';

export type ThemeType = 'dark' | 'light';
export type AccentType = 'indigo' | 'blue' | 'green' | 'red' | 'orange';

export interface SettingsState {
  theme: ThemeType;
  accent: AccentType;
  wallpaper: string;
}

const defaultSettings: SettingsState = {
  theme: 'dark',
  accent: 'indigo',
  wallpaper: 'default-1'
};

let listeners: (() => void)[] = [];
let state = { ...defaultSettings };

export const osSettings = {
  get: () => state,
  set: (newState: Partial<SettingsState>) => {
    state = { ...state, ...newState };
    listeners.forEach(l => l());
  },
  subscribe: (l: () => void) => {
    listeners.push(l);
    return () => {
      listeners = listeners.filter(listener => listener !== l);
    };
  }
};

export const useSettings = () => {
  const [settings, setSettings] = useState(osSettings.get());
  useEffect(() => {
    return osSettings.subscribe(() => setSettings(osSettings.get()));
  }, []);
  return { settings, setSettings: osSettings.set };
};
