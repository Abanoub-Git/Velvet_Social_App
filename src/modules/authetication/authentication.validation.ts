import { z } from "zod";
import { generalValidationFields } from "../../common/utils";
import { LanguageEnum } from "../../common/enum";


export const loginSchema = (lang:LanguageEnum) =>
    z.strictObject({
        email: generalValidationFields.email(lang),
        password: generalValidationFields.password(lang)
    })


export const login = (lang:LanguageEnum) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            password: generalValidationFields.password(lang)
        }),
        query: z.strictObject({
            lang: z.string().length(2).optional()
        })
    });
};


export const signup = (lang:LanguageEnum) => {
    return z.object({
        body: loginSchema(lang).safeExtend({
            username: generalValidationFields.username(lang),
            phone: generalValidationFields.phone(lang),
            confirmPassword: generalValidationFields.password(lang),
        }).superRefine((data, ctx) => {
            generalValidationFields.matchFields({ original: "password", copy: "confirmPassword", data, ctx ,lang})
        })
    })
}


export const confirmEmail = (lang:LanguageEnum) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang),
        })
    })
}


export const resendConfirmEmail = (lang:LanguageEnum) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang)
        })
    })
}



export const resetPassword = (lang:LanguageEnum) => {
    return z.object({
        body: z.strictObject({
        email: generalValidationFields.email(lang),
        otp: generalValidationFields.otp(lang),
        password: generalValidationFields.password(lang),
        confirmPassword: generalValidationFields.password(lang),
        }).superRefine((data, ctx) => {generalValidationFields.matchFields({original: "password",copy: "confirmPassword",data,ctx,lang});})
    });
};



export const confirmTwoStepVerification = (lang:LanguageEnum) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang)
        })
    })
}