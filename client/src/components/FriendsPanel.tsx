import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Check, CheckCircle2, Clock, Droplets, Loader2, Share2, Timer, Trash2, UserPlus, Users, Utensils, X, BarChart3 } from 'lucide-react';
import { FRIENDS_QUERY_KEY, type FriendsResponse } from '@/hooks/useFriendUpdates';

const FEED_LIMIT = 4;
type Activity = {
  id: number;
  type: 'summary' | 'meal' | 'fast' | 'water';
  title: string;
  details: Record<string, string | number | null> | null;
  note: string | null;
  createdAt: string;
  isMine: boolean;
  author: string;
};
type LoggedMeal = { id: number; name: string | null; mealType: string; date: string; totalCalories: string };
type FastingSession = { id: string; planName: string; status: string; actualDuration: number | null; completedAt: string | null };

const FRIENDS_KEY = FRIENDS_QUERY_KEY;
const FEED_KEY = ['/api/activity-feed'];

const TYPE_ICONS = { summary: BarChart3, meal: Utensils, fast: Timer, water: Droplets } as const;

// apiRequest throws "404: {json}"; show the server's message rather than the raw text.
function errorText(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const json = raw.slice(raw.indexOf('{'));
  try {
    return JSON.parse(json).message || raw;
  } catch {
    return raw;
  }
}

function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

function shortDate(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
}

function describe(activity: Activity): string {
  const d = activity.details || {};
  switch (activity.type) {
    case 'summary':
      return [
        `${d.calories ?? 0} kcal from ${d.meals ?? 0} meal${d.meals === 1 ? '' : 's'}`,
        `${d.protein ?? 0}g protein`,
        `${d.water ?? 0} glasses of water`,
        d.fast ? `Fast: ${d.fast}` : null,
      ].filter(Boolean).join(' · ');
    case 'meal':
      return [d.mealType, d.calories != null ? `${d.calories} kcal` : null].filter(Boolean).join(' · ');
    case 'fast':
      return d.hours != null ? `${d.hours} hours` : '';
    default:
      return '';
  }
}

function refreshAll() {
  queryClient.invalidateQueries({ queryKey: FRIENDS_KEY });
  queryClient.invalidateQueries({ queryKey: FEED_KEY });
}

