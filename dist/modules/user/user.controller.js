"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const authentication_middleware_1 = __importDefault(require("../../middleware/authentication.middleware"));
const enum_1 = require("../../common/enum");
const middleware_1 = require("../../middleware");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/rotate-token", authentication_middleware_1.default.authentication(enum_1.TokenTypeEnum.ACCESS), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.rotateToken(req.payload, req.user, `${req.protocol}://${req.host}`);
    return { data, status: 200 };
}));
router.post("/logout", authentication_middleware_1.default.authentication(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    await user_service_1.default.logout(req.payload, req.user, req.body);
    return { data: { message: "Logged out successfully" }, status: 200 };
}));
exports.default = router;
