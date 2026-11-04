"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = exports.bearerAuth = void 0;
const security_enum_1 = require("../common/enum/security.enum");
const domain_exception_js_1 = require("../common/exception/domain.exception.js");
const token_service_1 = require("../common/service/token.service");
const bearerAuth = async ({ req, tokenType = security_enum_1.TokenTypeEnum.ACCESS }) => {
    const credential = req.headers["authorization"];
    const { user, payload } = await token_service_1.tokenService.decodeToken({ authorization: credential, tokenType });
    req.user = user;
    req.payload = payload;
};
exports.bearerAuth = bearerAuth;
const authentication = (tokenType = security_enum_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new domain_exception_js_1.UnauthorizedException("Unauthorized Account");
        }
        await (0, exports.bearerAuth)({ req, tokenType });
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (req.user.role < accessRole) {
            throw new domain_exception_js_1.ForbiddenException("Forbidden Account");
        }
        next();
    };
};
exports.authorization = authorization;
