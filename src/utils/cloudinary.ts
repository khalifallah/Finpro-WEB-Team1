export const getCloudinaryImageUrl = (
  imagePath: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    crop?: string;
  }
): string => {
  if (!imagePath) return "";

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Extract public ID from path
  let publicId = imagePath;
  if (imagePath.includes("upload/")) {
    const parts = imagePath.split("upload/");
    publicId = parts[1];
  }

  // Remove file extension if present
  publicId = publicId.replace(/\.[^/.]+$/, "");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
  const transformations = options
    ? `c_${options.crop || "fill"},w_${options.width || 300},h_${
        options.height || 200
      },q_${options.quality || 80}`
    : "c_fill,w_300,h_200,q_80";

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
};
