import {z} from "zod"
import mongoose from "mongoose"
import { LanguageEnum } from "../enum";


const translateObj = {
    username: {
        ar: "لا يمكن للقبول باسم مستخدم أقل من حرفين",
        en: "min allowed length is 2 char"
    }
};

const matchFields = ({ original, copy, data, ctx, lang }: { original: string, copy: string, data: any, ctx: z.RefinementCtx, lang: LanguageEnum }) => {
    if (data[original] !== data[copy]) {
        ctx.addIssue({
            code: "custom",
            path: [copy],
            message: lang === LanguageEnum.AR ? `يجب تطابق كلا من ${original} , ${copy}` : `Fail to match between ${original}, ${copy}`
        });
    }
};


export const generalValidationFields = {
    matchFields,
    email: (lang:LanguageEnum) => z.email(),
    otp: (lang:LanguageEnum) => z.string().regex(/^\d{6}$/, { error: "invalid code" }),
    password: (lang:LanguageEnum) => z.string().regex(/^(?=.*[a-z])(?=.*\s{0,})(?=.*[A-Z])(?=.*\d)(?=.*[!@#_$%^&*()]).{8,16}$/, { error: "Invalid password" }),
    username: (lang:LanguageEnum) => z.string().min(2, { message: lang === LanguageEnum.AR ? translateObj.username.ar : translateObj.username.en }),
    phone: (lang:LanguageEnum) => z.e164(),
    id: (lang:LanguageEnum) => z.string().refine((data) => { return mongoose.Types.ObjectId.isValid(data) }, { message: "Invalid format" }),
    file: (lang:LanguageEnum) => z.strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer),
        size: z.number(),
        path: z.string()
    })
}