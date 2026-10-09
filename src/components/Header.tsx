import React from 'react';
import { Play } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onQuickRun: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onQuickRun }) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <button 
        onClick={() => onTabChange('library')}
        className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
      >
        <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">
          Ω
        </span>
        <span>OrbisX</span>
      </button>

      {/* Zone 2: 4-5 single-line clean navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
        <button
          onClick={() => onTabChange('library')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'library' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Game Library
        </button>
        <button
          onClick={() => onTabChange('sandbox')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'sandbox' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Native Runner
        </button>
        <button
          onClick={() => onTabChange('pkg')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'pkg' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          PKG Inspector
        </button>
        <button
          onClick={() => onTabChange('setup')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'setup' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Windows Setup
        </button>
        <button
          onClick={() => onTabChange('controller')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'controller' ? 'text-blue-400 font-semibold' : ''
          }`}
        >
          Controller Studio
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onQuickRun}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-blue-900/30 active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch Bloodborne</span>
        </button>
      </div>
    </header>
  );
};
