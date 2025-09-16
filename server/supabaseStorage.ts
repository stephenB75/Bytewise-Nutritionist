/**
 * Supabase Storage Service
 * Cloud-native object storage solution
 */

import { createClient } from '@supabase/supabase-js';
import { Response } from 'express';
import { randomUUID } from 'crypto';

// Use existing Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for storage operations');
}

// Create Supabase client with service role for storage operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
  async getObjectEntityUploadURL(): Promise<string> {
    try {
      const fileName = `uploads/${randomUUID()}`;
      
      // Create signed URL for upload (valid for 60 minutes)
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

      console.log('✅ Created Supabase Storage upload URL:', data.signedUrl);
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
      // Split path into directory and filename
      const pathParts = objectPath.split('/');
      const fileName = pathParts.pop(); // Get the filename
      const directory = pathParts.join('/'); // Get the directory path
      
      const { data, error } = await supabase
        .storage
        .from(this.bucketName)
        .list(directory || ''); // List files in directory (empty string for root)

      if (error) {
        console.error('❌ Error checking object existence:', error);
        return false;
      }

      // Check if the filename exists in the list
      return data && data.some(file => file.name === fileName);
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