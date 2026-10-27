type CompressOptions = {
  /** Longest side in px after resizing */
  maxDimension?: number;
  /** JPEG quality, 0 to 1 */
  quality?: number;
  /** Files at or below this size are sent untouched */
  skipBelowBytes?: number;
};

/**
 * Shrinks a photo in the browser before upload.
 * Fails soft: if anything goes wrong (unsupported format, no canvas) it
 * returns the original file, and the size check / server validation decide.
 */
export async function compressImage(
  file: File,
  {
    maxDimension = 1600,
    quality = 0.82,
    skipBelowBytes = 800 * 1024,
  }: CompressOptions = {},
): Promise<File> {
  if (file.size <= skipBelowBytes) return file;

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image", // respects the phone's EXIF rotation
    });

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }

    // JPEG has no transparency; avoid black backgrounds from transparent PNGs
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );

    // Keep the original if compression didn't actually help
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
