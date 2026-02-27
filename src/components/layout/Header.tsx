import React from 'react';
import { LockClosedIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

export type AppView = 'recruiter' | 'candidate';

interface HeaderProps {
  view: AppView;
  onViewChange: (v: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ view, onViewChange }) => {
  const { user, login, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
      {/* Left: brand + view toggle */}
      <div className="flex items-center gap-6">
        <span className="font-bold text-purple-700 text-sm tracking-tight">UCTalent</span>

        {/* View switcher */}
        <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
          <button
            onClick={() => onViewChange('candidate')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              view === 'candidate'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Find Jobs
          </button>
          <button
            onClick={() => onViewChange('recruiter')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              view === 'recruiter'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BriefcaseIcon className="w-3 h-3" />
            For Recruiters
          </button>
        </div>
      </div>

      {/* Right: auth */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onViewChange('recruiter')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              For Business
            </button>
            <button
              onClick={login}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            >
              <LockClosedIcon className="w-3.5 h-3.5" />
              Sign In
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
