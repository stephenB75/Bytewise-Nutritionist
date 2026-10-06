import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { usesNativeNotifications } from '@/services/localNotifications';

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
    const announce = (type: 'success' | 'info', title: string, message: string) => {
      // Bell + (on native) iOS banner happen in ModernFoodLayout.addNotification.
      notify(type, title, message);
      // Web has no OS banner — keep the in-app toast there only.
      if (!usesNativeNotifications()) {
        toast({ title, description: message });
      }
    };

    for (const person of friends) {
      if (previous?.outgoing.includes(person.connectionId)) {
        announce(
          'success',
          'Friend request accepted',
          `${person.name} accepted your request. You can now see each other's shared activity.`,
        );
      }
    }
    const newIncoming = incoming.filter(person => !previous?.incoming.includes(person.connectionId));
    if (newIncoming.length === 1) {
      announce(
        'info',
        'New friend request',
        `${newIncoming[0].name} wants to connect. Open Profile → Friends & Family to accept.`,
      );
    } else if (newIncoming.length > 1) {
      announce(
        'info',
        'New friend requests',
        `${newIncoming.length} people want to connect. Open Profile → Friends & Family to accept.`,
      );
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
