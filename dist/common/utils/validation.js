"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("../enum");
const translateObj = {
    username: {
        ar: "لا يمكن للقبول باسم مستخدم أقل من حرفين",
        en: "min allowed length is 2 char"
    }
};
const matchFields = ({ original, copy, data, ctx, lang }) => {
    if (data[original] !== data[copy]) {
        ctx.addIssue({
            code: "custom",
            path: [copy],
            message: lang === enum_1.LanguageEnum.AR ? `يجب تطابق كلا من ${original} , ${copy}` : `Fail to match between ${original}, ${copy}`
        });
    }
};
exports.generalValidationFields = {
    matchFields,
    email: (lang) => zod_1.z.email(),
    otp: (lang) => zod_1.z.string().regex(/^\d{6}$/, { error: "invalid code" }),
    password: (lang) => zod_1.z.string().regex(/^(?=.*[a-z])(?=.*\s{0,})(?=.*[A-Z])(?=.*\d)(?=.*[!@#_$%^&*()]).{8,16}$/, { error: "Invalid password" }),
    username: (lang) => zod_1.z.string().min(2, { message: lang === enum_1.LanguageEnum.AR ? translateObj.username.ar : translateObj.username.en }),
    phone: (lang) => zod_1.z.e164(),
    id: (lang) => zod_1.z.string().refine((data) => { return mongoose_1.default.Types.ObjectId.isValid(data); }, { message: "Invalid format" }),
    file: (lang) => zod_1.z.strictObject({
        fieldname: zod_1.z.string(),
        originalname: zod_1.z.string(),
        encoding: zod_1.z.string(),
        mimetype: zod_1.z.string(),
        buffer: zod_1.z.instanceof(Buffer),
        size: zod_1.z.number(),
        path: zod_1.z.string()
    })
};
