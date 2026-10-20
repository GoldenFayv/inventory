import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api"; // use the same client as your other hooks
import type { CreateStorePayload } from "../../../types/store.types";
// import { useAuth } from "../../../app/AuthProvider";


// const { user } = useAuth();

// export function useStore() {
//     return useQuery({
//         queryKey: ["store"],
//         queryFn: async () => {
//             return user?.store_user?.store as IStore;
//         },
//     });
// }

export function useUpdateStore() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateStorePayload) => api.patch("/store", payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["store"] }),
    });
}