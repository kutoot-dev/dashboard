export const MERCHANT_MEDIA_ACCEPT =
  "image/*,audio/*,application/pdf,.pdf";

export const MERCHANT_MEDIA_TYPE_ERROR =
  "Video files are not allowed. Upload images, audio, or documents instead.";

export function isAllowedMerchantMediaFile(file: File): boolean {
  return !file.type.startsWith("video/");
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf";
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith("audio/");
}

export function isImageValue(value: string): boolean {
  return (
    value.startsWith("data:image/") ||
    /\.(jpe?g|png|webp|gif|bmp|svg)($|\?)/i.test(value)
  );
}

export function isPdfValue(value: string): boolean {
  return (
    value.startsWith("data:application/pdf") ||
    /\.pdf($|\?)/i.test(value)
  );
}

export function isAudioValue(value: string): boolean {
  return (
    value.startsWith("data:audio/") ||
    /\.(mp3|wav|ogg|m4a|aac|flac)($|\?)/i.test(value)
  );
}
