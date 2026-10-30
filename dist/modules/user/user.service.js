"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const repository_1 = require("../../common/repository");
const service_1 = require("../../common/service");
const enum_1 = require("../../common/enum");
const exception_1 = require("../../common/exception");
const token_security_1 = __importDefault(require("../../common/security/token.security"));
const config_1 = require("../../config");
class UserService {
    userRepository;
    cacheService;
    constructor() {
        this.cacheService = service_1.cacheService;
        this.userRepository = new repository_1.UserRepository();
    }
    async rotateToken(payload, user, issuer) {
        const accessExpiresIn = (payload.iat + config_1.ACCESS_TOKEN_EXPIRES_IN) * 1000;
        const currentTime = Date.now() + (30 * 60000);
        if (currentTime < accessExpiresIn) {
            throw new exception_1.ConflictException("Sorry we cannot create new login credentials while current access token still within valid time range");
        }
        const data = await token_security_1.default.createLoginCredentials({ user, issuer });
        await token_security_1.default.createRevokeToken({ payload, user });
        return data;
    }
    async logout(payload, user, { action = enum_1.LogoutEnum.DEVICE } = {}) {
        switch (action) {
            case enum_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.cacheService.del({
                    key: await this.cacheService.keys({ prefix: token_security_1.default.userBaseRevokeTokenKey({ userId: payload.sub }) })
                });
                break;
            default:
                await token_security_1.default.createRevokeToken({ payload, user });
                break;
        }
        return;
    }
}
exports.UserService = UserService;
exports.default = new UserService();
