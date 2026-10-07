import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Activity, Flame, Footprints, HeartPulse, Moon, Sparkles, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { healthKitService, type AppleFitnessSummary, type SleepSummary } from '@/services/healthKit';
import { toast } from '@/hooks/use-toast';

type AppleFitnessCardProps = {
  onConnect?: () => void;
};

function formatMinutes(total: number): string {
  const safe = Math.max(0, Math.round(total));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
  if (hours > 0) return hours === 1 ? '1 hr' : `${hours} hr`;
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

function sleepRating(score: number): { label: string; className: string } {
  if (score >= 80) return { label: 'Good', className: 'text-green-700' };
  if (score >= 60) return { label: 'Fair', className: 'text-amber-700' };
  return { label: 'Poor', className: 'text-rose-700' };
}

function recoveryRating(score: number): { label: string; className: string } {
  if (score >= 80) return { label: 'Ready', className: 'text-green-700' };
  if (score >= 60) return { label: 'OK', className: 'text-amber-700' };
  return { label: 'Low', className: 'text-rose-700' };
}

function stressRating(score: number): { label: string; className: string } {
  if (score <= 30) return { label: 'Low', className: 'text-green-700' };
  if (score <= 55) return { label: 'Moderate', className: 'text-amber-700' };
  return { label: 'High', className: 'text-rose-700' };
}

function MetricCell({
  icon: Icon,
  iconClass,
  label,
  value,
  rating,
}: {
  icon: typeof Moon;
  iconClass: string;
  label: string;
  value: number;
  rating: { label: string; className: string };
}) {
  return (
    <div className="rounded-lg bg-amber-50/80 border border-amber-200/40 px-2 py-2 text-center">
      <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-gray-600 mb-0.5">
        <Icon className={`h-3 w-3 shrink-0 ${iconClass}`} aria-hidden />
        <span>{label}</span>
      </div>
      <p className="text-base sm:text-lg font-bold text-gray-900 tabular-nums leading-tight">{value}</p>
      <p className={`text-[10px] sm:text-xs font-semibold ${rating.className}`}>{rating.label}</p>
    </div>
  );
}

function SleepTile({ sleep }: { sleep: SleepSummary | null }) {
  return (
    <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50" data-testid="apple-fitness-sleep">
      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
        <Moon className="h-3.5 w-3.5 text-indigo-600" />
        Sleep last night
      </div>
      {sleep ? (
        <>
          <div className="grid grid-cols-3 gap-1.5 mb-2" data-testid="apple-fitness-sleep-metrics">
            <MetricCell
              icon={Moon}
              iconClass="text-indigo-600"
              label="Score"
              value={sleep.score}
              rating={sleepRating(sleep.score)}
            />
            <MetricCell
              icon={Sparkles}
              iconClass="text-emerald-600"
              label="Recovery"
              value={sleep.recovery}
              rating={recoveryRating(sleep.recovery)}
            />
            <MetricCell
              icon={Zap}
              iconClass="text-orange-600"
              label="Stress"
              value={sleep.stress}
              rating={stressRating(sleep.stress)}
            />
          </div>
          <p className="text-xs text-gray-700">{formatMinutes(sleep.asleepMinutes)} asleep</p>
          {sleep.hasStages && (
            <p className="text-xs text-gray-600">
              Deep {formatMinutes(sleep.deepMinutes)} · REM {formatMinutes(sleep.remMinutes)}
              {sleep.awakeMinutes > 0 ? ` · Awake ${formatMinutes(sleep.awakeMinutes)}` : ''}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-700">No sleep recorded last night</p>
      )}
    </div>
  );
}

export function AppleFitnessCard({ onConnect }: AppleFitnessCardProps) {
  const [summary, setSummary] = useState<AppleFitnessSummary | null>(null);
  const [connected, setConnected] = useState(false);
  const [available, setAvailable] = useState(false);
  const [needsRecoveryPermission, setNeedsRecoveryPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) setLoading(true);
    try {
      await healthKitService.initialize();
      await healthKitService.refreshAuthorization();
      const isAvailable = healthKitService.getAvailability();
      const isConnected = healthKitService.getAuthorizationStatus();
      setAvailable(isAvailable);
      setConnected(isConnected);
      setNeedsRecoveryPermission(healthKitService.needsRecoveryPermission());
      if (isAvailable && isConnected) {
        const data = await healthKitService.readTodayFitnessSummary();
        setSummary(data);
      } else {
        setSummary(null);
      }
    } finally {
      if (!opts?.quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onHealthChange = () => refresh({ quiet: true });
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh({ quiet: true });
    };
    const pollId = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh({ quiet: true });
    }, 60_000);
    window.addEventListener('apple-health-changed', onHealthChange);
    window.addEventListener('focus', onHealthChange);
    window.addEventListener('app-data-refresh', onHealthChange);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(pollId);
      window.removeEventListener('apple-health-changed', onHealthChange);
      window.removeEventListener('focus', onHealthChange);
      window.removeEventListener('app-data-refresh', onHealthChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refresh]);

  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const result = await healthKitService.requestPermissions();
      if (result.ok) {
        window.dispatchEvent(new CustomEvent('apple-health-changed'));
        toast({ title: 'Apple Health Connected', duration: 3000 });
      } else {
        toast({ title: 'Apple Health not connected', description: result.reason, variant: 'destructive', duration: 6000 });
        onConnect?.();
      }
    } finally {
      setConnecting(false);
    }
  };

  const isNativeIos =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/60 p-4 shadow-md" data-testid="apple-fitness-card">
      <div className="flex items-center gap-2 mb-3">
        <HeartPulse className="h-5 w-5 shrink-0 text-rose-600" />
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-900">Apple Fitness</h3>
          <p className="text-xs text-gray-700">Today from Apple Health</p>
        </div>
      </div>

      {loading && !summary ? (
        <p className="text-sm text-gray-600">Loading activity…</p>
      ) : !isNativeIos ? (
        <p className="text-sm text-gray-700">
          Open the Bytewise iPhone app and connect Apple Health in Profile to see steps, move calories, distance, and sleep here.
        </p>
      ) : !available ? (
        <p className="text-sm text-gray-700">Apple Health is not available on this device.</p>
      ) : !connected ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            Connect Apple Health to show today’s steps, move calories, distance, and sleep alongside nutrition.
          </p>
          <Button
            type="button"
            size="sm"
            className="on-color bg-rose-600 hover:bg-rose-700 disabled:opacity-75"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? 'Connecting…' : 'Connect Apple Health'}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                <Footprints className="h-3.5 w-3.5 text-blue-600" />
                Steps
              </div>
              <p className="text-lg font-bold text-gray-900">{summary?.steps ?? 0}</p>
            </div>
            <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                <Flame className="h-3.5 w-3.5 text-orange-600" />
                Move (cal)
              </div>
              <p className="text-lg font-bold text-gray-900">{summary?.activeCalories ?? 0}</p>
            </div>
            <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                <Activity className="h-3.5 w-3.5 text-purple-600" />
                Distance
              </div>
              <p className="text-lg font-bold text-gray-900">{summary?.distanceMiles ?? 0} mi</p>
            </div>
          </div>

          {needsRecoveryPermission ? (
            <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50 space-y-2">
              <p className="text-sm text-gray-700">
                Allow Bytewise to read sleep from Apple Health to see your sleep score here. Exercise and workouts are on the Exercise card below.
              </p>
              <Button
                type="button"
                size="sm"
                className="on-color bg-rose-600 hover:bg-rose-700 disabled:opacity-75"
                onClick={handleConnect}
                disabled={connecting}
                data-testid="button-allow-sleep-workouts"
              >
                {connecting ? 'Opening Apple Health…' : 'Allow sleep'}
              </Button>
            </div>
          ) : (
            <>
              <SleepTile sleep={summary?.sleep ?? null} />
              <p className="text-[11px] text-gray-600">
                Score, recovery, and stress are calculated by Bytewise from Apple Health sleep stages (duration, deep/REM, and night wakefulness)—not Apple’s Sleep Score. Exercise is on the card below.
              </p>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
