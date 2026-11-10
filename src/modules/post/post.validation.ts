import { z } from "zod";
import { generalValidationFields } from "../../common/utils";
import { LanguageEnum } from "../../common/enum";

export const createPost = (lang: LanguageEnum) => {
    return z.object({
        body: z.strictObject({
            content: z.string().trim().min(1),
        }),
    });
};

export const getSinglePost = (lang: LanguageEnum) => {
    return z.object({
        params: z.strictObject({
            postId: generalValidationFields.id(lang),
        }),
    });
};

export const updatePost = (lang: LanguageEnum) => {
    return z.object({
        params: z.strictObject({
            postId: generalValidationFields.id(lang),
        }),
        body: z.strictObject({
            content: z.string().trim().min(1).optional(),
        }),
    });
};

export const deletePost = (lang: LanguageEnum) => {
    return z.object({
        params: z.strictObject({
            postId: generalValidationFields.id(lang),
        }),
    });
};

