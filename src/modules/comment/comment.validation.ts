import { z } from "zod";
import { generalValidationFields } from "../../common/utils";
import { LanguageEnum } from "../../common/enum";

export const createComment = (lang: LanguageEnum) => {
    return z.object({
        params: z.strictObject({
            postId: generalValidationFields.id(lang),
        }),
        body: z.strictObject({
            content: z.string().trim().min(1),
        }),
    });
};

export const getPostComments = (lang: LanguageEnum) => {
    return z.object({
        params: z.strictObject({
            postId: generalValidationFields.id(lang),
        }),
    });
};

export const getSingleComment = (lang: LanguageEnum) => {
    return z.object({
        params: z.strictObject({
            commentId: generalValidationFields.id(lang),
        }),
    });
};

export const updateComment = (lang: LanguageEnum) => {
    return z.object({
        params: z.strictObject({
            commentId: generalValidationFields.id(lang),
        }),
        body: z.strictObject({
            content: z.string().trim().min(1).optional(),
        }),
    });
};

export const deleteComment = (lang: LanguageEnum) => {
    return z.object({
        params: z.strictObject({
            commentId: generalValidationFields.id(lang),
        }),
    });
};

