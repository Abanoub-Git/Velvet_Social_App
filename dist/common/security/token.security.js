"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_js_1 = require("../../config.js");
const domain_exception_js_1 = require("../exception/domain.exception.js");
const security_enum_js_1 = require("../enum/security.enum.js");
const user_enum_js_1 = require("../enum/user.enum.js");
const node_crypto_1 = require("node:crypto");
const repository_1 = require("../../common/repository");
const service_1 = require("../../common/service");
class TokenService {
    userRepository;
    cacheService;
    constructor() {
        this.cacheService = service_1.cacheService;
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
    async createToken({ payload = {}, options = {}, secret = config_js_1.ACCESS_USER_TOKEN_SIGNATURE } = {}) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verifyToken({ token = "", secret = config_js_1.ACCESS_USER_TOKEN_SIGNATURE } = {}) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    async getTokenSignatures({ role = user_enum_js_1.RoleEnum.USER } = {}) {
        let signatures;
        switch (role) {
            case user_enum_js_1.RoleEnum.ADMIN:
                signatures = {
                    accessSignature: config_js_1.ACCESS_ADMIN_TOKEN_SIGNATURE,
                    refreshSignature: config_js_1.REFRESH_ADMIN_TOKEN_SIGNATURE
                };
                break;
            default:
                signatures = {
                    accessSignature: config_js_1.ACCESS_USER_TOKEN_SIGNATURE,
                    refreshSignature: config_js_1.REFRESH_USER_TOKEN_SIGNATURE
                };
                break;
        }
        return signatures;
    }
    async getSignature({ tokenType = security_enum_js_1.TokenTypeEnum.ACCESS, role = user_enum_js_1.RoleEnum.USER } = {}) {
        const signatures = await this.getTokenSignatures({ role });
        return tokenType === security_enum_js_1.TokenTypeEnum.ACCESS
            ? signatures.accessSignature
            : signatures.refreshSignature;
    }
    async decodeToken({ authorization = "", tokenType = security_enum_js_1.TokenTypeEnum.ACCESS } = {}) {
        const decoded = jsonwebtoken_1.default.decode(authorization);
        if (!decoded || typeof decoded === "string" || !decoded.aud) {
            throw new domain_exception_js_1.BadRequestException("invalid token");
        }
        const role = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
        const payload = await this.verifyToken({
            token: authorization,
            secret: await this.getSignature({
                tokenType,
                role: Number(role)
            })
        });
        if (typeof payload === "string" || !payload.sub || !payload.jti || !payload.iat) {
            throw new domain_exception_js_1.BadRequestException("missing token payload");
        }
        if (await this.cacheService.exist({
            key: this.userRevokeTokenKey({
                userId: payload.sub,
                jti: payload.jti
            })
        })) {
            throw new domain_exception_js_1.UnauthorizedException("expired login credentials");
        }
        const user = await this.userRepository.findById({
            id: new mongoose_1.default.Types.ObjectId(payload.sub),
            options: { lean: false }
        });
        if (!user) {
            throw new domain_exception_js_1.NotfoundException("Invalid user");
        }
        if (new Date(user.changeCredentialsTime ?? 0).getTime() > payload.iat * 1000) {
            throw new domain_exception_js_1.UnauthorizedException("Expired login credentials");
        }
        return { user, payload };
    }
    async createLoginCredentials({ user, issuer, options = {} }) {
        const { accessSignature, refreshSignature } = await this.getTokenSignatures({ role: user.role });
        const jwtid = (0, node_crypto_1.randomUUID)();
        const access_token = await this.createToken({
            payload: { sub: user._id.toString() },
            secret: accessSignature,
            options: {
                ...options,
                issuer,
                audience: [String(user.role)],
                expiresIn: config_js_1.ACCESS_TOKEN_EXPIRES_IN,
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
                expiresIn: config_js_1.REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            }
        });
        return { access_token, refresh_token };
    }
    async createRevokeToken({ payload, user }) {
        const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
        const refreshExpiresIn = payload.iat + config_js_1.REFRESH_TOKEN_EXPIRES_IN;
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
exports.TokenService = TokenService;
exports.default = new TokenService();
