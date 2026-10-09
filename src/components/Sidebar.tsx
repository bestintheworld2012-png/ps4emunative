import React from 'react';
import {
  Gamepad2,
  Cpu,
  PackageOpen,
  Terminal,
  Activity,
  Layers,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  gameCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, gameCount }) => {
  const navItems = [
    {
      id: 'library',
      label: 'Game Library',
      count: gameCount,
      icon: Gamepad2,
    },
    {
      id: 'sandbox',
      label: 'Native Runner Sandbox',
      badge: 'Live',
      icon: Layers,
    },
    {
      id: 'pkg',
      label: 'PKG & SFO Inspector',
      icon: PackageOpen,
    },
    {
      id: 'setup',
      label: 'Windows Setup Guide',
      icon: Terminal,
    },
    {
      id: 'hardware',
      label: 'Hardware Diagnostics',
      icon: Cpu,
    },
    {
      id: 'controller',
      label: 'Controller Studio',
      icon: Activity,
    },
  ];

  return (
    <aside className="w-64 border-r border-neutral-800 bg-neutral-950 flex flex-col justify-between shrink-0 p-4 select-none">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Execution Suite
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-neutral-800/90 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-neutral-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-xs font-mono tabular-nums text-neutral-400">
                      {item.count}
                    </span>
                  )}
                  {item.badge && (
                    <span className="text-xs font-mono text-emerald-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-neutral-800/80">
          <div className="px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Architecture Specs
          </div>
          <div className="px-3 py-2.5 rounded-md bg-neutral-900/50 border border-neutral-800 text-xs text-neutral-400 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Target ISA:</span>
              <span className="text-neutral-200">x86-64 AMD Jaguar</span>
            </div>
            <div className="flex justify-between">
              <span>Host Kernel:</span>
              <span className="text-neutral-200">Windows NT 10.0+</span>
            </div>
            <div className="flex justify-between">
              <span>GPU Backend:</span>
              <span className="text-blue-400">Vulkan 1.3 / SPIR-V</span>
            </div>
            <div className="flex justify-between">
              <span>CPU JIT:</span>
              <span className="text-emerald-400">0% (Native Exec)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-800">
        <button
          onClick={() => onTabChange('setup')}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 rounded-md transition-colors"
        >
          <Settings className="w-4 h-4 text-neutral-400" />
          <span>Windows Runner Config</span>
        </button>
      </div>
    </aside>
  );
};
