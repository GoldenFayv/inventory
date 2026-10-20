import type { ILocalGovernmentArea } from "./lga.types";

export interface IStore {
    id: Id;
    name: string;
    address: string;
    lga: ILocalGovernmentArea;
    zip_code?: string;
    email?: string;
    phone?: string
}

export interface CreateStorePayload {
    name: string;
    address: string;
    lga_id: Id;
    zip_code?: string;
    phone?: string;
    email?: string;
}
