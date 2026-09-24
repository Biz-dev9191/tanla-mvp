import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandBadge } from './BrandBadge';
import { Activity, BookOpen, GitBranch, History, PlusCircle, ShieldCheck } from 'lucide-react';

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
          {/* Logo */}
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
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-aurora-primary-light text-aurora-primary font-semibold border-b-2 border-aurora-primary'
                      : 'text-aurora-neutral-700 hover:text-aurora-neutral-900 hover:bg-aurora-neutral-100'
                  }`}
                >
                  <Icon strokeWidth={1.5} className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>

          {/* System Status Pill */}
          <div className="hidden lg:flex items-center space-x-2 text-xs text-aurora-neutral-700 bg-aurora-neutral-100 border border-aurora-neutral-200 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-aurora-success animate-pulse"></span>
            <span className="font-medium">Governance Engine Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
