import { NextFunction, Request, Response, Router } from "express";
import { StorageApproachEnum } from "../../common/enum";
import { IComment, IResponse } from "../../common/interface";
import { fileValidation, localFileUpload } from "../../common/utils/multer";
import { authentication, responseFormatter, uploadMiddleware, validation } from "../../middleware";
import { commentService } from "./comment.service";
import * as validators from "./comment.validation";

const router = Router({ caseSensitive: true, strict: true });

// 1. Create Comment on a Post
router.post(
    "/:postId",
    authentication(),
    uploadMiddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({ storageApproach: StorageApproachEnum.MEMORY }).array("attachments"),
        validation: fileValidation.image,
        customPath: "comments",
    }),
    validation(validators.createComment),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IComment>> => {
            const data = await commentService.createComment(
                req.validate.params,
                req.validate.body,
                req.user,
                req.files as Express.Multer.File[]
            );
            return { data, status: 201 };
        }
    )
);

// 2. Get All Comments for a Post
router.get(
    "/post/:postId",
    validation(validators.getPostComments),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IComment[]>> => {
            const data = await commentService.getPostComments(req.validate.params);
            return { data, status: 200 };
        }
    )
);

// 3. Get Single Comment by ID
router.get(
    "/:commentId",
    validation(validators.getSingleComment),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IComment>> => {
            const data = await commentService.getSingleComment(req.validate.params);
            return { data, status: 200 };
        }
    )
);

// 4. Update Comment (owner only)
router.patch(
    "/:commentId",
    authentication(),
    uploadMiddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({ storageApproach: StorageApproachEnum.MEMORY }).array("attachments"),
        validation: fileValidation.image,
        customPath: "comments",
    }),
    validation(validators.updateComment),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IComment>> => {
            const data = await commentService.updateComment(
                req.validate.params,
                req.validate.body,
                req.user,
                req.files as Express.Multer.File[]
            );
            return { data, status: 200 };
        }
    )
);

// 5. Delete Comment (comment owner or post owner)
router.delete(
    "/:commentId",
    authentication(),
    validation(validators.deleteComment),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<void>> => {
            await commentService.deleteComment(req.validate.params, req.user);
            return { status: 200 };
        }
    )
);

export default router;
