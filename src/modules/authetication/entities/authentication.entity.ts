export type ILoginResponse =
| {
    twoStepVerification: true;
    message: string;
}
| {
    access_token: string;
    refresh_token: string;
};



export interface iLoginWithGmailResponse{
    status: number;
    data:ILoginResponse
}