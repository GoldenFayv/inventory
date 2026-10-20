export interface ILocalGovernmentArea {
    id: Id;
    name: string;
    state: {
        id: Id;
        name: string;
    }
}

export interface IState {
    id: Id;
    name: string;
    lga: ILocalGovernmentArea[];
}