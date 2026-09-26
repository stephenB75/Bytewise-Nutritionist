import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export type FriendPerson = {
  connectionId: number;
  userId: string;
  name: string;
  email: string;
  since: string;
  acceptedAt: string | null;
  sentByMe: boolean;
};
export type FriendsResponse = { friends: FriendPerson[]; incoming: FriendPerson[]; outgoing: FriendPerson[] };

export const FRIENDS_QUERY_KEY = ['/api/friends'];

type Snapshot = { outgoing: number[]; incoming: number[] };

function snapshotKey(userId: string) {
  return `bytewise-friends-seen-${userId}`;
}

function readSnapshot(userId: string): Snapshot | null {
  try {
    const raw = localStorage.getItem(snapshotKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Polls the friends list and reports changes since the last check: requests you sent that were
 * accepted, and new invites waiting for you. Shares its cache with FriendsPanel.
 */
export function useFriendUpdates(
  userId: string | undefined,
  notify: (type: 'success' | 'info', title: string, message: string) => void,
) {
  const query = useQuery<FriendsResponse>({
    queryKey: FRIENDS_QUERY_KEY,
    enabled: !!userId,
    retry: 1,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!userId || !query.data) return;
    const { friends, incoming, outgoing } = query.data;
    const previous = readSnapshot(userId);

    // On the first run on a device, past acceptances aren't replayed, but pending invites are still
    // announced because they need action.
    for (const person of friends) {
      if (previous?.outgoing.includes(person.connectionId)) {
        const message = `${person.name} accepted your request. You can now see each other's shared activity.`;
        notify('success', 'Friend request accepted', message);
        toast({ title: 'Friend request accepted', description: message });
      }
    }
    const newIncoming = incoming.filter(person => !previous?.incoming.includes(person.connectionId));
    if (newIncoming.length === 1) {
      const message = `${newIncoming[0].name} wants to connect. Open Profile → Friends & Family to accept.`;
      notify('info', 'New friend request', message);
      toast({ title: 'New friend request', description: message });
    } else if (newIncoming.length > 1) {
      const message = `${newIncoming.length} people want to connect. Open Profile → Friends & Family to accept.`;
      notify('info', 'New friend requests', message);
      toast({ title: 'New friend requests', description: message });
    }

    const next: Snapshot = {
      outgoing: outgoing.map(p => p.connectionId),
      incoming: incoming.map(p => p.connectionId),
    };
    try {
      localStorage.setItem(snapshotKey(userId), JSON.stringify(next));
    } catch {
      // Storage full or unavailable; notifications just won't be deduplicated.
    }
  }, [userId, query.data, notify]);

  return query;
}
