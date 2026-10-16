export interface IApiResponse<T> {
    data: T;
}

export interface IAuthApiResponse<T> extends IApiResponse<T> {
    access_token: string
    expires_in: string
}