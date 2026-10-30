import { NextFunction, Response } from "express";
import { TokenTypeEnum } from "../common/enum/security.enum.js";
import { RoleEnum } from "../common/enum/user.enum.js";
import { ForbiddenException, UnauthorizedException } from "../common/exception/domain.exception.js";
import { IAuthRequest } from "../common/interface";
import tokenServiceInstance, { TokenService } from "../common/security/token.security.js";

export class AuthenticationMiddleware {
    private tokenService: TokenService;
    constructor() {
        this.tokenService = tokenServiceInstance;
    }

    private async bearerAuth({req,authorization,tokenType = TokenTypeEnum.ACCESS
    }: {
        req: IAuthRequest;
        authorization: string;
        tokenType?: TokenTypeEnum;
    }): Promise<void> {
        const { user, payload } = await this.tokenService.decodeToken({authorization,tokenType});
        req.user = user;
        req.payload = payload;
    }

    authentication = (tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS) => {
        return async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
            const { authorization } = req.headers;
            if (!authorization || typeof authorization !== "string") {
                throw new UnauthorizedException("Unauthorized Account");
            }

            const token = authorization.startsWith("Bearer ")
                ? authorization.split(" ")[1]
                : authorization;

            await this.bearerAuth({ req, authorization: token!, tokenType });
            next();
        };
    };

    authorization = (accessRole: RoleEnum) => {
        return async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
            if (!req.user || req.user.role < accessRole) {
                throw new ForbiddenException("Forbidden Account");
            }
            next();
        };
    };
}

export default new AuthenticationMiddleware();