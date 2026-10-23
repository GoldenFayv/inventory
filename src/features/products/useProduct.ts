import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "./services/product.service";
import type { RestockProductItem } from "./types/product.types";

export function useProducts(page: number, search: string, per_page?: number, staleTime = 30_000) {
    return useQuery({
        queryKey: ["products", "restock-search", { page, search }],
        queryFn: () => productService.getAll({ page, search, per_page }),
        placeholderData: keepPreviousData,
        staleTime,
        refetchOnWindowFocus: true,
    });
}

export function useToogleStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: Id) => productService.toggleStatus(productId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    });
}

export function useLowStockProducts() {
    return useQuery({
        queryKey: ["products", "low-stock"],
        queryFn: async () => {
            const response = await productService.getAll({ stock: "low_stock", per_page: 5 });

            return response.data
                .filter(
                    (product) =>
                        product.is_active &&
                        product.quantity <= product.low_stock_threshold,
                )
                .sort((a, b) => a.quantity - b.quantity);
        },
        staleTime: 30_000,
    });

}

export function useRestockProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (items: RestockProductItem[]) =>
            productService.restock({ products: items }),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["products"],
            });
        },
    });
}