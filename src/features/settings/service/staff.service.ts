
import { api } from "../../../lib/api";
import type { IApiResponse } from "../../../lib/api-response.interface";
import type { IPaginatedResponse } from "../../../types/pagination.types";
import type {
    IStaff,
    CreateStaffPayload,
    AssignStaffRolePayload,
} from "../types/staff.types";

export const staffService = {
    async getAll(params: { search: string; page: number }) {
        const response = await api.get<IPaginatedResponse<IStaff[]>>("/staff", {
            params: {
                search: params.search || undefined,
                page: params.page,
            },
        });

        return response.data;
    },

    async create(payload: CreateStaffPayload): Promise<IStaff> {
        const response = await api.post<IApiResponse<IStaff>>("/staff", payload);
        return response.data.data;
    },

    async assignRole(staffId: string, payload: AssignStaffRolePayload): Promise<IStaff> {
        const response = await api.put<IApiResponse<IStaff>>(`/staff/${staffId}/role`, payload);

        return response.data.data;
    },
};
