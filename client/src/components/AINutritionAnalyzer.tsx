import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Info, Lightbulb, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { getLocalDateKey } from '@/utils/dateUtils';

type Range = 'today' | 'week';
type Observation = { tone: 'suggestion' | 'positive' | 'info'; title: string; detail: string };
type InsightsResult = {
  range: Range;
  daysLogged: number;
  mealsCount: number;
  summary: string;
  observations: Observation[];
  source: 'ai' | 'rules';
  generatedAt: string;
};

const TONE_STYLES = {
  suggestion: { icon: Lightbulb, box: 'border-amber-300 bg-amber-50', iconColor: 'text-amber-700' },
  positive: { icon: CheckCircle2, box: 'border-green-300 bg-green-50', iconColor: 'text-green-700' },
  info: { icon: Info, box: 'border-sky-300 bg-sky-50', iconColor: 'text-sky-700' },
} as const;

// apiRequest throws "500: {json}"; show the server's message rather than the raw text.
function errorText(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  try {
    return JSON.parse(raw.slice(raw.indexOf('{'))).message || raw;
  } catch {
    return raw;
  }
}

export function AINutritionAnalyzer({ isSignedIn, onCreateAccount }: { isSignedIn: boolean; onCreateAccount: () => void }) {
  const [range, setRange] = useState<Range>('today');
  const [results, setResults] = useState<Partial<Record<Range, InsightsResult>>>({});
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const markStale = () => setStale(true);
    const events = ['refresh-meals', 'calories-logged', 'meals-updated'];
    events.forEach(name => window.addEventListener(name, markStale));
    return () => events.forEach(name => window.removeEventListener(name, markStale));
  }, []);

  const analyze = useMutation({
    mutationFn: async (selected: Range): Promise<InsightsResult> =>
      (await apiRequest('POST', '/api/ai/nutrition-insights', { today: getLocalDateKey(), range: selected })).json(),
    onSuccess: (data, selected) => {
      setResults(prev => ({ ...prev, [selected]: data }));
      setStale(false);
    },
  });

  const result = results[range];

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/40 p-4 shadow-lg" data-testid="ai-nutrition-analyzer">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-700" />
          AI Nutrition Analyzer
        </h3>
        <div className="flex rounded-full bg-amber-200/70 p-0.5" role="group" aria-label="Meals to analyze">
          {(['today', 'week'] as const).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${range === option ? 'bg-orange-700 on-color' : 'bg-amber-100 text-gray-800'}`}
              aria-pressed={range === option}
              data-testid={`button-analyzer-${option}`}
            >
              {option === 'today' ? 'Today' : '7 days'}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-3">Simple observations on the meals you've logged, like whether to add protein or cut back on carbs.</p>

      {!isSignedIn ? (
        <div className="rounded-lg bg-white/70 p-3 text-sm text-gray-800">
          Create a free account so your meals are saved, then the analyzer can look at them.
          <Button size="sm" className="on-color mt-2 w-full bg-orange-700 hover:bg-orange-800" onClick={onCreateAccount}>
            Create account
          </Button>
        </div>
      ) : (
        <>
          <Button
            onClick={() => analyze.mutate(range)}
            disabled={analyze.isPending}
            className="on-color w-full bg-orange-700 hover:bg-orange-800 disabled:opacity-75"
            data-testid="button-analyze-meals"
          >
            {analyze.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing…</>
            ) : result ? (
              <><RefreshCw className="h-4 w-4 mr-2" /> Analyze again</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Analyze {range === 'today' ? "today's" : 'this week\'s'} meals</>
            )}
          </Button>

          {analyze.isError && (
            <p className="mt-3 text-sm text-red-700" role="alert">{errorText(analyze.error)}</p>
          )}

          {result && (
            <div className="mt-4 space-y-2" data-testid="analyzer-results">
              {stale && (
                <p className="text-xs text-amber-900 bg-amber-100 rounded-md px-2 py-1">You've logged food since this analysis. Tap "Analyze again" to update it.</p>
              )}
              <p className="text-sm font-semibold text-gray-900" data-testid="text-analyzer-summary">{result.summary}</p>
              {result.observations.map((obs, index) => {
                const style = TONE_STYLES[obs.tone] || TONE_STYLES.info;
                const Icon = style.icon;
                return (
                  <div key={index} className={`flex gap-2.5 rounded-lg border p-3 ${style.box}`} data-testid={`analyzer-observation-${index}`}>
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.iconColor}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-950">{obs.title}</p>
                      <p className="text-sm text-gray-800">{obs.detail}</p>
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-600">
                {result.source === 'ai' ? 'Written by AI' : 'Quick check'} from {result.mealsCount} meal{result.mealsCount === 1 ? '' : 's'}
                {result.range === 'week' ? ` over ${result.daysLogged} day${result.daysLogged === 1 ? '' : 's'}` : ''}.
                General guidance only, not medical advice.
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
