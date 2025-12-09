'use client';

import { useState } from 'react';
import { FiUpload, FiX, FiTrash2, FiAlertCircle } from 'react-icons/fi';

interface ProductImage {
  id: number;
  imageUrl: string;
}

interface ProductImageManagerProps {
  existingImages: ProductImage[];
  onDeleteImage: (imageId: number) => Promise<void>;
  onUploadImages: (files: File[]) => void;
  newImages: File[];
  newImagePreviews: string[];
  onRemoveNewImage: (index: number) => void;
  maxImages?: number;
  loading?: boolean;
}

export default function ProductImageManager({
  existingImages,
  onDeleteImage,
  onUploadImages,
  newImages,
  newImagePreviews,
  onRemoveNewImage,
  maxImages = 5,
  loading = false,
}: ProductImageManagerProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const totalImages = existingImages.length + newImages.length;
  const canAddMore = totalImages < maxImages;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = ''; // Reset input
  };

  const processFiles = (files: File[]) => {
    // ✅ FIX: Validate file type and size
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    const remainingSlots = maxImages - totalImages;

    if (validFiles.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`);
      return;
    }

    onUploadImages(validFiles);
  };

  const handleDeleteExisting = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      setDeletingId(imageId);
      await onDeleteImage(imageId);
    } finally {
      setDeletingId(null);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files || []);
    processFiles(files);
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <div className="alert alert-info gap-2">
        <FiAlertCircle className="w-5 h-5" />
        <div className="flex-1">
          <p className="text-sm">
            Images will be uploaded when you click <strong>Save Changes</strong>
          </p>
        </div>
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Current Images ({existingImages.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={image.imageUrl}
                    alt="Product"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteExisting(image.id)}
                  disabled={deletingId === image.id || loading}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 disabled:opacity-50"
                  title="Delete image"
                >
                  {deletingId === image.id ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <FiTrash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images Preview */}
      {newImagePreviews.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            New Images to Upload ({newImagePreviews.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {newImagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary bg-blue-50">
                  <img
                    src={preview}
                    alt={`New ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveNewImage(index)}
                  disabled={loading}
                  className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-gray-600"
                  title="Remove"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">
                  NEW
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Add More Images
            <span className="text-xs font-normal text-gray-500 ml-2">
              ({totalImages}/{maxImages} images)
            </span>
          </label>
          <label
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-primary bg-blue-50'
                : 'border-gray-300 hover:border-primary hover:bg-blue-50'
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
            <FiUpload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB (Max {maxImages - totalImages} more)
            </p>
          </label>
        </div>
      )}

      {!canAddMore && (
        <div className="alert alert-warning">
          <span className="text-sm">Maximum {maxImages} images reached. Delete existing images to add new ones.</span>
        </div>
      )}
    </div>
  );
}