"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authetication_service_1 = __importDefault(require("./authetication.service"));
const middleware_1 = require("../../middleware");
const validators = __importStar(require("./authentication.validation"));
const utils_1 = require("../../common/utils");
const router = (0, express_1.Router)({ strict: true, caseSensitive: true });
router.post("/loginWithGmail", (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const { data, status } = await authetication_service_1.default.LoginWithGmail(req.body, (0, utils_1.getIssuer)(req));
    return { data, status: 201 };
}));
router.post("/signup", (0, middleware_1.validation)(validators.signup), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await authetication_service_1.default.signup(req.validate.body);
    return { data, status: 201 };
}));
router.patch("/confirm-email", (0, middleware_1.validation)(validators.confirmEmail), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    await authetication_service_1.default.confirmEmail(req.body);
}));
router.patch("/resend-confirm-email", (0, middleware_1.validation)(validators.resendConfirmEmail), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    await authetication_service_1.default.resendConfirmEmail(req.body);
}));
router.post("/login", (0, middleware_1.validation)(validators.login), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await authetication_service_1.default.login(req.validate.body, (0, utils_1.getIssuer)(req));
    return { data, status: 201 };
}));
router.post("/request-confirm-password", (0, middleware_1.validation)(validators.resendConfirmEmail), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    await authetication_service_1.default.requestForgotPassword(req.validate.body);
    return { status: 200 };
}));
router.post("/verify-forgot-password", (0, middleware_1.validation)(validators.confirmEmail), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    await authetication_service_1.default.verifyForgotPassword(req.validate.body);
    return { status: 200 };
}));
router.patch("/reset-password", (0, middleware_1.validation)(validators.resetPassword), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    await authetication_service_1.default.resetPassword(req.validate.body);
    return { status: 200 };
}));
exports.default = router;
