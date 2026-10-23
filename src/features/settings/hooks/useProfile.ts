import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import type IUser from "../../../types/user.types";

export type UpdateProfilePayload = Pick<IUser, "first_name" | "last_name"> & {
    phone: string;
};

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateProfilePayload) => api.patch("/auth/profile", payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
    });
}

export type ChangePasswordPayload = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

export function useChangePassword() {
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) =>
            api.put("/auth/profile/password", payload),
    });
}