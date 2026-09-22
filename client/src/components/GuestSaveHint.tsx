import React from 'react';

type GuestSaveHintProps = {
  onCreateAccount: () => void;
  variant?: 'dashboard' | 'journal';
};

export function GuestSaveHint({ onCreateAccount, variant = 'dashboard' }: GuestSaveHintProps) {
  if (variant === 'journal') {
    return (
      <p className="mb-4 text-sm leading-relaxed text-gray-800/90">
        Entries on this device stay here until you{' '}
        <button
          type="button"
          onClick={onCreateAccount}
          className="font-semibold text-orange-500 underline-offset-2 hover:text-orange-600 hover:underline"
        >
          save with an account
        </button>
        .
      </p>
    );
  }

  return (
    <p className="mb-3 text-sm leading-relaxed text-gray-800/90">
      You can track meals now.{' '}
      <button
        type="button"
        onClick={onCreateAccount}
        className="font-semibold text-orange-500 underline-offset-2 hover:text-orange-600 hover:underline"
      >
        Create an account
      </button>{' '}
      on Profile to save your entries.
    </p>
  );
}
