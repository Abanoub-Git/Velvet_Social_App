import { NextFunction, Request, Response } from "express";
import { TokenTypeEnum } from "../common/enum/security.enum";
import { ForbiddenException, UnauthorizedException } from "../common/exception/domain.exception.js";
import { tokenService } from "../common/service/token.service";
import { RoleEnum } from "../common/enum";



export const bearerAuth = async ({req , tokenType = TokenTypeEnum.ACCESS}:{req:Request , tokenType:TokenTypeEnum}) => {
    const credential = req.headers["authorization"];
    const { user, payload } = await tokenService.decodeToken({ authorization: credential as string , tokenType });
    req.user = user;
    req.payload = payload;
};


export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req:Request, res:Response, next:NextFunction) => {
    const { authorization } = req.headers
    if (!authorization) {
        throw new UnauthorizedException("Unauthorized Account")
    }
    await bearerAuth({req,tokenType})
    next()
}
} //ana kda balreturn estfdt eni momken a7ot param. 



export const authorization = (accessRole:RoleEnum) => {
    return async (req:Request, res:Response, next:NextFunction) => {
        if (req.user.role < accessRole) {
            throw new ForbiddenException("Forbidden Account")
        }
        next()
    }
}