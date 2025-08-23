import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
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
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
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
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*'], // Only allow images for food analysis
      },
      autoProceed: false,
      locale: {
        strings: {
          dropPasteFiles: '📸 Drop your food photo here or click to browse',
          dropPasteFolders: '📸 Drop your food photo here or click to browse',
          browseFiles: 'browse files',
          dropHint: '📸 Perfect! Drop your food photo here',
          uploadComplete: '✅ Upload complete!',
          uploadPaused: '⏸️ Upload paused',
          resumeUpload: '▶️ Resume upload',
          pauseUpload: '⏸️ Pause upload',
          retryUpload: '🔄 Retry upload',
          addMoreFiles: '+ Add more photos',
          xFilesSelected: {
            0: '📸 %{smart_count} photo ready to upload',
            1: '📸 %{smart_count} photo ready to upload',
            2: '📸 %{smart_count} photos ready to upload'
          },
          uploadingXFiles: {
            0: '⬆️ Uploading %{smart_count} photo...',
            1: '⬆️ Uploading %{smart_count} photo...',
            2: '⬆️ Uploading %{smart_count} photos...'
          },
          processingXFiles: {
            0: '🔄 Processing %{smart_count} photo...',
            1: '🔄 Processing %{smart_count} photo...',
            2: '🔄 Processing %{smart_count} photos...'
          }
        },
        pluralize: (n: number) => n === 1 ? 0 : 1
      }
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        onComplete?.(result);
        setShowModal(false);
      })
  );

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} data-testid="button-upload-food-photo">
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}