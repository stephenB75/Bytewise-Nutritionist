import { APP_BUILD, APP_VERSION } from '@/lib/appVersion';

export function AppVersionInfo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={compact ? 'text-center' : 'rounded-xl bg-white/70 px-4 py-3 ring-1 ring-amber-200'}
      data-testid="app-version"
    >
      {!compact && <p className="mb-2 text-xs font-semibold text-gray-800">App version</p>}
      <dl className={`flex ${compact ? 'justify-center gap-6' : 'justify-between gap-4'} text-sm`}>
        <div className="min-w-0">
          <dt className="text-xs text-gray-600">Version</dt>
          <dd className="font-semibold tabular-nums text-gray-950" data-testid="text-app-version-number">
            {APP_VERSION}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-gray-600">Build</dt>
          <dd className="font-semibold tabular-nums text-gray-950" data-testid="text-app-build-number">
            {APP_BUILD}
          </dd>
        </div>
      </dl>
    </div>
  );
}
