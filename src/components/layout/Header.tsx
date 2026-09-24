import React from 'react';
import { BrandBadge } from './BrandBadge';
import { Activity, BookOpen, GitBranch, History, PlusCircle, Key } from 'lucide-react';

interface HeaderProps {
  activeTab?: 'brief' | 'control-room' | 'policy-tree' | 'knowledge-base' | 'history';
  onTabChange?: (tab: 'brief' | 'control-room' | 'policy-tree' | 'knowledge-base' | 'history') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab = 'brief', onTabChange }) => {
  const navItems = [
    { id: 'brief', label: 'Communication Brief', icon: PlusCircle },
    { id: 'control-room', label: 'Agent Control Room', icon: Activity },
    { id: 'policy-tree', label: 'Policy Tree', icon: GitBranch },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'history', label: 'Audit History', icon: History },
  ] as const;

  return (
    <header className="bg-aurora-neutral-0 border-b border-aurora-neutral-200 sticky top-0 z-30 shadow-aurora">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Lockup */}
          <div className="cursor-pointer" onClick={() => onTabChange?.('brief')}>
            <BrandBadge subtitle="AI Customer Communication Orchestrator" />
          </div>

          {/* Nav Items */}
          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs sm:text-sm transition-colors ${
                    isActive
                      ? 'bg-aurora-primary-light text-aurora-primary font-bold border-b-2 border-aurora-primary'
                      : 'text-aurora-neutral-700 hover:text-aurora-neutral-900 hover:bg-aurora-neutral-100 font-medium'
                  }`}
                >
                  <Icon strokeWidth={1.5} className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onTabChange?.('settings' as any)}
              className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-aurora-neutral-700 hover:text-aurora-neutral-900 hover:bg-aurora-neutral-100 border border-aurora-neutral-300 flex items-center space-x-1 transition"
            >
              <Key strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary" />
              <span className="hidden sm:inline">API Keys & Settings</span>
            </button>

            {/* Aurora Cloud Single-Accent Status Pill */}
            <div className="hidden lg:flex items-center space-x-2 text-xs text-aurora-neutral-700 bg-aurora-neutral-100 border border-aurora-neutral-300 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-aurora-success"></span>
              <span className="font-medium">Governance Engine Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
