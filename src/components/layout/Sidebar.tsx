import React from 'react';
import {
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import {
  BriefcaseIcon as BriefcaseSolid,
} from '@heroicons/react/24/solid';

interface NavItem {
  icon: React.ElementType;
  activeIcon?: React.ElementType;
  label: string;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: BriefcaseIcon, activeIcon: BriefcaseSolid, label: 'Posted Jobs', active: true },
  { icon: UserGroupIcon, label: 'Candidates' },
  { icon: ChartBarIcon, label: 'Analytics' },
];

const SETTINGS_ITEMS: NavItem[] = [
  { icon: BuildingOffice2Icon, label: 'Company Profile' },
  { icon: LinkIcon, label: 'Integrations' },
];

const Sidebar: React.FC = () => (
  <aside className="w-52 bg-white border-r border-gray-200 min-h-screen flex flex-col py-5 px-3 flex-shrink-0">
    {/* Logo */}
    <div className="px-2 mb-6">
      <span className="text-lg font-extrabold text-purple-700 tracking-tight">UCTalent</span>
    </div>

    {/* Recruitment Suite */}
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
      Recruitment Suite
    </p>
    <nav className="flex flex-col gap-0.5 mb-6">
      {NAV_ITEMS.map(({ icon: Icon, activeIcon: ActiveIcon, label, active }) => {
        const DisplayIcon = active && ActiveIcon ? ActiveIcon : Icon;
        return (
          <button
            key={label}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium w-full text-left transition-colors ${
              active
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <DisplayIcon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        );
      })}
    </nav>

    {/* Settings */}
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
      Settings
    </p>
    <nav className="flex flex-col gap-0.5">
      {SETTINGS_ITEMS.map(({ icon: Icon, label }) => (
        <button
          key={label}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full text-left"
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
