
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saleService } from "./service/sale.service";
import { type IInvoice, type UpdateSalePayload } from "./types/sale.types";

export interface ISalesFilters {
  search: string;
  paymentStatus: "all" | "paid" | "partial" | "unpaid";
}

export function useSales(page: number, filters: ISalesFilters) {
  return useQuery({
    queryKey: ["sales", page, filters],
    queryFn: () => saleService.getAll(page, filters.search),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useSale(id: string) {
  return useQuery<IInvoice, Error>({
    queryKey: ["sales", "detail", id],
    queryFn: () => saleService.getById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useUpdateSale(saleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSalePayload) =>
      saleService.update(saleId, payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["sales", "detail", saleId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["sales"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),
      ]);
    },
  });
}

export function useRecentSales() {
  return useQuery({
    queryKey: ["sales", "recent"],
    queryFn: async () => {
      const response = await saleService.getAll(1);

      return [...response.data]
        .sort(
          (a, b) =>
            new Date(b.generated_at).getTime() -
            new Date(a.generated_at).getTime(),
        )
        .slice(0, 5);
    },
    staleTime: 30_000,
  });
}

export function useOutstandingCredit() {
  return useQuery({
    queryKey: ["sales", "outstanding-credit"],
    queryFn: async () => {
      const response = await saleService.getOutstandingCredit();

      return [...response.data].sort(
        (a, b) =>
          (b.total_amount - b.total_amount_paid) -
          (a.total_amount - a.total_amount_paid),
      );
    },
    staleTime: 30_000,
  });
}