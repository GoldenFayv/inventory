import { api } from "../../../lib/api";
import type {
  CreateSalesReturnPayload,
  InvoiceForReturn,
  PaginatedResult,
  ReviewSalesReturnPayload,
  SalesReturn,
  SalesReturnStatus,
} from "../types/sales-return.types";

type ListParams = {
  page?: number;
  per_page?: number;
  status?: SalesReturnStatus | "all";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Handles Laravel resource envelopes as well as direct payloads. */
function unwrap<T>(value: unknown): T {
  if (isRecord(value) && "data" in value) return value.data as T;
  return value as T;
}

function normalizePage<T>(
  value: unknown,
  requestedPage: number,
  requestedPerPage: number,
): PaginatedResult<T> {
  if (Array.isArray(value)) {
    return {
      data: value as T[],
      current_page: requestedPage,
      last_page: 1,
      per_page: requestedPerPage,
      total: value.length,
    };
  }

  const page = isRecord(value) ? value : {};
  const rows = Array.isArray(page.data)
    ? (page.data as T[])
    : Array.isArray(page.items)
      ? (page.items as T[])
      : [];

  return {
    data: rows,
    current_page: Number(page.current_page ?? requestedPage),
    last_page: Number(page.last_page ?? 1),
    per_page: Number(page.per_page ?? requestedPerPage),
    total: Number(page.total ?? rows.length),
  };
}

export function getSalesReturnErrorMessage(error: unknown): string {
  if (isRecord(error) && isRecord(error.response)) {
    const responseData = error.response.data;
    if (isRecord(responseData)) {
      const errors = responseData.errors;
      if (isRecord(errors)) {
        const first = Object.values(errors).flatMap((value) =>
          Array.isArray(value) ? value : [value],
        )[0];
        if (typeof first === "string") return first;
      }
      if (typeof responseData.message === "string") {
        return responseData.message;
      }
    }

    const status = isRecord(error.response) ? error.response.status : undefined;
    if (status === 402) {
      return "Sales returns are not included in this store's current subscription plan.";
    }
    if (status === 403) {
      return "You do not have permission to perform this action.";
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export const salesReturnService = {
  async getAll(params: ListParams = {}): Promise<PaginatedResult<SalesReturn>> {
    const page = params.page ?? 1;
    const perPage = params.per_page ?? 10;
    const query: Record<string, string | number> = {
      page,
      per_page: perPage,
    };
    if (params.status && params.status !== "all") query.status = params.status;

    const response = await api.get<unknown>("/sales/returns", {
      params: query,
    });

    return normalizePage<SalesReturn>(unwrap(response.data), page, perPage);
  },

  async getById(returnId: string): Promise<SalesReturn> {
    const response = await api.get<unknown>(`/sales/returns/${returnId}`);
    return unwrap<SalesReturn>(response.data);
  },

  async getInvoice(invoiceId: string): Promise<InvoiceForReturn> {
    const response = await api.get<unknown>(`/sales/${invoiceId}`);
    return unwrap<InvoiceForReturn>(response.data);
  },

  async create(
    invoiceId: string,
    payload: CreateSalesReturnPayload,
  ): Promise<SalesReturn> {
    const response = await api.post<unknown>(
      `/sales/${invoiceId}/returns`,
      payload,
    );
    return unwrap<SalesReturn>(response.data);
  },

  async updateStatus(
    returnId: string,
    payload: ReviewSalesReturnPayload,
  ): Promise<SalesReturn> {
    const response = await api.post<unknown>(
      `/sales/returns/${returnId}/status`,
      payload,
    );
    return unwrap<SalesReturn>(response.data);
  },
};
