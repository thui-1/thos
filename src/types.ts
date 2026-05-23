import React from 'react';

export interface AppConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  defaultWidth: number;
  defaultHeight: number;
}

export interface WindowState {
  id: string; // unique instance id
  appId: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  initialProps?: Record<string, any>;
}
