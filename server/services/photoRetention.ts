/**
 * AI Food Analyzer photo retention
 * Photos uploaded for analysis are kept for 7 days, then removed from storage
 * along with their user_photos tracking rows.
 */

import { supabaseStorageService } from '../supabaseStorage';

export const PHOTO_RETENTION_DAYS = 7;

const UPLOADS_FOLDER = 'uploads';
const PAGE_SIZE = 1000;
const REMOVE_BATCH_SIZE = 100;
const INITIAL_DELAY_MS = 60 * 1000;
const INTERVAL_MS = 6 * 60 * 60 * 1000;

let running = false;

export async function purgeExpiredAnalyzerPhotos(): Promise<{ deletedFiles: number; deletedRows: number }> {
  if (running) return { deletedFiles: 0, deletedRows: 0 };
  running = true;

  const cutoff = new Date(Date.now() - PHOTO_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { supabase, bucketName } = supabaseStorageService;
  let deletedFiles = 0;
  let deletedRows = 0;

  try {
    // Oldest first, so paging can stop at the first photo that is still within retention.
    const expiredPaths: string[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await supabase.storage.from(bucketName).list(UPLOADS_FOLDER, {
        limit: PAGE_SIZE,
        offset,
        sortBy: { column: 'created_at', order: 'asc' },
      });
      if (error) throw new Error(`Listing ${UPLOADS_FOLDER} failed: ${error.message}`);
      if (!data || data.length === 0) break;

      let reachedRecent = false;
      for (const file of data) {
        // Folder placeholders have no id/created_at.
        if (!file.id || !file.created_at) continue;
        if (new Date(file.created_at) >= cutoff) {
          reachedRecent = true;
          break;
        }
        expiredPaths.push(`${UPLOADS_FOLDER}/${file.name}`);
      }
      if (reachedRecent || data.length < PAGE_SIZE) break;
    }

    for (let i = 0; i < expiredPaths.length; i += REMOVE_BATCH_SIZE) {
      const batch = expiredPaths.slice(i, i + REMOVE_BATCH_SIZE);
      const { data, error } = await supabase.storage.from(bucketName).remove(batch);
      if (error) {
        console.error('❌ Photo retention: failed to remove batch:', error.message);
        continue;
      }
      deletedFiles += data?.length ?? 0;
    }

    const { data: rows, error: rowsError } = await supabase
      .from('user_photos')
      .delete()
      .lt('uploaded_at', cutoff.toISOString())
      .select('id');
    if (rowsError) {
      console.error('❌ Photo retention: failed to delete user_photos rows:', rowsError.message);
    } else {
      deletedRows = rows?.length ?? 0;
    }

    if (deletedFiles > 0 || deletedRows > 0) {
      console.log(`🧹 Photo retention: removed ${deletedFiles} photos and ${deletedRows} tracking rows older than ${PHOTO_RETENTION_DAYS} days`);
    }
  } catch (error: any) {
    console.error('❌ Photo retention run failed:', error?.message || error);
  } finally {
    running = false;
  }

  return { deletedFiles, deletedRows };
}

export function startPhotoRetentionJob(): void {
  const run = () => { void purgeExpiredAnalyzerPhotos(); };
  setTimeout(run, INITIAL_DELAY_MS).unref();
  setInterval(run, INTERVAL_MS).unref();
}
