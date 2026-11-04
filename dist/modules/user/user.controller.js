"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const user_service_1 = require("./user.service");
const utils_1 = require("../../common/utils");
const enum_1 = require("../../common/enum");
const multer_1 = require("../../common/utils/multer");
const router = (0, express_1.Router)({ caseSensitive: true, strict: true });
router.get("/", (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    return { data: req.user };
}));
router.patch("/profile-image", (0, middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({ multerMiddleware: (0, multer_1.localFileUpload)({ storageApproach: enum_1.StorageApproachEnum.DISK }).single("attachment"), validation: multer_1.fileValidation.image, customPath: "User" }), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    return { data: req.file };
}));
router.post("/rotate-token", (0, middleware_1.authentication)(enum_1.TokenTypeEnum.REFRESH), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.userService.rotateToken(req.payload, req.user, (0, utils_1.getIssuer)(req));
    return data;
}));
router.post("/logout", (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.userService.logout(req.payload, req.user, req.body);
    return data;
}));
exports.default = router;
