import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ProductForm from "./components/ProductForm";
import { productService } from "./services/product.service";
import type { ProductFormPayload } from "./types/product.types";

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>(
    {},
  );

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getById(productId!),
    enabled: Boolean(productId),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: ProductFormPayload) => {
      if (!productId) {
        throw new Error("Product ID is missing.");
      }

      return productService.update(productId, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({
          queryKey: ["product", productId],
        }),
      ]);

      navigate("/products");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const responseErrors = error.response?.data?.errors;

        if (responseErrors && typeof responseErrors === "object") {
          setServerErrors(responseErrors as Record<string, string[]>);
          return;
        }

        setServerErrors({
          general: [
            error.response?.data?.message ??
              "Failed to update product. Please try again.",
          ],
        });

        return;
      }

      setServerErrors({
        general: ["An unexpected error occurred. Please try again."],
      });
    },
  });

  async function handleSubmit(payload: ProductFormPayload) {
    setServerErrors({});
    await updateMutation.mutateAsync(payload);
  }

  if (productQuery.isPending) {
    return (
      <div className="p-4 text-text-muted" role="status">
        Loading product…
      </div>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <section className="space-y-4 p-4">
        <p className="text-danger">Unable to load this product.</p>
        <Link to="/products" className="text-primary underline">
          Back to products
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 p-4">
      <div>
        <Link to="/products" className="text-sm text-primary underline">
          ← Back to products
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-text">Edit product</h1>

        <p className="mt-1 text-sm text-text-muted">
          Update product details, pricing, stock threshold, and images.
        </p>
      </div>

      <div className="rounded-card border border-border bg-surface p-4 sm:p-6">
        <ProductForm
          key={productQuery.data.id}
          initialProduct={productQuery.data}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
          serverErrors={serverErrors}
        />
      </div>
    </section>
  );
}
