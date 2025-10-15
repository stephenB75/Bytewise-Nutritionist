/**
 * Toaster Component
 * Displays toast notifications
 */

import React from 'react';
import { X } from 'lucide-react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToasterProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            toast.variant === 'destructive' ? 'border-l-4 border-red-500' : ''
          }`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-1">
                {toast.title && (
                  <p className="text-sm font-medium text-gray-900">
                    {toast.title}
                  </p>
                )}
                {toast.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {toast.description}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => onDismiss(toast.id)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
