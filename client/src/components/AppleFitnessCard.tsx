import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Flame, Footprints, HeartPulse, Moon, Sparkles, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  healthKitService,
  type AppleFitnessSummary,
  type BloodPressureDay,
  type SleepSummary,
} from '@/services/healthKit';
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

/** American Heart Association categories, from the higher of the two numbers' categories. */
function bloodPressureCategory(systolic: number, diastolic: number): { label: string; className: string } {
  if (systolic > 180 || diastolic > 120) return { label: 'Very high', className: 'text-rose-800' };
  if (systolic >= 140 || diastolic >= 90) return { label: 'High (stage 2)', className: 'text-rose-700' };
  if (systolic >= 130 || diastolic >= 80) return { label: 'High (stage 1)', className: 'text-orange-700' };
  if (systolic >= 120) return { label: 'Elevated', className: 'text-amber-700' };
  return { label: 'Normal', className: 'text-green-700' };
}

function BloodPressureTile({ days }: { days: BloodPressureDay[] }) {
  const latest = days[days.length - 1];
  const category = bloodPressureCategory(latest.systolic, latest.diastolic);
  const data = days.map((day) => ({
    ...day,
    label: day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));
  const low = Math.min(...days.map((day) => day.diastolic));
  const high = Math.max(...days.map((day) => day.systolic));

  return (
    <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50" data-testid="apple-fitness-blood-pressure">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <HeartPulse className="h-3.5 w-3.5 text-rose-600" />
          Blood pressure · last 30 days
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-gray-900 tabular-nums leading-tight">
            {latest.systolic}/{latest.diastolic}
            <span className="ml-1 text-[11px] font-medium text-gray-600">mmHg</span>
          </p>
          <p className={`text-[11px] font-semibold ${category.className}`}>{category.label}</p>
        </div>
      </div>
      <div className="h-32" aria-label="Blood pressure readings, last 30 days">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#374151' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              domain={[Math.max(0, Math.floor((low - 10) / 10) * 10), Math.ceil((high + 10) / 10) * 10]}
              tick={{ fontSize: 10, fill: '#374151' }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${value} mmHg`, name]}
              labelFormatter={(label, payload) => {
                const readings = payload?.[0]?.payload?.readings ?? 0;
                return readings > 1 ? `${label} · average of ${readings} readings` : label;
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Line
              type="monotone"
              dataKey="systolic"
              name="Systolic"
              stroke="#e11d48"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              name="Diastolic"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-700">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-600" />Systolic (top)</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600" />Diastolic (bottom)</span>
      </div>
      <p className="mt-1 text-[11px] text-gray-600">
        From readings saved in Apple Health (for example a blood pressure cuff). Days with more than one reading show the average.
      </p>
    </div>
  );
}

export function AppleFitnessCard({ onConnect }: AppleFitnessCardProps) {
  const [summary, setSummary] = useState<AppleFitnessSummary | null>(null);
  const [connected, setConnected] = useState(false);
  const [available, setAvailable] = useState(false);
  const [needsRecoveryPermission, setNeedsRecoveryPermission] = useState(false);
  const [needsBloodPressurePermission, setNeedsBloodPressurePermission] = useState(false);
  const [bloodPressure, setBloodPressure] = useState<BloodPressureDay[]>([]);
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
      setNeedsBloodPressurePermission(healthKitService.needsBloodPressurePermission());
      if (isAvailable && isConnected) {
        const [data, pressure] = await Promise.all([
          healthKitService.readTodayFitnessSummary(),
          healthKitService.readBloodPressureHistory(30),
        ]);
        setSummary(data);
        setBloodPressure(pressure);
      } else {
        setSummary(null);
        setBloodPressure([]);
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

          {bloodPressure.length > 0 ? (
            <BloodPressureTile days={bloodPressure} />
          ) : needsBloodPressurePermission && !needsRecoveryPermission ? (
            <div className="rounded-lg bg-white/70 p-3 border border-amber-200/50 space-y-2">
              <p className="text-sm text-gray-700">
                Allow Bytewise to read blood pressure from Apple Health to chart your readings here.
              </p>
              <Button
                type="button"
                size="sm"
                className="on-color bg-rose-600 hover:bg-rose-700 disabled:opacity-75"
                onClick={handleConnect}
                disabled={connecting}
                data-testid="button-allow-blood-pressure"
              >
                {connecting ? 'Opening Apple Health…' : 'Allow blood pressure'}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
