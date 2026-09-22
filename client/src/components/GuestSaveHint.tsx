import React from 'react';

type GuestSaveHintProps = {
  onCreateAccount: () => void;
  variant?: 'dashboard' | 'journal';
  className?: string;
};

export function GuestSaveHint({ onCreateAccount, variant = 'dashboard', className = '' }: GuestSaveHintProps) {
  if (variant === 'journal') {
    return (
      <p className={`mb-4 text-sm leading-relaxed text-gray-900 ${className}`}>
        Meal history is saved to your account only.{' '}
        <button
          type="button"
          onClick={onCreateAccount}
          data-testid="guest-create-account-link"
          className="guest-inline-link font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700"
        >
          save with an account
        </button>
        .
      </p>
    );
  }

  return (
    <p className={`text-sm leading-relaxed text-gray-900 ${className}`}>
      Explore the app—{' '}
      <button
        type="button"
        onClick={onCreateAccount}
        data-testid="guest-create-account-link"
        className="guest-inline-link font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700"
      >
        Create an account
      </button>{' '}
      on Profile to save your entries.
    </p>
  );
}
