import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { ProductFormPayload } from "../types/product.types";
import type IProduct from "../types/product.types";
import { useProductImages } from "../useProductImages";

interface ProductFormProps {
  onSubmit: (payload: ProductFormPayload) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: Record<string, string[]>;
  initialProduct?: IProduct;
}

export default function ProductForm({
  onSubmit,
  isSubmitting,
  serverErrors = {},
  initialProduct,
}: ProductFormProps) {
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [sku, setSku] = useState(initialProduct?.sku ?? "");
  const [sellingPrice, setSellingPrice] = useState(
    initialProduct ? String(initialProduct.selling_price) : "",
  );
  const [costPrice, setCostPrice] = useState(
    initialProduct ? String(initialProduct.cost_price) : "",
  );
  const [openingQuantity, setOpeningQuantity] = useState(
    String(initialProduct?.quantity ?? ""),
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(initialProduct?.low_stock_threshold ?? 5),
  );
  const [existingMedia, setExistingMedia] = useState(
    initialProduct?.media ?? [],
  );
  const [removeMediaIds, setRemoveMediaIds] = useState<Id[]>([]);
  const [error, setError] = useState("");

  // Owns selection, validation, compression, previews and URL cleanup.
  // Previews are released automatically when the form unmounts.
  const {
    images,
    imagePreviews,
    handleImageSelection,
    removeImage,
    imageError,
    isProcessing,
  } = useProductImages({ maxImages: 3, existingCount: existingMedia.length });

  // Laravel reports file failures as images.0, images.1, ... so collect them all
  const serverImageErrors = [
    ...new Set(
      Object.entries(serverErrors)
        .filter(([key]) => key === "images" || key.startsWith("images."))
        .flatMap(([, messages]) => messages),
    ),
  ];

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    // Images still being compressed would be missing from the payload
    if (isProcessing) return;

    const selling = Number(sellingPrice);
    const cost = Number(costPrice);
    const quantity = Number(openingQuantity);
    const threshold = Number(lowStockThreshold);

    if (!name.trim()) {
      setError("Enter a product name.");
      return;
    }

    if (
      sellingPrice.trim() === "" ||
      costPrice.trim() === "" ||
      !Number.isFinite(selling) ||
      !Number.isFinite(cost) ||
      selling < 0 ||
      cost < 0
    ) {
      setError("Enter valid, non-negative prices.");
      return;
    }

    const openingQuantityText = String(openingQuantity).trim();

    if (
      openingQuantityText === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Opening quantity must be a non-negative whole number.");
      return;
    }

    if (
      lowStockThreshold.trim() === "" ||
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      setError("Low-stock threshold must be a non-negative whole number.");
      return;
    }

    if (existingMedia.length + images.length > 3) {
      setError("You can have a maximum of 3 images per product.");
      return;
    }

    if (
      images.some(
        (image) =>
          !["image/jpeg", "image/png", "image/webp"].includes(image.type),
      )
    ) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    if (images.some((image) => image.size > 5 * 1024 * 1024)) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }

    try {
      const payload: ProductFormPayload = {
        name: name.trim(),
        sku: sku.trim() || null,
        selling_price: selling,
        cost_price: cost,
        low_stock_threshold: threshold,
        images,
        remove_media_ids: removeMediaIds,
      };

      if (!initialProduct) {
        payload.opening_quantity = quantity;
      }

      await onSubmit(payload);
    } catch {
      // The parent handles displaying server errors.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <div>
          <p className="block text-sm font-medium text-text">
            Product images{" "}
            <span className="text-text-muted">(optional, up to 3)</span>
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Add photos from different angles. JPG, PNG or WebP. Large photos are
            shrunk automatically.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {existingMedia.map((media) => (
            <div key={media.id} className="relative aspect-square">
              <img
                src={media.url}
                alt={`${initialProduct?.name ?? "Product"} image`}
                className="h-full w-full rounded-xl border border-border object-cover"
              />

              <button
                type="button"
                onClick={() => {
                  setExistingMedia((current) =>
                    current.filter((item) => item.id !== media.id),
                  );

                  setRemoveMediaIds((current) =>
                    current.includes(media.id)
                      ? current
                      : [...current, media.id],
                  );
                }}
                aria-label="Remove existing image"
                className="absolute right-1 top-1 rounded-full bg-surface p-1.5 text-text shadow"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {imagePreviews.map((preview, index) => (
            <div key={preview} className="relative aspect-square">
              <img
                src={preview}
                alt={`New product image ${index + 1}`}
                className="h-full w-full rounded-xl border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Remove new image ${index + 1}`}
                className="absolute right-1 top-1 rounded-full bg-surface p-1.5 text-text shadow"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {existingMedia.length + images.length < 3 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface p-2 text-center hover:bg-background focus-within:ring-2 focus-within:ring-primary">
              <ImagePlus size={24} className="text-text-muted" />
              <span className="text-xs font-medium text-text">
                {isProcessing ? "Preparing..." : "Add image"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={isProcessing}
                onChange={handleImageSelection}
                className="sr-only"
              />
            </label>
          )}
        </div>

        <p className="text-xs text-text-muted" aria-live="polite">
          {existingMedia.length + images.length} of 3 images selected
        </p>

        {imageError && (
          <p role="alert" className="text-sm text-danger">
            {imageError}
          </p>
        )}

        {serverImageErrors.map((message) => (
          <p key={message} className="mt-1 text-sm text-danger">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="product-name"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Product name *
          </label>
          <input
            id="product-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={255}
            placeholder="e.g. Bag of Rice"
            className="w-full rounded-input border border-border bg-surface px-3 py-3 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {serverErrors.name?.map((message) => (
            <p key={message} className="mt-1 text-sm text-danger">
              {message}
            </p>
          ))}
        </div>

        <div>
          <label
            htmlFor="product-sku"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            SKU <span className="text-text-muted">(optional)</span>
          </label>
          <input
            id="product-sku"
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            maxLength={255}
            placeholder="e.g. RICE-001"
            className="w-full rounded-input border border-border bg-surface px-3 py-3 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {serverErrors.sku?.map((message) => (
            <p key={message} className="mt-1 text-sm text-danger">
              {message}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="cost-price"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Cost price (₦) *
            </label>
            <input
              id="cost-price"
              type="number"
              min="0"
              step="0.01"
              value={costPrice}
              onChange={(event) => setCostPrice(event.target.value)}
              required
              inputMode="decimal"
              placeholder="0.00"
              className="w-full rounded-input border border-border bg-surface px-3 py-3 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {serverErrors.cost_price?.map((message) => (
              <p key={message} className="mt-1 text-sm text-danger">
                {message}
              </p>
            ))}
          </div>

          <div>
            <label
              htmlFor="selling-price"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Selling price (₦) *
            </label>
            <input
              id="selling-price"
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(event) => setSellingPrice(event.target.value)}
              required
              inputMode="decimal"
              placeholder="0.00"
              className="w-full rounded-input border border-border bg-surface px-3 py-3 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {serverErrors.selling_price?.map((message) => (
              <p key={message} className="mt-1 text-sm text-danger">
                {message}
              </p>
            ))}
          </div>

          {!initialProduct && (
            <div>
              <label
                htmlFor="opening-quantity"
                className="mb-1.5 block text-sm font-medium text-text"
              >
                Opening quantity *
              </label>
              <input
                id="opening-quantity"
                type="number"
                min="0"
                step="1"
                value={openingQuantity}
                onChange={(event) => setOpeningQuantity(event.target.value)}
                required
                inputMode="numeric"
                className="w-full rounded-input border border-border bg-surface px-3 py-3 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {serverErrors.opening_quantity?.map((message) => (
                <p key={message} className="mt-1 text-sm text-danger">
                  {message}
                </p>
              ))}
            </div>
          )}

          <div>
            <label
              htmlFor="low-stock-threshold"
              className="mb-1.5 block text-sm font-medium text-text"
            >
              Low-stock threshold *
            </label>
            <input
              id="low-stock-threshold"
              type="number"
              min="0"
              step="1"
              value={lowStockThreshold}
              onChange={(event) => setLowStockThreshold(event.target.value)}
              required
              inputMode="numeric"
              className="w-full rounded-input border border-border bg-surface px-3 py-3 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {serverErrors.low_stock_threshold?.map((message) => (
              <p key={message} className="mt-1 text-sm text-danger">
                {message}
              </p>
            ))}
          </div>
        </div>
      </div>

      {(error || serverErrors.general?.length) && (
        <div
          role="alert"
          className="rounded-input bg-danger/10 p-3 text-sm text-danger"
        >
          {error || serverErrors.general?.join(" ")}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isProcessing}
        className="w-full rounded-input bg-primary px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Saving product…"
          : isProcessing
            ? "Preparing images…"
            : initialProduct
              ? "Update product"
              : "Create product"}
      </button>
    </form>
  );
}
