'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  previewUrls?: string[];
  onRemovePreview?: (index: number) => void;
}

export default function ImageUpload({
  onImagesSelected,
  maxFiles = 5,
  maxFileSize = 5,
  previewUrls = [],
  onRemovePreview,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewLocalUrls, setPreviewLocalUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];

    // Validate file count
    if (selectedFiles.length + files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    // Validate file size
    files.forEach((file) => {
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name} exceeds ${maxFileSize}MB limit`);
      }
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not a valid image`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewLocalUrls((prev) => [...prev, ...newPreviewUrls]);
    setError('');
    onImagesSelected([...selectedFiles, ...files]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewLocalUrls.filter((_, i) => i !== index);

    // Cleanup object URLs
    URL.revokeObjectURL(previewLocalUrls[index]);

    setSelectedFiles(newFiles);
    setPreviewLocalUrls(newUrls);
    onImagesSelected(newFiles);
  };

  const handleRemovePreviewUrl = (index: number) => {
    onRemovePreview?.(index);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-8l4 4m0 0l4-4m-4 4v12m11-20h.01"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p className="mt-2 text-sm font-medium text-gray-900">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, GIF up to {maxFileSize}MB (Max {maxFiles} files)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4v2m0-11a9 9 0 110 18 9 9 0 010-18z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Existing Preview URLs */}
      {previewUrls.length > 0 && (
        <div>
          <label className="label">
            <span className="label-text font-semibold">Existing Images</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative">
                <div className="relative w-full aspect-square">
                  <Image
                    src={url}
                    alt={`Existing ${index}`}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePreviewUrl(index)}
                  className="absolute top-1 right-1 btn btn-circle btn-sm btn-error"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Preview */}
      {previewLocalUrls.length > 0 && (
        <div>
          <label className="label">
            <span className="label-text font-semibold">New Images</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previewLocalUrls.map((url, index) => (
              <div key={`new-${index}`} className="relative">
                <div className="relative w-full aspect-square">
                  <Image
                    src={url}
                    alt={`Preview ${index}`}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-1 right-1 btn btn-circle btn-sm btn-error"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}