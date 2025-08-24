/**
 * Data Sync Indicator Component
 * Shows when data is being saved or restored
 */

import { useEffect, useState } from 'react';
import { Cloud, CloudOff, Check } from 'lucide-react';

export function DataSyncIndicator() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [tourVisible, setTourVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted flag after component is fully initialized
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only add event listeners after component is fully mounted
    if (!isMounted) return;

    // Listen for tour visibility changes to avoid overlaps
    const handleTourVisibility = (event: CustomEvent) => {
      // Use requestAnimationFrame to defer state updates
      requestAnimationFrame(() => {
        setTourVisible(event.detail?.visible || false);
      });
    };

    // Listen for sync events with deferred state updates
    const handleSyncStart = () => {
      requestAnimationFrame(() => {
        setSyncStatus('syncing');
        setMessage('Saving your data...');
      });
    };

    const handleSyncSuccess = (event: CustomEvent) => {
      requestAnimationFrame(() => {
        setSyncStatus('success');
        setMessage(event.detail?.message || 'Data saved');
        setTimeout(() => setSyncStatus('idle'), 3000);
      });
    };

    const handleSyncError = () => {
      requestAnimationFrame(() => {
        setSyncStatus('error');
        setMessage('Failed to sync data');
        setTimeout(() => setSyncStatus('idle'), 5000);
      });
    };

    const handleDataRestored = (event: CustomEvent) => {
      if (event.detail?.itemsRestored > 0) {
        requestAnimationFrame(() => {
          setSyncStatus('success');
          setMessage(`Restored ${event.detail.itemsRestored} items`);
          setTimeout(() => setSyncStatus('idle'), 4000);
        });
      }
    };

    window.addEventListener('tour-visibility', handleTourVisibility as EventListener);
    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener('sync-success', handleSyncSuccess as EventListener);
    window.addEventListener('sync-error', handleSyncError);
    window.addEventListener('data-restored', handleDataRestored as EventListener);

    return () => {
      window.removeEventListener('tour-visibility', handleTourVisibility as EventListener);
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener('sync-success', handleSyncSuccess as EventListener);
      window.removeEventListener('sync-error', handleSyncError);
      window.removeEventListener('data-restored', handleDataRestored as EventListener);
    };
  }, [isMounted]);

  if (syncStatus === 'idle') return null;

  return (
    <div className={`fixed z-55 animate-fade-in ${
      tourVisible ? 'bottom-20 left-4' : 'bottom-20 right-4'
    }`} data-testid="data-sync-indicator">
      <div className={`
        flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm
        ${syncStatus === 'syncing' ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-gray-900' : ''}
        ${syncStatus === 'success' ? 'bg-gradient-to-br from-green-100 to-green-200 text-gray-900' : ''}
        ${syncStatus === 'error' ? 'bg-gradient-to-br from-red-100 to-red-200 text-gray-900' : ''}
      `}>
        {syncStatus === 'syncing' && (
          <>
            <Cloud className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">{message}</span>
          </>
        )}
        {syncStatus === 'success' && (
          <>
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">{message}</span>
          </>
        )}
        {syncStatus === 'error' && (
          <>
            <CloudOff className="w-4 h-4" />
            <span className="text-sm font-medium">{message}</span>
          </>
        )}
      </div>
    </div>
  );
}