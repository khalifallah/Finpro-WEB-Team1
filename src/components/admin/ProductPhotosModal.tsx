import React, { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Props {
  isOpen: boolean;
  images: string[];
  onClose: () => void;
}

export default function ProductPhotosModal({ isOpen, images, onClose }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) setIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const hasNext = images && images.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 overflow-hidden">
        <div className="p-3 flex items-center justify-between border-b">
          <h3 className="font-semibold text-lg text-black">Product Photos</h3>
          <div className="flex items-center gap-2">
            {hasNext && (
              <button
                className="btn btn-md bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 text-lg"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                aria-label="Previous image"
                title="Previous"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
            )}
            {hasNext && (
              <button
                className="btn btn-md bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 text-lg"
                onClick={() => setIndex((i) => Math.min(images.length - 1, i + 1))}
                disabled={index === images.length - 1}
                aria-label="Next image"
                title="Next"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            )}
            <button
              className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 flex items-center justify-center bg-gray-50" style={{ minHeight: 360 }}>
          {images && images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[index]} alt={`photo-${index}`} className="max-h-[520px] max-w-full object-contain" />
          ) : (
            <div className="text-gray-500">No images available</div>
          )}
        </div>

        <div className="p-3 border-t text-sm text-gray-700">
          {images.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold">Image {index + 1} of {images.length}</div>
              <div className="hidden sm:block text-sm text-gray-600">Use the arrows to navigate</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
