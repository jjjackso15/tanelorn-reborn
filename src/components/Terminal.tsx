'use client';

import React from 'react';
import { clsx } from 'clsx';
import { TERMINAL_BG_COLOR, TERMINAL_FONT, TERMINAL_TEXT_COLOR } from '@/app/constants';

interface TerminalProps {
  children: React.ReactNode;
  className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ children, className }) => {
  return (
    <div className={clsx(
      "min-h-screen w-full flex flex-col p-4 overflow-hidden relative",
      TERMINAL_BG_COLOR,
      TERMINAL_TEXT_COLOR,
      TERMINAL_FONT,
      className
    )}>
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
      <div className="relative z-20 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
