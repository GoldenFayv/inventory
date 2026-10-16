import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductForm from "./components/ProductForm";
import type { CreateProductPayload } from "./types/product.types";
import { productService } from "./services/product.service";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>(
    {},
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      productService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products", { replace: true });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const responseErrors = error.response?.data?.errors;

        if (responseErrors && typeof responseErrors === "object") {
          setServerErrors(responseErrors as Record<string, string[]>);
        } else {
          setServerErrors({
            general: [
              error.response?.data?.message ??
                "Unable to create product. Please try again.",
            ],
          });
        }
      } else {
        setServerErrors({
          general: ["An unexpected error occurred. Please try again."],
        });
      }
    },
  });

  async function handleSubmit(payload: CreateProductPayload) {
    setServerErrors({});
    await createMutation.mutateAsync(payload);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 pb-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Back to products
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-text">Add product</h1>
        <p className="mt-1 text-sm text-text-muted">
          Add a product and record its opening stock.
        </p>
      </header>

      <section className="rounded-card border border-border bg-surface p-4 sm:p-6">
        <ProductForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          serverErrors={serverErrors}
        />
      </section>
    </main>
  );
}
