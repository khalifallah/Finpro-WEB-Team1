"use client";

import { useState } from "react";
import { getCloudinaryImageUrl } from "@/utils/cloudinary";

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
}

export default function CloudinaryImage({
  src,
  alt,
  width = 300,
  height = 200,
  className = "",
  fallbackSrc = "https://placehold.co/300x200/EFEFEF/AAAAAA?text=No+Image",
}: CloudinaryImageProps) {
  const [error, setError] = useState(false);

  // If no src, use fallback immediately
  if (!src || src.trim() === "") {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
      />
    );
  }

  // Try to create Cloudinary URL
  let cloudinaryUrl = "";
  try {
    cloudinaryUrl = getCloudinaryImageUrl(src, { width, height, crop: "fill" });
  } catch (err) {
    console.error("Error creating Cloudinary URL:", err);
    setError(true);
  }

  const finalSrc = error ? fallbackSrc : cloudinaryUrl;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={() => {
        console.error("Failed to load image:", src);
        setError(true);
      }}
      width={width}
      height={height}
    />
  );
}
