
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffService } from "../service/staff.service";
import type {
    CreateStaffPayload,
    AssignStaffRolePayload,
} from "../types/staff.types";
import { api } from "../../../lib/api";


export function useStaff(params: { search: string; page: number }) {
    return useQuery({
        queryKey: ["staff", params],
        queryFn: () => staffService.getAll(params),
        staleTime: 30_000,
        placeholderData: (previousData) => previousData,
    });
}


export function useCreateStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateStaffPayload) => staffService.create(payload),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["staff"] }),
    });
}

export function useAssignStaffRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ staffId, payload }: { staffId: string; payload: AssignStaffRolePayload; }) => staffService.assignRole(staffId, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
    });
}

export function useSetStaffActive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ staffId }: { staffId: string; }) =>
            api.patch(`/staff/${staffId}/status`,),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
    });
}
