export type SuccessResponseType<T> = {
  message?: string;
  data: T;
};

export type PaginatedSuccessResponseType<T> = SuccessResponseType<T> & {
  info: {
    perPage: number;
    page: number;
  };
};

export type UserTokenPayload = {
  authId: string;
  userId: string;
  username: string;
  landlord: string | null;
  tenant: string | null;
};

declare module 'express' {
  export interface Request {
    user?: UserTokenPayload;
  }
}
