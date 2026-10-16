import { useMutation } from "@tanstack/react-query";
import { saleService } from "./service/sale.service";
import type { CreateSalePayload } from "./types/sale.types";

export function useCreateSale() {
    return useMutation({
        mutationFn: (payload: CreateSalePayload) =>
            saleService.create(payload),
    });
}
