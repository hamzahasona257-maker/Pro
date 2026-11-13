import React from 'react';
import { AlarmClock, Dumbbell, LayoutDashboard, Plus, SlidersHorizontal } from 'lucide-react';
import { Translations } from '../i18n/translations';
import { AppTab } from '../types/pro';

interface NavigationShellProps {
  activeTab: AppTab;
  t: Translations;
  onSelectTab: (tab: AppTab) => void;
  onCreateAlarm: () => void;
  children: React.ReactNode;
}

export function NavigationShell({
  activeTab,
  t,
  onSelectTab,
  onCreateAlarm,
  children,
}: NavigationShellProps) {
  const navItems: {
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'alarms', label: t.nav.alarms, icon: AlarmClock },
    { id: 'exercises', label: t.nav.exercises, icon: Dumbbell },
    { id: 'settings', label: t.nav.settings, icon: SlidersHorizontal },
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white flex flex-col lg:flex-row">
      {/* Desktop Logical Start Navigation Rail (auto-switches left/right in LTR/RTL) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:start-0 lg:border-e lg:border-[#233052] lg:bg-[#11182B] lg:px-5 lg:py-7">
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="flex items-baseline gap-2.5">
            <span className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-[#C8FF00]">
              {t.appName}
            </span>
            <span className="text-xs font-medium text-[#9AA7C2] whitespace-nowrap">
              {t.appTagline}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5" aria-label={t.nav.primaryLabel}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#C8FF00]/14 text-[#C8FF00]'
                    : 'text-[#9AA7C2] hover:text-white hover:bg-[#172038]'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-[#233052]">
          <button
            type="button"
            onClick={onCreateAlarm}
            className="w-full min-h-[48px] rounded-xl bg-[#C8FF00] text-[#0A0F1E] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#d6ff3d] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>{t.nav.newAlarm}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ps-64 pb-24 lg:pb-12">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-6 lg:py-9">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label={t.nav.mobileLabel}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#11182B]/95 backdrop-blur-md border-t border-[#233052]"
      >
        <div className="grid grid-cols-4 h-full max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  active ? 'text-[#C8FF00]' : 'text-[#9AA7C2] hover:text-white'
                }`}
              >
                <Icon className="h-[22px] w-[22px]" />
                <span className="text-[11px] font-semibold tracking-tight leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
