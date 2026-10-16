import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productService } from "./services/product.service";


export function useProducts(page: number, search: string, per_page?: number) {
    return useQuery({
        queryKey: ["products", { page, search }],
        queryFn: () => productService.getAll({page, search, per_page}),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
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