import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import mongoose, { HydratedDocument } from "mongoose";
import {ACCESS_ADMIN_TOKEN_SIGNATURE,ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNATURE,REFRESH_ADMIN_TOKEN_SIGNATURE,REFRESH_TOKEN_EXPIRES_IN,REFRESH_USER_TOKEN_SIGNATURE} from "../../config.js";
import {BadRequestException,NotfoundException,UnauthorizedException} from "../exception/domain.exception.js";
import { TokenTypeEnum } from "../enum/security.enum.js";
import { RoleEnum } from "../enum/user.enum.js";
import { randomUUID } from "node:crypto";
import { UserRepository } from "../../common/repository";
import {cacheService, CacheService } from "../../common/service";
import { IUser } from "../../common/interface";

export class TokenService {
    private userRepository : UserRepository
    private cacheService : CacheService
    constructor() {
        this.cacheService = cacheService
        this.userRepository = new UserRepository()
    }
    userBaseKey({ userId }: { userId: string | mongoose.Types.ObjectId }): string {
        return `User::${userId.toString()}`;
    }

    userBaseRevokeTokenKey({ userId }: { userId: string | mongoose.Types.ObjectId }): string {
        return `${this.userBaseKey({ userId })}::Revoke_Token`;
    }

    userRevokeTokenKey({ userId, jti }: { userId: string | mongoose.Types.ObjectId, jti: string }): string {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
    }

    async createToken({
        payload = {},
        options = {},
        secret = ACCESS_USER_TOKEN_SIGNATURE
    }: {
        payload?: jwt.JwtPayload;
        options?: SignOptions;
        secret?: jwt.Secret;
    } = {}): Promise<string> {
        return jwt.sign(payload, secret, options);
    }

    async verifyToken({
        token = "",
        secret = ACCESS_USER_TOKEN_SIGNATURE
    }: {
        token?: string;
        secret?: jwt.Secret;
    } = {}): Promise<string | JwtPayload> {
        return jwt.verify(token, secret);
    }

    private async getTokenSignatures({ role = RoleEnum.USER }: { role?: RoleEnum } = {}) {
        let signatures;

        switch (role) {
            case RoleEnum.ADMIN:
                signatures = {
                    accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE,
                    refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE
                };
                break;

            default:
                signatures = {
                    accessSignature: ACCESS_USER_TOKEN_SIGNATURE,
                    refreshSignature: REFRESH_USER_TOKEN_SIGNATURE
                };
                break;
        }

        return signatures;
    }

    private async getSignature({
        tokenType = TokenTypeEnum.ACCESS,
        role = RoleEnum.USER
    }: {
        tokenType?: TokenTypeEnum;
        role?: RoleEnum;
    } = {}): Promise<string> {
        const signatures = await this.getTokenSignatures({ role });

        return tokenType === TokenTypeEnum.ACCESS
            ? signatures.accessSignature
            : signatures.refreshSignature;
    }

    async decodeToken({
        authorization = "",
        tokenType = TokenTypeEnum.ACCESS
    }: {
        authorization?: string;
        tokenType?: TokenTypeEnum;
    } = {}) {
        const decoded = jwt.decode(authorization);

        if (!decoded || typeof decoded === "string" || !decoded.aud) {
            throw new BadRequestException("invalid token");
        }

        const role = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;

        const payload = await this.verifyToken({
            token: authorization,
            secret: await this.getSignature({
                tokenType,
                role: Number(role) as RoleEnum
            })
        });

        if (typeof payload === "string" || !payload.sub || !payload.jti || !payload.iat) {
            throw new BadRequestException("missing token payload");
        }

        if (await this.cacheService.exist({
            key: this.userRevokeTokenKey({
                userId: payload.sub,
                jti: payload.jti
            })
        })) {
            throw new UnauthorizedException("expired login credentials");
        }

        const user = await this.userRepository.findById({
            id: new mongoose.Types.ObjectId(payload.sub),
            options: { lean: false }
        });

        if (!user) {
            throw new NotfoundException("Invalid user");
        }

        if (new Date(user.changeCredentialsTime ?? 0).getTime() > payload.iat * 1000) {
            throw new UnauthorizedException("Expired login credentials");
        }

        return { user, payload };
    }

    async createLoginCredentials({
        user,
        issuer,
        options = {}
    }: {
        user: HydratedDocument<IUser>;
        issuer: string;
        options?: SignOptions;
    }): Promise<{ access_token: string; refresh_token: string }> {
        const { accessSignature, refreshSignature } =
            await this.getTokenSignatures({ role: user.role });
        const jwtid = randomUUID();
        const access_token = await this.createToken({
            payload: { sub: user._id.toString() },
            secret: accessSignature,
            options: {
                ...options,
                issuer,
                audience: [String(user.role)],
                expiresIn: ACCESS_TOKEN_EXPIRES_IN,
                jwtid
            }
        });
        const refresh_token = await this.createToken({
            payload: { sub: user._id.toString() },
            secret: refreshSignature,
            options: {
                ...options,
                issuer,
                audience: [String(user.role)],
                expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            }
        });
        return { access_token, refresh_token };
    }

    async createRevokeToken({
        payload,
        user
    }: {
        payload: JwtPayload & { iat: number; jti: string };
        user: HydratedDocument<IUser>;
    }): Promise<void> {
        const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
        const refreshExpiresIn = payload.iat + REFRESH_TOKEN_EXPIRES_IN;
        const revokeTtl = refreshExpiresIn - consumedTime;
        const key = this.userRevokeTokenKey({
            userId: user._id,
            jti: payload.jti
        });
        await this.cacheService.set({
            key,
            value: payload.jti,
            ttl: revokeTtl
        });
        return;
    }
}

export default new TokenService();
