import type { IRole } from "../features/settings/types/role.types";
import type { ISubscription } from "../features/subscriptions/types/subscription.types";
import type { IStore } from "./store.types";

export default interface IUser {
    id: Id;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    email_verified: boolean;
    phone_verified: boolean;
    store_user?: IUserStore | null;
    other_stores?: IUserStore[];
}

export interface IUserStore {
    id: Id;
    store_id: Id;
    subscription?: ISubscription | null;
    store: IStore;
    role?: IRole;
    [key: string]: unknown;
}