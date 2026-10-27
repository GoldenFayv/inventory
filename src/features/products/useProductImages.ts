import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { compressImage } from "../../utils/compressImage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // keep in step with the Laravel `max:5120` rule

type PickedImage = { file: File; url: string };

type Options = {
  maxImages: number;
  /** Images already saved on the product (edit mode) */
  existingCount?: number;
};

export function useProductImages({ maxImages, existingCount = 0 }: Options) {
  const [items, setItems] = useState<PickedImage[]>([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Latest items for the unmount cleanup below
  const itemsRef = useRef<PickedImage[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Release preview URLs when the form unmounts
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);

    // Lets the user pick the same file again after removing it
    event.target.value = "";

    if (picked.length === 0 || isProcessing) return;

    const problems: string[] = [];
    const slots = Math.max(0, maxImages - existingCount - items.length);

    const supported = picked.filter((file) => ALLOWED_TYPES.includes(file.type));
    if (supported.length < picked.length) {
      problems.push("Only JPG, PNG or WebP images are supported.");
    }

    const toProcess = supported.slice(0, slots);
    if (toProcess.length < supported.length) {
      problems.push(`You can add up to ${maxImages} images per product.`);
    }

    setError("");
    setIsProcessing(true);

    try {
      const processed = await Promise.all(
        toProcess.map((file) => compressImage(file)),
      );

      const accepted = processed.filter((file) => file.size <= MAX_IMAGE_BYTES);
      if (accepted.length < processed.length) {
        problems.push("Some photos are still over 5 MB. Try a smaller one.");
      }

      setItems((current) => [
        ...current,
        ...accepted.map((file) => ({ file, url: URL.createObjectURL(file) })),
      ]);
    } finally {
      setIsProcessing(false);
      setError(problems.join(" "));
    }
  }

  function removeImage(index: number) {
    setItems((current) => {
      const target = current[index];
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((_, i) => i !== index);
    });
    setError("");
  }

  /** Call after a successful save */
  function reset() {
    items.forEach((item) => URL.revokeObjectURL(item.url));
    setItems([]);
    setError("");
  }

  return {
    images: items.map((item) => item.file),
    imagePreviews: items.map((item) => item.url),
    handleImageSelection,
    removeImage,
    reset,
    imageError: error,
    isProcessing,
  };
}
