'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Loader2, Upload } from 'lucide-react';
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface FileUploadFormProps {
  onUploadSuccess: (fileName: string) => void;
  onUploadError: (error: string) => void;
}

export function FileUploadForm({ onUploadSuccess, onUploadError }: FileUploadFormProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation for file type
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.docx')) {
      onUploadError('Invalid file type. Only .txt and .docx are allowed.');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `knowledge-base/${Date.now()}-${file.name}`);
      const uploadTask = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploadTask.ref);

      // 2. Save metadata to Firestore
      await addDoc(collection(db, "knowledgeBaseFiles"), {
        name: file.name,
        url: url,
        createdAt: serverTimestamp(),
        size: file.size,
        type: file.type,
      });

      onUploadSuccess(file.name);
    } catch (err: any) {
      console.error("Upload failed:", err);
      onUploadError(err.message || "An unknown error occurred during upload.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        disabled={isUploading}
      />
      <Button onClick={handleUploadClick} disabled={isUploading}>
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Upload File
      </Button>
    </>
  );
}
