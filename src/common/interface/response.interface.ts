export interface IResponse<T=any,Z=any> {
    message?: boolean;
    data?: T;
    extra?:Z;
    status?: number;
}