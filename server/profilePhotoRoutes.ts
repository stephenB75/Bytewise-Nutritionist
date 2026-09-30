import express, { type Express, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { isAuthenticated, supabaseAdmin } from './supabaseAuth';
import { supabaseStorageService } from './supabaseStorage';

// Profile photos live in the private bucket under avatars/<userId>/ and are tracked in
// user_photos (the same table the photo manager lists). users.profile_image_url holds the
// storage path of the chosen one; clients get short-lived signed URLs to display it.
const BUCKET = supabaseStorageService.bucketName;
const AVATAR_FOLDER = 'avatars';
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const MAX_PHOTOS_PER_USER = 20;
const SIGNED_URL_TTL_SEC = 24 * 60 * 60;

const IMAGE_TYPES: Record<string, { ext: string; matches: (b: Buffer) => boolean }> = {
  'image/jpeg': { ext: 'jpg', matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', matches: (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
  'image/webp': {
    ext: 'webp',
    matches: (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
};

type PhotoRow = {
  id: number;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number | null;
  uploaded_at: string;
  analysis_id: string | null;
};

const PHOTO_COLUMNS = 'id, file_name, storage_path, mime_type, file_size, uploaded_at, analysis_id';

function avatarPrefix(userId: string) {
  return `${AVATAR_FOLDER}/${userId}/`;
}

function asUtc(value: string) {
  return /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
}

async function currentAvatarPath(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.from('users').select('profile_image_url').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data?.profile_image_url || null;
}

async function setAvatarPath(userId: string, path: string | null) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ profile_image_url: path, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('Profile not found');
}

async function signedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SEC);
  return error ? null : data.signedUrl;
}

/** Resolves a stored profile_image_url to something an <img> can load. */
async function displayUrl(userId: string, stored: string | null): Promise<string | null> {
  if (!stored) return null;
  if (/^https?:\/\//i.test(stored)) return stored;
  return stored.startsWith(avatarPrefix(userId)) ? signedUrl(stored) : null;
}

async function deletePhotos(userId: string, rows: PhotoRow[]) {
  if (rows.length === 0) return;
  const { error: storageError } = await supabaseAdmin.storage.from(BUCKET).remove(rows.map((row) => row.storage_path));
  if (storageError) console.warn('⚠️ Photo storage delete failed:', storageError.message);

  const { error } = await supabaseAdmin
    .from('user_photos')
    .delete()
    .eq('user_id', userId)
    .in('id', rows.map((row) => row.id));
  if (error) throw error;

  const avatar = await currentAvatarPath(userId);
  if (avatar && rows.some((row) => row.storage_path === avatar)) {
    await setAvatarPath(userId, null);
  }
}

const photoIdSchema = z.coerce.number().int().positive();

export function registerProfilePhotoRoutes(app: Express) {
  app.get('/api/user/avatar', isAuthenticated, async (req: any, res: Response) => {
    try {
      const stored = await currentAvatarPath(req.user.id);
      res.json({ url: await displayUrl(req.user.id, stored) });
    } catch (error: any) {
      console.error('❌ Failed to load avatar:', error?.message || error);
      res.status(500).json({ message: 'Failed to load profile photo' });
    }
  });

  app.post(
    '/api/user/avatar',
    isAuthenticated,
    express.raw({ type: Object.keys(IMAGE_TYPES), limit: MAX_UPLOAD_BYTES }),
    async (req: any, res: Response) => {
      const userId: string = req.user.id;
      const mimeType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
      const type = IMAGE_TYPES[mimeType];
      const body: Buffer | undefined = Buffer.isBuffer(req.body) ? req.body : undefined;
      if (!type || !body?.length || !type.matches(body)) {
        return res.status(400).json({ message: 'Choose a JPEG, PNG, or WebP image.' });
      }

      try {
        const { count, error: countError } = await supabaseAdmin
          .from('user_photos')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        if (countError) throw countError;
        if ((count || 0) >= MAX_PHOTOS_PER_USER) {
          return res.status(409).json({
            message: `You have ${MAX_PHOTOS_PER_USER} uploaded photos. Delete some in Manage Uploaded Photos first.`,
          });
        }

        const path = `${avatarPrefix(userId)}${randomUUID()}.${type.ext}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(path, body, { contentType: mimeType, upsert: false });
        if (uploadError) throw uploadError;

        const { data: photo, error: insertError } = await supabaseAdmin
          .from('user_photos')
          .insert({
            user_id: userId,
            file_name: `Profile photo.${type.ext}`,
            storage_path: path,
            storage_url: path,
            mime_type: mimeType,
            file_size: body.length,
            photo_metadata: { kind: 'avatar' },
          })
          .select(PHOTO_COLUMNS)
          .single();
        if (insertError) {
          await supabaseAdmin.storage.from(BUCKET).remove([path]);
          throw insertError;
        }

        await setAvatarPath(userId, path);
        res.json({ success: true, url: await signedUrl(path), photoId: photo.id });
      } catch (error: any) {
        console.error('❌ Avatar upload failed:', error?.message || error);
        res.status(500).json({ message: 'Could not save your profile photo. Please try again.' });
      }
    },
  );

  app.put('/api/user/avatar', isAuthenticated, async (req: any, res: Response) => {
    const parsed = photoIdSchema.safeParse(req.body?.photoId);
    if (!parsed.success) return res.status(400).json({ message: 'Valid photo ID required' });

    try {
      const { data: photo, error } = await supabaseAdmin
        .from('user_photos')
        .select('storage_path')
        .eq('id', parsed.data)
        .eq('user_id', req.user.id)
        .maybeSingle();
      if (error) throw error;
      if (!photo || !photo.storage_path.startsWith(avatarPrefix(req.user.id))) {
        return res.status(404).json({ message: 'Photo not found' });
      }
      await setAvatarPath(req.user.id, photo.storage_path);
      res.json({ success: true, url: await signedUrl(photo.storage_path) });
    } catch (error: any) {
      console.error('❌ Failed to set avatar:', error?.message || error);
      res.status(500).json({ message: 'Could not update your profile photo' });
    }
  });

  app.delete('/api/user/avatar', isAuthenticated, async (req: any, res: Response) => {
    try {
      await setAvatarPath(req.user.id, null);
      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Failed to clear avatar:', error?.message || error);
      res.status(500).json({ message: 'Could not remove your profile photo' });
    }
  });

  app.get('/api/user/photos', isAuthenticated, async (req: any, res: Response) => {
    const userId: string = req.user.id;
    try {
      const [{ data: rows, error }, avatar] = await Promise.all([
        supabaseAdmin
          .from('user_photos')
          .select(PHOTO_COLUMNS)
          .eq('user_id', userId)
          .order('uploaded_at', { ascending: false })
          .limit(100),
        currentAvatarPath(userId),
      ]);
      if (error) throw error;

      const photos = (rows || []) as PhotoRow[];
      const paths = photos.map((photo) => photo.storage_path);
      const { data: signed } = paths.length
        ? await supabaseAdmin.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_TTL_SEC)
        : { data: [] as Array<{ path: string | null; signedUrl: string }> };
      const urlByPath = new Map((signed || []).map((item) => [item.path, item.signedUrl]));

      res.json({
        success: true,
        photos: photos.map((photo) => ({
          id: photo.id,
          fileName: photo.file_name,
          uploadedAt: asUtc(photo.uploaded_at),
          fileSize: photo.file_size,
          kind: photo.storage_path.startsWith(avatarPrefix(userId)) ? 'profile' : 'analyzer',
          isAvatar: photo.storage_path === avatar,
          url: urlByPath.get(photo.storage_path) || null,
        })),
      });
    } catch (error: any) {
      console.error('❌ Error fetching user photos:', error?.message || error);
      res.status(500).json({ success: false, message: 'Failed to fetch photos' });
    }
  });

  app.delete('/api/user/photos/:photoId', isAuthenticated, async (req: any, res: Response) => {
    const parsed = photoIdSchema.safeParse(req.params.photoId);
    if (!parsed.success) return res.status(400).json({ message: 'Valid photo ID required' });

    try {
      const { data: rows, error } = await supabaseAdmin
        .from('user_photos')
        .select(PHOTO_COLUMNS)
        .eq('id', parsed.data)
        .eq('user_id', req.user.id);
      if (error) throw error;
      if (!rows?.length) return res.status(404).json({ success: false, message: 'Photo not found' });

      await deletePhotos(req.user.id, rows as PhotoRow[]);
      res.json({ success: true, deletedCount: 1 });
    } catch (error: any) {
      console.error('❌ Error deleting photo:', error?.message || error);
      res.status(500).json({ success: false, message: 'Failed to delete photo' });
    }
  });

  app.delete('/api/user/photos', isAuthenticated, async (req: any, res: Response) => {
    const parsed = z.array(photoIdSchema).min(1).max(100).safeParse(req.body?.photoIds);
    if (!parsed.success) return res.status(400).json({ message: 'Array of photo IDs required' });

    try {
      const { data: rows, error } = await supabaseAdmin
        .from('user_photos')
        .select(PHOTO_COLUMNS)
        .eq('user_id', req.user.id)
        .in('id', parsed.data);
      if (error) throw error;
      if (!rows?.length) return res.status(404).json({ success: false, message: 'No photos found' });

      await deletePhotos(req.user.id, rows as PhotoRow[]);
      res.json({ success: true, deletedCount: rows.length });
    } catch (error: any) {
      console.error('❌ Error in batch photo deletion:', error?.message || error);
      res.status(500).json({ success: false, message: 'Failed to delete photos' });
    }
  });
}
