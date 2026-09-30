import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getAuthHeaders } from '@/lib/queryClient';
import { resolveApiUrl } from '@/lib/apiUrl';
import { toSquareJpeg } from '@/utils/resizeImage';
import { useAuth } from '@/hooks/useAuth';

export const PROFILE_PHOTO_QUERY_KEY = ['/api/user/avatar'] as const;
export const USER_PHOTOS_QUERY_KEY = ['/api/user/photos'] as const;

// Signed URLs last a day; refetch well before that so an open app never shows a broken image.
const STALE_MS = 6 * 60 * 60 * 1000;

async function errorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return body?.message || fallback;
  } catch {
    return response.status === 413 ? 'That photo is too large.' : fallback;
  }
}

export function useProfilePhoto() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const photoQuery = useQuery<{ url: string | null }>({
    queryKey: PROFILE_PHOTO_QUERY_KEY,
    enabled: !!user,
    staleTime: STALE_MS,
    retry: 1,
  });

  const onChanged = (url: string | null) => {
    queryClient.setQueryData(PROFILE_PHOTO_QUERY_KEY, { url });
    queryClient.invalidateQueries({ queryKey: USER_PHOTOS_QUERY_KEY });
  };

  const upload = useMutation({
    retry: false,
    mutationFn: async (file: File) => {
      const image = await toSquareJpeg(file);
      const response = await fetch(resolveApiUrl('/api/user/avatar'), {
        method: 'POST',
        headers: { ...(await getAuthHeaders()), 'Content-Type': 'image/jpeg' },
        body: image,
        credentials: 'include',
      });
      if (!response.ok) throw new Error(await errorMessage(response, 'Could not save your profile photo.'));
      return (await response.json()) as { url: string | null };
    },
    onSuccess: (data) => onChanged(data.url),
  });

  const choose = useMutation({
    retry: false,
    mutationFn: async (photoId: number) => {
      const response = await apiRequest('PUT', '/api/user/avatar', { photoId });
      return (await response.json()) as { url: string | null };
    },
    onSuccess: (data) => onChanged(data.url),
  });

  const remove = useMutation({
    retry: false,
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/user/avatar');
    },
    onSuccess: () => onChanged(null),
  });

  return {
    photoUrl: user ? photoQuery.data?.url ?? null : null,
    upload,
    choose,
    remove,
  };
}
