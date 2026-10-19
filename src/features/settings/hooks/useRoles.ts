
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../service/role.service";
import type { CreateRolePayload } from "../types/role.types";

export function useRoles() {
    return useQuery({
        queryKey: ["roles"],
        queryFn: roleService.getAll,
        staleTime: 30_000,
    });
}

export function usePermissions() {
    return useQuery({
        queryKey: ["permissions"],
        queryFn: roleService.getPermissions,
        staleTime: 60_000,
    });
}

export function useCreateRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateRolePayload) =>
            roleService.create(payload),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["roles"],
            });
        },
    });
}
