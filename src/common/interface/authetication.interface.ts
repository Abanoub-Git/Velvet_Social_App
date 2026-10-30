import { Request } from "express";
import { HydratedDocument } from "mongoose";
import { IUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";

export interface IAuthRequest extends Request {
    user: HydratedDocument<IUser>;
    payload: JwtPayload;
}

export interface ILoginWithGmail {
    idToken: string;
}