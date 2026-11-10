import { NextFunction, Request, Response, Router } from "express";
import { StorageApproachEnum } from "../../common/enum";
import { IPost, IResponse } from "../../common/interface";
import { fileValidation, localFileUpload } from "../../common/utils/multer";
import { authentication, responseFormatter, uploadMiddleware, validation } from "../../middleware";
import { postService } from "./post.service";
import * as validators from "./post.validation";

const router = Router({ caseSensitive: true, strict: true });

router.post(
    "/",
    authentication(),
    uploadMiddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({ storageApproach: StorageApproachEnum.MEMORY }).array("attachments"),
        validation: fileValidation.image,
        customPath: "posts",
    }),
    validation(validators.createPost),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IPost>> => {
            const data = await postService.createPost(req.validate.body, req.user, req.files as Express.Multer.File[]);
            return { data, status: 201 };
        }
    )
);

router.get(
    "/",
    authentication(),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IPost[]>> => {
            const data = await postService.getAllPosts(req.user);
            return { data, status: 200 };
        }
    )
);

router.get(
    "/:postId",
    validation(validators.getSinglePost),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IPost>> => {
            const data = await postService.getSinglePost(req.validate.params);
            return { data, status: 200 };
        }
    )
);

router.patch(
    "/:postId",
    authentication(),
    uploadMiddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({ storageApproach: StorageApproachEnum.MEMORY }).array("attachments"),
        validation: fileValidation.image,
        customPath: "posts",
    }),
    validation(validators.updatePost),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IPost>> => {
            const data = await postService.updatePost(
                req.validate.params,
                req.validate.body,
                req.user,
                req.files as Express.Multer.File[]
            );
            return { data, status: 200 };
        }
    )
);

router.delete(
    "/:postId",
    authentication(),
    validation(validators.deletePost),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<void>> => {
            await postService.deletePost(req.validate.params, req.user);
            return { status: 200 };
        }
    )
);

export default router;
