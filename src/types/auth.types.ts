import type IUser from "./user.types";

export interface IAuthResponse {
  data: IUser;
  access_token: string;
  expires_in: number;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}


export interface RegisterCredentials extends Omit<IUser, 'email_verified' | 'phone_verified' | 'id'> {
  password: string;
  password_confirmation: string;
}

