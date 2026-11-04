"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const enum_1 = require("../../common/enum");
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const service_1 = require("../../common/service");
const config_1 = require("../../config");
class UserService {
    tokenService;
    userRepository;
    cacheService;
    constructor() {
        this.tokenService = service_1.tokenService;
        this.userRepository = new repository_1.UserRepository();
        this.cacheService = service_1.cacheService;
    }
    async rotateToken(payload, user, issuer) {
        const accessExpiresIn = (payload.iat + config_1.ACCESS_TOKEN_EXPIRES_IN) * 1000;
        const currentTime = Date.now() + (30 * 60000);
        if (currentTime < accessExpiresIn) {
            throw new exception_1.ConflictException("Sorry we cannot create new login credentials while current access token still within valid time range");
        }
        const data = await this.tokenService.createLoginCredentials({ user, issuer });
        await this.tokenService.createRevokeToken({ payload, user });
        return data;
    }
    async logout(payload, user, { action = enum_1.LogoutEnum.DEVICE }) {
        switch (action) {
            case enum_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.cacheService.del({ key: await this.cacheService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: payload.sub }) }) });
                break;
            default:
                await this.tokenService.createRevokeToken({ payload, user });
                break;
        }
        return;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
