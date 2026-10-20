
import { api } from "../../../lib/api";
import type { IApiResponse } from "../../../lib/api-response.interface";
import type { IRole, CreateRolePayload, IPermissionCategory } from "../types/role.types";

export const roleService = {
    async getAll(): Promise<IRole[]> {
        const response = await api.get<IApiResponse<IRole[]>>("/roles");
        return response.data.data;
    },

    async getPermissions(): Promise<IPermissionCategory[]> {
        const response = await api.get<IApiResponse<IPermissionCategory[]>>(
            "/permissions",
        );
        return response.data.data;
    },

    async create(payload: CreateRolePayload): Promise<IRole> {
        const response = await api.post<IApiResponse<IRole>>(
            "/roles",
            payload,
        );
        return response.data.data;
    },
};
