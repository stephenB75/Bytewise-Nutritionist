/**
 * Supabase Storage Service
 * Cloud-native object storage solution
 */

import { createClient } from '@supabase/supabase-js';
import { Response } from 'express';
import { randomUUID } from 'crypto';

import { getSupabaseServiceKey, getSupabaseUrl } from './env';

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_SERVICE_KEY = getSupabaseServiceKey();

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) are missing. Storage routes will fail until they are set.');
}

// Create Supabase client with service role for storage operations
const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_KEY || 'placeholder-service-key'
);

export class SupabaseStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseStorageError";
    Object.setPrototypeOf(this, SupabaseStorageError.prototype);
  }
}

export class SupabaseStorageService {
  public bucketName = 'bytewise-storage';
  public supabase = supabase; // Expose for direct access when needed

  constructor() {}

  // Get upload URL for file uploads
  async getObjectEntityUploadURL(contentType: string = 'application/octet-stream'): Promise<string> {
    try {
      const fileName = `uploads/${randomUUID()}`;
      
      // Create signed URL for upload (valid for 60 minutes)
      // IMPORTANT: contentType must match exactly what's sent in the upload request
      const { data, error } = await supabase
        .storage
        .from(this.bucketName)
        .createSignedUploadUrl(fileName, {
          upsert: true,
        });

      if (error) {
        console.error('❌ Supabase Storage upload URL error:', error);
        throw new SupabaseStorageError(`Failed to create upload URL: ${error.message}`);
      }

      console.log(`✅ Created Supabase Storage upload URL for ${contentType}:`, data.signedUrl);
      return data.signedUrl;
    } catch (error: any) {
      console.error('❌ Error creating upload URL:', error);
      throw new SupabaseStorageError(`Upload URL creation failed: ${error.message}`);
    }
  }

  // Download object and stream to response
  async downloadObject(objectPath: string, res: Response, cacheTtlSec: number = 3600) {
    try {
      const { data, error } = await supabase
        .storage
        .from(this.bucketName)
        .download(objectPath);

      if (error) {
        console.error('❌ Supabase Storage download error:', error);
        throw new SupabaseStorageError(`Failed to download object: ${error.message}`);
      }

      if (!data) {
        throw new SupabaseStorageError('Object not found');
      }

      // Set appropriate headers
      res.set({
        "Content-Type": data.type || "application/octet-stream",
        "Content-Length": data.size.toString(),
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
        "ETag": `"${objectPath}"`,
      });

      // Convert blob to buffer and send
      const buffer = await data.arrayBuffer();
      res.send(Buffer.from(buffer));

    } catch (error: any) {
      console.error('❌ Error downloading object:', error);
      throw error;
    }
  }

  // Check if object exists
  async objectExists(objectPath: string): Promise<boolean> {
    try {
      // Method 1: Try listing files in directory
      const pathParts = objectPath.split('/');
      const fileName = pathParts.pop(); // Get the filename
      const directory = pathParts.join('/'); // Get the directory path
      
      const { data, error } = await supabase
        .storage
        .from(this.bucketName)
        .list(directory || ''); // List files in directory (empty string for root)

      if (!error && data && data.some(file => file.name === fileName)) {
        return true;
      }

      // Method 2: If list fails or file not found, try direct download attempt
      // This is more reliable for recently uploaded files
      console.log(`🔍 List check failed for ${objectPath}, trying direct download check...`);
      
      try {
        const { data: downloadData, error: downloadError } = await supabase
          .storage
          .from(this.bucketName)
          .download(objectPath);

        if (!downloadError && downloadData) {
          console.log(`✅ File ${objectPath} exists (confirmed via download)`);
          return true;
        }
      } catch (downloadError) {
        // Download failed, file doesn't exist
      }

      console.log(`❌ File ${objectPath} not found via both list and download methods`);
      return false;
      
    } catch (error) {
      console.error('❌ Error checking object existence:', error);
      return false;
    }
  }

  // Get public URL for an object
  getPublicUrl(objectPath: string): string {
    const { data } = supabase
      .storage
      .from(this.bucketName)
      .getPublicUrl(objectPath);

    return data.publicUrl;
  }

