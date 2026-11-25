export const MEDIA_BUCKET = "product-media";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export const publicMediaPrefix = (productId: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${productId}/`;
