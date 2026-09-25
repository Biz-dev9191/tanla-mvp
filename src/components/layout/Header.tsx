import React, { useState, useEffect } from 'react';
import { BrandBadge } from './BrandBadge';
import {
  Activity,
  BookOpen,
  GitBranch,
  History,
  PlusCircle,
  Menu,
  X,
  ChevronRight,
  Home as HomeIcon,
} from 'lucide-react';

export type TabType = 'brief' | 'control-room' | 'policy-tree' | 'knowledge-base' | 'history' | 'home';

interface HeaderProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  hasActiveRun?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab = 'brief', onTabChange, hasActiveRun = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    {
      id: 'brief' as const,
      label: 'Communication Brief',
      description: 'Set up customer details, event telemetry, and business goals',
      icon: PlusCircle,
    },
    {
      id: 'policy-tree' as const,
      label: 'Edit Policy',
      description: 'Inspect deterministic rules or upload custom policy documents',
      icon: GitBranch,
    },
    {
      id: 'control-room' as const,
      label: 'Decision & Previews',
      description: 'Review AI decisions, multi-channel message copy, and simulations',
      icon: Activity,
    },
    {
      id: 'knowledge-base' as const,
      label: 'Knowledge Rules',
      description: 'Explore agent rules, personas, pipeline steps, and scoring formulas',
      icon: BookOpen,
    },
    {
      id: 'history' as const,
      label: 'Audit History',
      description: 'Track sent communications, delivery logs, and authorization records',
      icon: History,
    },
  ];

  const currentActiveItem = navItems.find((item) => item.id === activeTab) || navItems[0];
  const CurrentIcon = currentActiveItem.icon;

  const handleSelectTab = (tabId: TabType) => {
    if (tabId === 'control-room' && !hasActiveRun) return;
    onTabChange?.(tabId);
    setIsMenuOpen(false);
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch (e) {
        window.scrollTo(0, 0);
      }
    }
  };

  return (
    <>
      <header className="bg-aurora-neutral-0 border-b border-aurora-neutral-200 sticky top-0 z-30 shadow-aurora">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left: Navigation Menu Trigger + Brand Logo */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center justify-center p-2 bg-aurora-neutral-100 hover:bg-aurora-primary hover:text-white border border-aurora-neutral-300 text-aurora-neutral-900 rounded-md text-xs shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-aurora-primary/20"
                aria-label="Open Navigation Menu"
              >
                <Menu strokeWidth={1.75} className="w-4 h-4" />
              </button>

              <div
                className="cursor-pointer flex items-center"
                onClick={() => handleSelectTab('home')}
              >
                <BrandBadge />
              </div>
            </div>

            {/* Right: Direct Navigation Links on Top Bar */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                type="button"
                onClick={() => handleSelectTab('knowledge-base')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeTab === 'knowledge-base'
                    ? 'bg-aurora-primary text-white shadow-2xs font-bold'
                    : 'text-aurora-neutral-700 hover:bg-aurora-neutral-100 hover:text-aurora-neutral-900 border border-transparent'
                }`}
              >
                <BookOpen strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary" />
                <span className="hidden sm:inline">Knowledge Rules</span>
                <span className="sm:hidden">Rules</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeTab === 'history'
                    ? 'bg-aurora-primary text-white shadow-2xs font-bold'
                    : 'text-aurora-neutral-700 hover:bg-aurora-neutral-100 hover:text-aurora-neutral-900 border border-transparent'
                }`}
              >
                <History strokeWidth={1.5} className="w-3.5 h-3.5 text-aurora-primary" />
                <span className="hidden sm:inline">Audit History</span>
                <span className="sm:hidden">History</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Left-Hand Collapsible Side Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-aurora-neutral-900/40 backdrop-blur-sm transition-opacity animate-fadeIn"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Slide-over Drawer Panel on the Left */}
          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
            <div className="w-screen max-w-md bg-aurora-neutral-0 border-r border-aurora-neutral-200 shadow-2xl flex flex-col justify-between transform transition-transform ease-in-out duration-300">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-aurora-neutral-200 flex items-center justify-between bg-aurora-neutral-100/50">
                <div>
                  <h2 className="text-base font-bold text-aurora-neutral-900">Navigation & Views</h2>
                  <p className="text-xs text-aurora-neutral-500 mt-0.5">
                    Aurora Cloud Agent Orchestration Suite
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-md text-aurora-neutral-500 hover:text-aurora-neutral-900 hover:bg-aurora-neutral-200 transition"
                  aria-label="Close menu"
                >
                  <X strokeWidth={1.5} className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body / Nav Links */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-aurora-neutral-500 block mb-3">
                    System Views
                  </span>
                  <nav className="space-y-1.5">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const isDisabled = item.id === 'control-room' && !hasActiveRun;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-start space-x-3.5 p-3 rounded-lg text-left transition-all ${
                            isDisabled
                              ? 'bg-aurora-neutral-50/80 text-aurora-neutral-400 border border-transparent cursor-not-allowed opacity-50'
                              : isActive
                              ? 'bg-aurora-primary-light text-aurora-primary border border-aurora-primary/20 shadow-sm'
                              : 'text-aurora-neutral-700 hover:text-aurora-neutral-900 hover:bg-aurora-neutral-100 border border-transparent'
                          }`}
                          title={isDisabled ? 'Generate a communication in brief first to unlock decision & message previews' : undefined}
                        >
                          <div
                            className={`p-2 rounded-md mt-0.5 flex-shrink-0 ${
                              isDisabled
                                ? 'bg-aurora-neutral-200 text-aurora-neutral-400'
                                : isActive
                                ? 'bg-aurora-primary text-white'
                                : 'bg-aurora-neutral-200 text-aurora-neutral-700'
                            }`}
                          >
                            <Icon strokeWidth={1.5} className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-bold ${isDisabled ? 'text-aurora-neutral-400' : 'text-aurora-neutral-900'}`}>
                                {item.label}
                              </span>
                              {isActive ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-aurora-primary text-white px-2 py-0.5 rounded">
                                  Active
                                </span>
                              ) : isDisabled ? (
                                <span className="text-[9px] font-mono text-aurora-neutral-400 bg-aurora-neutral-200/80 px-1.5 py-0.5 rounded font-medium">
                                  No Active Run
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-aurora-neutral-500 mt-0.5 leading-snug">
                              {isDisabled ? 'Generate communication brief first to unlock decision and previews' : item.description}
                            </p>
                          </div>
                          <ChevronRight
                            strokeWidth={1.5}
                            className={`w-4 h-4 mt-2 flex-shrink-0 ${
                              isDisabled
                                ? 'text-aurora-neutral-300'
                                : isActive
                                ? 'text-aurora-primary'
                                : 'text-aurora-neutral-400'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-aurora-neutral-200 bg-aurora-neutral-100 text-center text-[11px] text-aurora-neutral-500">
                Aurora Cloud Orchestrator · Enterprise Edition
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
