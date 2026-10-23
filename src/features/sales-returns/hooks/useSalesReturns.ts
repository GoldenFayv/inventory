import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { salesReturnService } from "../services/sales-return.service";
import type {
  CreateSalesReturnPayload,
  ReviewSalesReturnPayload,
  SalesReturnStatus,
} from "../types/sales-return.types";

export const salesReturnKeys = {
  all: ["sales-returns"] as const,
  lists: () => [...salesReturnKeys.all, "list"] as const,
  list: (params: { page: number; per_page: number; status: SalesReturnStatus | "all" }) =>
    [...salesReturnKeys.lists(), params] as const,
  details: () => [...salesReturnKeys.all, "detail"] as const,
  detail: (id: string) => [...salesReturnKeys.details(), id] as const,
  invoice: (id: string) => ["sales", id] as const,
};

export function useSalesReturns(params: {
  page: number;
  per_page: number;
  status: SalesReturnStatus | "all";
}) {
  return useQuery({
    queryKey: salesReturnKeys.list(params),
    queryFn: () => salesReturnService.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useSalesReturn(returnId: string | undefined) {
  return useQuery({
    queryKey: salesReturnKeys.detail(returnId ?? ""),
    queryFn: () => salesReturnService.getById(returnId!),
    enabled: Boolean(returnId),
    staleTime: 15_000,
  });
}

export function useInvoiceForReturn(invoiceId: string | undefined) {
  return useQuery({
    queryKey: salesReturnKeys.invoice(invoiceId ?? ""),
    queryFn: () => salesReturnService.getInvoice(invoiceId!),
    enabled: Boolean(invoiceId),
    staleTime: 15_000,
  });
}

export function useCreateSalesReturn(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSalesReturnPayload) =>
      salesReturnService.create(invoiceId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: salesReturnKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: salesReturnKeys.invoice(invoiceId) }),
      ]);
    },
  });
}

export function useReviewSalesReturn(returnId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewSalesReturnPayload) =>
      salesReturnService.updateStatus(returnId, payload),
    onSuccess: async (updatedReturn) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: salesReturnKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: salesReturnKeys.detail(returnId) }),
        queryClient.invalidateQueries({ queryKey: salesReturnKeys.invoice(updatedReturn.invoice_id) }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
  });
}
