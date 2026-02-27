// Requirement #11: Confirmation step before hiring a candidate.
// Business Rule: Hiring is irreversible (terminal state), so a 2-step confirmation
// is required - recruiter must type "CONFIRM" to proceed.
// This prevents accidental clicks on this critical action.

import React, { useState, useCallback } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface HireConfirmModalProps {
  candidateName: string;
  isLoading: boolean;
  onConfirm: (confirmToken: string) => void;
  onCancel: () => void;
}

const CONFIRM_KEYWORD = 'CONFIRM';

const HireConfirmModal: React.FC<HireConfirmModalProps> = ({
  candidateName,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState('');
  const isConfirmed = inputValue === CONFIRM_KEYWORD;

  const handleConfirm = useCallback(() => {
    if (isConfirmed) {
      // Generate a simple client-side confirm token to pass to the API
      const confirmToken = `confirm_${Date.now()}`;
      onConfirm(confirmToken);
    }
  }, [isConfirmed, onConfirm]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-full">
              <ExclamationTriangleIcon className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Confirm Hiring</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-600 mb-1">
            You are about to hire{' '}
            <span className="font-semibold text-gray-900">{candidateName}</span>.
          </p>
          <p className="text-sm text-red-500 font-medium mb-4">
            ⚠ This action is permanent and cannot be undone.
          </p>

          <p className="text-sm text-gray-700 mb-2">
            Type{' '}
            <code className="bg-gray-100 border border-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
              {CONFIRM_KEYWORD}
            </code>{' '}
            to proceed:
          </p>

          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder="Type CONFIRM"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition mb-4"
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isConfirmed || isLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Hire'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HireConfirmModal;
