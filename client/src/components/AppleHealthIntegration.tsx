/**
 * Apple Health Integration Component
 * Placeholder component for Apple Health integration
 */

import React from 'react';

interface AppleHealthIntegrationProps {
  onHealthDataSync?: (data: any) => void;
}

export function AppleHealthIntegration({ onHealthDataSync }: AppleHealthIntegrationProps) {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Apple Health Integration</h3>
      <p className="text-gray-600">Apple Health integration is not available in demo mode.</p>
    </div>
  );
}
