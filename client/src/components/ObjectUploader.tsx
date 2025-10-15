import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, X } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: (file: File) => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { successful: boolean; file?: File }) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses a direct XMLHttpRequest approach for file upload functionality.
 * All file management features are handled through a custom modal interface.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > maxFileSize) {
        setUploadError(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds maximum allowed size (${(maxFileSize / 1024 / 1024).toFixed(1)} MB)`);
        return;
      }
      
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file (JPG, PNG, HEIC, WEBP)');
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // Get upload parameters from parent component
      const { url, method } = await onGetUploadParameters(selectedFile);
      
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      // Upload the file
      await new Promise<void>((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
            }
          }
        };
        
        xhr.onerror = () => reject(new Error('Upload failed due to network error'));
        xhr.onabort = () => reject(new Error('Upload was cancelled'));
        
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', selectedFile.type);
        xhr.send(selectedFile);
      });
      
      // Upload successful
      setUploading(false);
      onComplete?.({ successful: true, file: selectedFile });
      setShowModal(false);
      setSelectedFile(null);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      setUploadProgress(0);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploading(false);
    setUploadError(null);
  };

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} data-testid="button-upload-food-photo">
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Camera className="h-5 w-5 text-gray-900" />
              Upload Food Photo
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a photo from your device to analyze food items and get nutritional information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{uploadError}</p>
                <Button
                  onClick={() => setUploadError(null)}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs"
                >
                  Dismiss
                </Button>
              </div>
            )}
            
            {!selectedFile && !uploading && (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Choose a photo from your library or take a new one
                </p>
                
                {/* Photo Library Button */}
                <Button
                  onClick={() => {
                    // Set the input to allow photo library selection
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                  className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  data-testid="button-choose-photo-library"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="h-6 w-6" />
                    <span className="font-semibold">📱 Choose from Photo Library</span>
                  </div>
                </Button>

                {/* Camera Button */}
                <Button
                  onClick={() => {
                    // Set the input to use camera
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment');
                      fileInputRef.current.click();
                    }
                  }}
                  className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  data-testid="button-take-photo"
                >
                  <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5" />
                    <span className="font-medium">📸 Take New Photo</span>
                  </div>
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-500">
                  Supports JPG, PNG, HEIC, WEBP • Max 10MB
                </p>
              </div>
            )}

            {selectedFile && !uploading && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Analyze
                  </Button>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm font-medium">Uploading...</p>
                  <p className="text-xs text-gray-500">{selectedFile?.name}</p>
                </div>
                
                <Progress value={uploadProgress} className="w-full" />
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
                </div>
                
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Upload
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}