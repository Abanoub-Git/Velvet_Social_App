"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const repository_1 = require("../repository");
const cache_service_1 = require("./cache.service");
const config_1 = require("../../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const enum_1 = require("../enum");
const exception_1 = require("../exception");
const utils_1 = require("../utils");
const node_crypto_1 = require("node:crypto");
class TokenService {
    userRepository;
    cacheService;
    constructor() {
        this.cacheService = cache_service_1.cacheService;
        this.userRepository = new repository_1.UserRepository();
    }
    userBaseKey({ userId }) {
        return `User::${userId.toString()}`;
    }
    userBaseRevokeTokenKey({ userId }) {
        return `${this.userBaseKey({ userId })}::Revoke_Token`;
    }
    userRevokeTokenKey({ userId, jti }) {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
    }
    async createToken({ payload, options, secret = config_1.ACCESS_USER_TOKEN_SIGNATURE }) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verifyToken({ token = "", secret = config_1.ACCESS_USER_TOKEN_SIGNATURE }) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    async getTokenSignatures({ role = enum_1.RoleEnum.USER }) {
        let signatures;
        switch (role) {
            case enum_1.RoleEnum.ADMIN:
                signatures = { accessSignature: config_1.ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: config_1.REFRESH_ADMIN_TOKEN_SIGNATURE };
                break;
            default:
                signatures = { accessSignature: config_1.ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: config_1.REFRESH_USER_TOKEN_SIGNATURE };
                break;
        }
        return signatures;
    }
    async getSignature({ tokenType = enum_1.TokenTypeEnum.ACCESS, role = enum_1.RoleEnum.USER }) {
        const signatures = await this.getTokenSignatures({ role });
        return tokenType == enum_1.TokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature;
    }
    async decodeToken({ authorization = "", tokenType = enum_1.TokenTypeEnum.ACCESS }) {
        const decoded = jsonwebtoken_1.default.decode(authorization);
        if (!decoded?.aud?.length) {
            throw new exception_1.BadRequestException("invalid token");
        }
        const payload = await this.verifyToken({ token: authorization, secret: await this.getSignature({ tokenType, role: decoded.aud[0] }) });
        if (!payload?.sub) {
            throw new exception_1.BadRequestException("missing token payload");
        }
        if (await this.cacheService.exist({ key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {
            throw new exception_1.UnauthorizedException("expired login credentials");
        }
        const user = await this.userRepository.findById({
            id: (0, utils_1.toObjectId)(payload.sub)
        });
        if (!user) {
            throw new exception_1.NotfoundException("Invalid user");
        }
        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new exception_1.UnauthorizedException("Expired login credentials");
        }
        return { user, payload };
    }
    async createLoginCredentials({ user, issuer }) {
        const { accessSignature, refreshSignature } = await this.getTokenSignatures({ role: user.role });
        const jwtid = (0, node_crypto_1.randomUUID)();
        const access_token = await this.createToken({
            payload: { sub: user._id },
            secret: accessSignature,
            options: {
                issuer,
                audience: [user.role],
                expiresIn: config_1.ACCESS_TOKEN_EXPIRES_IN,
                jwtid
            }
        });
        const refresh_token = await this.createToken({
            payload: { sub: user._id },
            secret: refreshSignature,
            options: {
                issuer,
                audience: [user.role],
                expiresIn: config_1.REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            }
        });
        return { access_token, refresh_token };
    }
    async createRevokeToken({ payload, user }) {
        const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
        const refreshExpiresIn = payload.iat + config_1.REFRESH_TOKEN_EXPIRES_IN;
        const revokeTtl = refreshExpiresIn - consumedTime;
        const key = this.userRevokeTokenKey({ userId: user._id, jti: payload.jti });
        await this.cacheService.set({ key, value: payload.jti, ttl: revokeTtl });
        return;
    }
    ;
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
