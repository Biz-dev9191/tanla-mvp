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
}

export const Header: React.FC<HeaderProps> = ({ activeTab = 'brief', onTabChange }) => {
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
      description: 'Configure customer profile, events & business objectives',
      icon: PlusCircle,
    },
    {
      id: 'control-room' as const,
      label: 'Agent Control Room',
      description: 'Observe multi-agent reasoning, decision traces & previews',
      icon: Activity,
    },
    {
      id: 'policy-tree' as const,
      label: 'Policy Tree',
      description: 'Inspect governance rules and upload dynamic policy docs',
      icon: GitBranch,
    },
    {
      id: 'knowledge-base' as const,
      label: 'Knowledge Base',
      description: 'Enterprise brand guidelines, tone rules & templates',
      icon: BookOpen,
    },
    {
      id: 'history' as const,
      label: 'Audit History',
      description: 'View previous orchestration runs and decision records',
      icon: History,
    },
  ];

  const currentActiveItem = navItems.find((item) => item.id === activeTab) || navItems[0];
  const CurrentIcon = currentActiveItem.icon;

  const handleSelectTab = (tabId: TabType) => {
    onTabChange?.(tabId);
    setIsMenuOpen(false);
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
                className="flex items-center space-x-2 px-3 py-2 bg-aurora-neutral-100 hover:bg-aurora-primary hover:text-white border border-aurora-neutral-300 text-aurora-neutral-900 rounded-md text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-aurora-primary/20"
                aria-label="Open Navigation Menu"
              >
                <Menu strokeWidth={1.5} className="w-4 h-4" />
                <span className="hidden sm:inline">Menu</span>
              </button>

              <div
                className="cursor-pointer flex items-center"
                onClick={() => handleSelectTab('brief')}
              >
                <BrandBadge />
              </div>
            </div>

            {/* Right: Clean Top Bar */}
            <div className="flex items-center space-x-2">
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
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-start space-x-3.5 p-3 rounded-lg text-left transition-all ${
                            isActive
                              ? 'bg-aurora-primary-light text-aurora-primary border border-aurora-primary/20 shadow-sm'
                              : 'text-aurora-neutral-700 hover:text-aurora-neutral-900 hover:bg-aurora-neutral-100 border border-transparent'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-md mt-0.5 flex-shrink-0 ${
                              isActive
                                ? 'bg-aurora-primary text-white'
                                : 'bg-aurora-neutral-200 text-aurora-neutral-700'
                            }`}
                          >
                            <Icon strokeWidth={1.5} className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-aurora-neutral-900">
                                {item.label}
                              </span>
                              {isActive && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-aurora-primary text-white px-2 py-0.5 rounded">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-aurora-neutral-500 mt-0.5 leading-snug">
                              {item.description}
                            </p>
                          </div>
                          <ChevronRight
                            strokeWidth={1.5}
                            className={`w-4 h-4 mt-2 flex-shrink-0 ${
                              isActive ? 'text-aurora-primary' : 'text-aurora-neutral-400'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Telemetry Status Card */}
                <div className="p-4 bg-aurora-neutral-100 rounded-lg border border-aurora-neutral-200 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-aurora-success animate-pulse"></span>
                    <span className="text-xs font-bold text-aurora-neutral-900">
                      Governance Engine Online
                    </span>
                  </div>
                  <div className="text-[11px] text-aurora-neutral-600 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>Deterministic Rules:</span>
                      <span className="font-bold text-aurora-neutral-900">Active v1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multi-Agent Core:</span>
                      <span className="font-bold text-aurora-neutral-900">6 Specialized Agents</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outbound Channels:</span>
                      <span className="font-bold text-aurora-neutral-900">WA, SMS, Email, Voice</span>
                    </div>
                  </div>
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