export function FriendsPanel() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [inviteResult, setInviteResult] = useState<{ status: 'pending' | 'accepted'; message: string } | null>(null);

  const friendsQuery = useQuery<FriendsResponse>({ queryKey: FRIENDS_KEY, retry: 1, refetchInterval: 30_000 });
  const feedQuery = useQuery<{ activities: Activity[] }>({ queryKey: FEED_KEY, retry: 1 });
  const mealsQuery = useQuery<LoggedMeal[]>({ queryKey: ['/api/meals/logged'], retry: 1 });
  const fastsQuery = useQuery<FastingSession[]>({ queryKey: ['/api/fasting/history'], retry: 1 });

  const today = localDateKey();
  const todaysMeals = (Array.isArray(mealsQuery.data) ? mealsQuery.data : []).filter(meal => meal.date?.slice(0, 10) === today);
  const lastFast = (Array.isArray(fastsQuery.data) ? fastsQuery.data : [])
    .filter(fast => fast.status === 'completed' && fast.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
  const friends = friendsQuery.data?.friends || [];

  const invite = useMutation({
    mutationFn: async () => (await apiRequest('POST', '/api/friends/invite', { email })).json(),
    onMutate: () => setInviteResult(null),
    onSuccess: (data: { status: 'pending' | 'accepted'; message: string }) => {
      const sentTo = email.trim();
      setEmail('');
      const message = data.status === 'accepted'
        ? data.message
        : `Request sent to ${sentTo}. It shows below as "Waiting" until they accept.`;
      setInviteResult({ status: data.status, message });
      toast({ title: data.status === 'accepted' ? 'Connected' : 'Request sent', description: message });
      refreshAll();
    },
    onError: (error) => toast({ title: 'Request not sent', description: errorText(error), variant: 'destructive' }),
  });

  const respond = useMutation({
    mutationFn: async ({ id, accept }: { id: number; accept: boolean }) =>
      apiRequest(accept ? 'POST' : 'DELETE', accept ? `/api/friends/${id}/accept` : `/api/friends/${id}`),
    onSuccess: refreshAll,
    onError: (error) => toast({ title: 'Something went wrong', description: errorText(error), variant: 'destructive' }),
  });

  const share = useMutation({
    mutationFn: async (payload: { kind: 'summary' } | { kind: 'item'; type: 'meal' | 'fast'; title: string; details: Record<string, string | number | null> }) => {
      if (payload.kind === 'summary') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return apiRequest('POST', '/api/activities/share-summary', {
          date: today,
          dayStart: start.toISOString(),
          dayEnd: end.toISOString(),
          note: note || undefined,
        });
      }
      return apiRequest('POST', '/api/activities/share', {
        type: payload.type,
        title: payload.title,
        details: payload.details,
        note: note || undefined,
      });
    },
    onSuccess: () => {
      setNote('');
      toast({ title: 'Shared', description: friends.length ? 'Your friends and family can see it now.' : 'Posted. Invite someone so they can see it.' });
      queryClient.invalidateQueries({ queryKey: FEED_KEY });
    },
    onError: (error) => toast({ title: 'Not shared', description: errorText(error), variant: 'destructive' }),
  });

  const removeActivity = useMutation({
    mutationFn: async (id: number) => apiRequest('DELETE', `/api/activities/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FEED_KEY }),
  });

  const incoming = friendsQuery.data?.incoming || [];
  const outgoing = friendsQuery.data?.outgoing || [];
  const activities = (feedQuery.data?.activities || []).slice(0, FEED_LIMIT);

  return (
    <div className="space-y-6" data-testid="friends-panel" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* Invite */}
      <section className="space-y-2">
        <p className="text-sm font-medium text-gray-900">Invite a friend or family member</p>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (email.trim()) invite.mutate();
          }}
        >
          <Input
            type="email"
            inputMode="email"
            autoCapitalize="none"
            placeholder="Their Bytewise account email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="bg-white border-amber-200 text-gray-900"
            data-testid="input-friend-email"
          />
          <Button type="submit" disabled={!email.trim() || invite.isPending} className="on-color shrink-0 bg-orange-700 hover:bg-orange-800 disabled:opacity-75">
            {invite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            <span className="ml-1.5">Invite</span>
          </Button>
        </form>
        {inviteResult && (
          <p
            className="flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 p-2.5 text-sm text-green-900"
            role="status"
            data-testid="text-invite-result"
          >
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-700" />
            {inviteResult.message}
          </p>
        )}
        <p className="text-xs text-gray-600">They need a Bytewise account. You only see what each other chooses to share.</p>
      </section>

      {incoming.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Invites for you</p>
          {incoming.map(person => (
            <div key={person.connectionId} className="flex items-center justify-between gap-2 rounded-lg bg-white/80 border border-orange-200 p-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-950 truncate">{person.name}</p>
                <p className="text-xs text-gray-600 truncate">{person.email}</p>
                <p className="text-xs text-orange-800 mt-0.5">Wants to connect · {shortDate(person.since)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" className="on-color bg-green-700 hover:bg-green-800" onClick={() => respond.mutate({ id: person.connectionId, accept: true })}>
                  <Check className="h-4 w-4 mr-1" /> Accept
                </Button>
                <Button size="sm" variant="outline" onClick={() => respond.mutate({ id: person.connectionId, accept: false })} aria-label={`Decline ${person.name}`}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Connections */}
      <section className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <Users className="h-4 w-4 text-orange-700" /> Your circle ({friends.length})
        </p>
        {friendsQuery.isLoading ? (
          <p className="text-sm text-gray-600">Loading…</p>
        ) : friendsQuery.isError && !friendsQuery.data ? (
          <p className="text-sm text-red-700">Couldn't load your connections. {errorText(friendsQuery.error)}</p>
        ) : friends.length === 0 && outgoing.length === 0 ? (
          <p className="text-sm text-gray-700 bg-white/60 rounded-lg p-3">No one yet. Invite someone above to start sharing.</p>
        ) : (
          <ul className="space-y-2">
            {friends.map(person => (
              <li key={person.connectionId} className="flex items-center justify-between gap-2 rounded-lg bg-white/80 border border-amber-200 p-3" data-testid={`friend-accepted-${person.connectionId}`}>
                <div className="min-w-0">
                  <p className="font-medium text-gray-950 truncate">{person.name}</p>
                  <p className="text-xs text-gray-600 truncate">{person.email}</p>
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    <CheckCircle2 className="h-3 w-3" />
                    {person.sentByMe ? 'Accepted your request' : 'Connected'}
                    {person.acceptedAt ? ` · ${shortDate(person.acceptedAt)}` : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-700 shrink-0"
                  onClick={() => {
                    if (confirm(`Stop sharing with ${person.name}?`)) respond.mutate({ id: person.connectionId, accept: false });
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
            {outgoing.map(person => (
              <li key={person.connectionId} className="flex items-center justify-between gap-2 rounded-lg bg-white/60 border border-dashed border-amber-300 p-3" data-testid={`friend-pending-${person.connectionId}`}>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{person.name}</p>
                  <p className="text-xs text-gray-600 truncate">{person.email}</p>
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                    <Clock className="h-3 w-3" />
                    Request sent {shortDate(person.since)} · Waiting for them to accept
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="text-gray-700 shrink-0" onClick={() => respond.mutate({ id: person.connectionId, accept: false })}>
                  Cancel
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Share */}
      <section className="space-y-3 rounded-xl bg-white/70 border border-amber-200 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <Share2 className="h-4 w-4 text-orange-700" /> Share an activity
        </p>
        <Input
          placeholder="Add a note (optional)"
          maxLength={280}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="bg-white border-amber-200 text-gray-900"
        />
        <Button
          onClick={() => share.mutate({ kind: 'summary' })}
          disabled={share.isPending}
          className="on-color w-full bg-orange-700 hover:bg-orange-800 disabled:opacity-75"
          data-testid="button-share-summary"
        >
          <BarChart3 className="h-4 w-4 mr-2" /> Share today's summary
        </Button>

        {todaysMeals.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-700">Or share a meal from today</p>
            {todaysMeals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between gap-2 rounded-lg bg-white border border-amber-100 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-gray-900 truncate">{meal.name || meal.mealType}</p>
                  <p className="text-xs text-gray-600">{Math.round(Number(meal.totalCalories) || 0)} kcal</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={share.isPending}
                  onClick={() => share.mutate({
                    kind: 'item',
                    type: 'meal',
                    title: meal.name || meal.mealType,
                    details: { mealType: meal.mealType, calories: Math.round(Number(meal.totalCalories) || 0) },
                  })}
                >
                  Share
                </Button>
              </div>
            ))}
          </div>
        )}

        {lastFast && (
          <Button
            variant="outline"
            className="w-full"
            disabled={share.isPending}
            onClick={() => share.mutate({
              kind: 'item',
              type: 'fast',
              title: `Completed a ${lastFast.planName} fast`,
              details: { hours: lastFast.actualDuration ? Math.round(lastFast.actualDuration / 3600000) : null },
            })}
          >
            <Timer className="h-4 w-4 mr-2" /> Share my last completed fast
          </Button>
        )}
      </section>

      {/* Feed */}
      <section className="space-y-2">
        <p className="text-sm font-medium text-gray-900">Recent activity</p>
        {feedQuery.isLoading ? (
          <p className="text-sm text-gray-600">Loading…</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-700 bg-white/60 rounded-lg p-3">Nothing shared yet.</p>
        ) : (
          <ul className="space-y-2" data-testid="activity-feed">
            {activities.map(activity => {
              const Icon = TYPE_ICONS[activity.type] || Share2;
              return (
                <li key={activity.id} className="flex gap-3 rounded-lg bg-white/80 border border-amber-200 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <Icon className="h-4 w-4 text-orange-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-950">
                      <span className="font-semibold">{activity.isMine ? 'You' : activity.author}</span>
                      {' · '}
                      {activity.title}
                    </p>
                    {describe(activity) && <p className="text-xs text-gray-700 mt-0.5">{describe(activity)}</p>}
                    {activity.note && <p className="text-sm text-gray-800 mt-1">“{activity.note}”</p>}
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.createdAt)}</p>
                  </div>
                  {activity.isMine && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-gray-500"
                      onClick={() => removeActivity.mutate(activity.id)}
                      aria-label="Delete shared activity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
