import type { IRole } from "./role.types";

export interface IStaffUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
}

export interface IStaff {
    id: string;
    store_id: string;
    user: IStaffUser;
    last_login: string | null;
    is_active: boolean;
    role: IRole | null;
}

export interface CreateStaffPayload {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export interface AssignStaffRolePayload {
    role_id: string;
}
