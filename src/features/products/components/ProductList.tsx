import { Package } from "lucide-react";
import ProductCard from "./ProductCard";
import type IProduct from "../types/product.types";

interface ProductListProps {
  products: IProduct[];
  onRestock: (product: IProduct) => void;
}

export default function ProductList({ products, onRestock }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface px-5 py-12 text-center">
        <Package
          size={36}
          aria-hidden="true"
          className="mx-auto text-text-muted"
        />
        <h2 className="mt-3 font-semibold text-text">No products found</h2>
        <p className="mt-1 text-sm text-text-muted">
          Try a different search term or add your first product.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onRestock={onRestock} />
      ))}
    </div>
  );
}
