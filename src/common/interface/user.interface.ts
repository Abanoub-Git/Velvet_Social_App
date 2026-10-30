import { GenderEnum, ProviderEnum, RoleEnum, TwoStepVerificationEnum } from "../enum";

export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    password?: string;
    provider: ProviderEnum;
    phone?: string;
    DOB?: string;
    confirmEmail?: Date;
    image?: string;
    coverImage?: string[];
    changeCredentialsTime?: Date;
    twoStepVerification: TwoStepVerificationEnum;
    gender: GenderEnum;
    role: RoleEnum;
    createdAt?:string;
    updatedAt?:string;
}
