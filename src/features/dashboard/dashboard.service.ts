import { api } from "../../lib/api";
import type { IApiResponse } from "../../lib/api-response.interface";
import type { DashboardResponse } from "./dashboard.types";

export interface DashboardFilters {
    date?: string;
    from?: string;
    to?: string;
}

export async function getDashboardSummary(filters: DashboardFilters = {},): Promise<DashboardResponse> {
    const response = await api.get<IApiResponse<DashboardResponse>>("/dashboard/summary", { params: filters },
    );

    return response.data.data;
}