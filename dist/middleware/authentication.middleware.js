"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationMiddleware = void 0;
const security_enum_js_1 = require("../common/enum/security.enum.js");
const domain_exception_js_1 = require("../common/exception/domain.exception.js");
const token_security_js_1 = __importDefault(require("../common/security/token.security.js"));
class AuthenticationMiddleware {
    tokenService;
    constructor() {
        this.tokenService = token_security_js_1.default;
    }
    async bearerAuth({ req, authorization, tokenType = security_enum_js_1.TokenTypeEnum.ACCESS }) {
        const { user, payload } = await this.tokenService.decodeToken({ authorization, tokenType });
        req.user = user;
        req.payload = payload;
    }
    authentication = (tokenType = security_enum_js_1.TokenTypeEnum.ACCESS) => {
        return async (req, res, next) => {
            const { authorization } = req.headers;
            if (!authorization || typeof authorization !== "string") {
                throw new domain_exception_js_1.UnauthorizedException("Unauthorized Account");
            }
            const token = authorization.startsWith("Bearer ")
                ? authorization.split(" ")[1]
                : authorization;
            await this.bearerAuth({ req, authorization: token, tokenType });
            next();
        };
    };
    authorization = (accessRole) => {
        return async (req, res, next) => {
            if (!req.user || req.user.role < accessRole) {
                throw new domain_exception_js_1.ForbiddenException("Forbidden Account");
            }
            next();
        };
    };
}
exports.AuthenticationMiddleware = AuthenticationMiddleware;
exports.default = new AuthenticationMiddleware();
