"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmTwoStepVerification = exports.resetPassword = exports.resendConfirmEmail = exports.confirmEmail = exports.signup = exports.login = exports.loginSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../../common/utils");
const loginSchema = (lang) => zod_1.z.strictObject({
    email: utils_1.generalValidationFields.email(lang),
    password: utils_1.generalValidationFields.password(lang)
});
exports.loginSchema = loginSchema;
const login = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: utils_1.generalValidationFields.email(lang),
            password: utils_1.generalValidationFields.password(lang)
        }),
        query: zod_1.z.strictObject({
            lang: zod_1.z.string().length(2).optional()
        })
    });
};
exports.login = login;
const signup = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginSchema)(lang).safeExtend({
            username: utils_1.generalValidationFields.username(lang),
            phone: utils_1.generalValidationFields.phone(lang),
            confirmPassword: utils_1.generalValidationFields.password(lang),
        }).superRefine((data, ctx) => {
            utils_1.generalValidationFields.matchFields({ original: "password", copy: "confirmPassword", data, ctx, lang });
        })
    });
};
exports.signup = signup;
const confirmEmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: utils_1.generalValidationFields.email(lang),
            otp: utils_1.generalValidationFields.otp(lang),
        })
    });
};
exports.confirmEmail = confirmEmail;
const resendConfirmEmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: utils_1.generalValidationFields.email(lang)
        })
    });
};
exports.resendConfirmEmail = resendConfirmEmail;
const resetPassword = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: utils_1.generalValidationFields.email(lang),
            otp: utils_1.generalValidationFields.otp(lang),
            password: utils_1.generalValidationFields.password(lang),
            confirmPassword: utils_1.generalValidationFields.password(lang),
        }).superRefine((data, ctx) => { utils_1.generalValidationFields.matchFields({ original: "password", copy: "confirmPassword", data, ctx, lang }); })
    });
};
exports.resetPassword = resetPassword;
const confirmTwoStepVerification = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: utils_1.generalValidationFields.email(lang),
            otp: utils_1.generalValidationFields.otp(lang)
        })
    });
};
exports.confirmTwoStepVerification = confirmTwoStepVerification;