  // Get signed URL for temporary access
  async getSignedUrl(objectPath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase
        .storage
        .from(this.bucketName)
        .createSignedUrl(objectPath, expiresIn);

      if (error) {
        throw new SupabaseStorageError(`Failed to create signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error: any) {
      console.error('❌ Error creating signed URL:', error);
      throw error;
    }
  }

  // Upload file buffer directly (for AI image processing)
  async uploadBuffer(buffer: Buffer, fileName: string, contentType: string = 'application/octet-stream'): Promise<string> {
    try {
      const filePath = `uploads/${fileName}`;
      
      const { data, error } = await supabase
        .storage
        .from(this.bucketName)
        .upload(filePath, buffer, {
          contentType,
          upsert: true
        });

      if (error) {
        throw new SupabaseStorageError(`Failed to upload file: ${error.message}`);
      }

      console.log('✅ File uploaded to Supabase Storage:', data.path);
      return data.path;
    } catch (error: any) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }

  // Delete object from storage (Critical for App Store privacy compliance)
  async deleteObject(objectPath: string): Promise<boolean> {
    try {
      console.log(`🗑️ Attempting to delete object: ${objectPath}`);

      // Check if object exists before attempting deletion
      const exists = await this.objectExists(objectPath);
      if (!exists) {
        console.log(`⚠️ Object ${objectPath} does not exist, considering deletion successful`);
        return true; // Return true as the desired state is achieved
      }

      const { data, error } = await supabase
        .storage
        .from(this.bucketName)
        .remove([objectPath]);

      if (error) {
        console.error('❌ Supabase Storage deletion error:', error);
        throw new SupabaseStorageError(`Failed to delete object: ${error.message}`);
      }

      // Verify deletion was successful
      const deletedFiles = data || [];
      const wasDeleted = deletedFiles.some(file => file.name === objectPath);
      
      if (wasDeleted) {
        console.log(`✅ Successfully deleted object: ${objectPath}`);
        return true;
      } else {
        console.warn(`⚠️ Deletion response unclear for: ${objectPath}`);
        // Double-check by verifying file no longer exists
        const stillExists = await this.objectExists(objectPath);
        if (!stillExists) {
          console.log(`✅ Object ${objectPath} confirmed deleted (verified by existence check)`);
          return true;
        } else {
          throw new SupabaseStorageError(`Deletion verification failed - object still exists: ${objectPath}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Error deleting object:', error);
      throw error;
    }
  }

  // Delete multiple objects at once (batch deletion for efficiency)
  async deleteObjects(objectPaths: string[]): Promise<{ successful: string[], failed: string[] }> {
    const results = {
      successful: [] as string[],
      failed: [] as string[]
    };

    try {
      console.log(`🗑️ Attempting to delete ${objectPaths.length} objects`);

      const { data, error } = await supabase
        .storage
        .from(this.bucketName)
        .remove(objectPaths);

      if (error) {
        console.error('❌ Batch deletion error:', error);
        // If batch deletion fails, mark all as failed
        results.failed = [...objectPaths];
        return results;
      }

      // Process results - check which files were successfully deleted
      const deletedFiles = data || [];
      
      for (const objectPath of objectPaths) {
        const wasDeleted = deletedFiles.some(file => file.name === objectPath);
        if (wasDeleted) {
          results.successful.push(objectPath);
        } else {
          // Verify by checking existence
          try {
            const exists = await this.objectExists(objectPath);
            if (!exists) {
              results.successful.push(objectPath);
            } else {
              results.failed.push(objectPath);
            }
          } catch (checkError) {
            results.failed.push(objectPath);
          }
        }
      }

      console.log(`✅ Batch deletion completed: ${results.successful.length} successful, ${results.failed.length} failed`);
      return results;
    } catch (error: any) {
      console.error('❌ Error in batch deletion:', error);
      // If there's an error, mark all as failed
      results.failed = [...objectPaths];
      return results;
    }
  }

  // Initialize bucket (create if doesn't exist)
  async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('❌ Error listing buckets:', listError);
        return;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        console.log('🪣 Creating Supabase Storage bucket...');
        const { error: createError } = await supabase.storage.createBucket(this.bucketName, {
          public: false, // Files are private by default, access via signed URLs
          allowedMimeTypes: ['image/*', 'application/*'],
          fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
        });

        if (createError) {
          console.error('❌ Error creating bucket:', createError);
        } else {
          console.log('✅ Supabase Storage bucket created successfully');
        }
      } else {
        console.log('✅ Supabase Storage bucket already exists');
      }
    } catch (error) {
      console.error('❌ Error initializing bucket:', error);
    }
  }
}

// Export singleton instance
export const supabaseStorageService = new SupabaseStorageService();

// Export singleton instance
export { supabaseStorageService as objectStorageClient };