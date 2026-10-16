import type { ILocalGovernmentArea } from "./lga.types";

export interface IStore {
    id: number;
    name: string;
    address: string;
    lga: ILocalGovernmentArea;
    zip_code?: string;
}

export interface CreateStorePayload {
    name: string;
    address: string;
    lga_id: Id;
    zip_code?: string;
}
