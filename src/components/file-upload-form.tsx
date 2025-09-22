'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { uploadFileToKnowledgeBase } from '@/lib/actions';
import { Loader2, Upload } from 'lucide-react';

interface FileUploadFormProps {
  onUploadSuccess: (fileName: string) => void;
  onUploadError: (error: string) => void;
}

export function FileUploadForm({ onUploadSuccess, onUploadError }: FileUploadFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      startTransition(async () => {
        const result = await uploadFileToKnowledgeBase(formData);
        if (result.success && result.fileName) {
          onUploadSuccess(result.fileName);
        } else {
          onUploadError(result.error || 'An unknown error occurred.');
        }
      });
    }
     // Reset file input to allow uploading the same file again
     if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.docx"
        disabled={isPending}
      />
      <Button onClick={handleUploadClick} disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Upload File
      </Button>
    </>
  );
}
