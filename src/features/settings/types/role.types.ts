
export interface IPermission {
    id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    feature?: string | null;
}

export interface IPermissionCategory {
    category: string;
    permissions: IPermission[];
}

export interface IRole {
    id: string;
    name: string;
    permissions?: IPermission[];
}

export interface CreateRolePayload {
    name: string;
    permission_ids: string[];
}
