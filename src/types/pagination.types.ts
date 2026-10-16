export interface IPaginationLink {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
}

export interface IPaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    links: IPaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

export interface IPaginatedResponse<I> {
    data: I;
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: IPaginationMeta;
}