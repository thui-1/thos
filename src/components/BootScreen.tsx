import React, { useState, useEffect } from 'react';
import bootAnimationUrl from '../assets/bootanimation.gif';
import bootSoundUrl from '../assets/bootsound.mp3';

interface BootScreenProps {
  onBootComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete }) => {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) {
      const audio = new Audio(bootSoundUrl);
      audio.play().catch(e => console.log('Audio playback prevented by browser policy:', e));
      
      const timer = setTimeout(() => {
        onBootComplete();
      }, 10000);
      
      return () => {
        clearTimeout(timer);
        audio.pause();
      };
    }
  }, [started, onBootComplete]);

  if (!started) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white font-mono gap-4 select-none cursor-pointer" onClick={() => setStarted(true)}>
        <p className="animate-pulse">Click to Power On</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black overflow-hidden pointer-events-none">
      <img src={bootAnimationUrl} alt="Booting..." className="w-full h-full object-contain" />
    </div>
  );
};
