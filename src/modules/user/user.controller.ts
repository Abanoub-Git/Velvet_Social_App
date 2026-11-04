import { NextFunction, Request, Response, Router } from "express";
import { authentication, responseFormatter, uploadMiddleware } from "../../middleware";
import { userService } from "./user.service";
import { getIssuer } from "../../common/utils";
import { StorageApproachEnum, TokenTypeEnum } from "../../common/enum";
import { fileValidation, localFileUpload } from "../../common/utils/multer";

const router = Router({ caseSensitive: true, strict: true });

router.get("/", authentication(), responseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {
        return { data: req.user };
    }
));



router.patch("/profile-image", authentication(),
uploadMiddleware({multerMiddleware:localFileUpload({storageApproach:StorageApproachEnum.DISK}).single("attachment"),validation:fileValidation.image,customPath:"User"}) ,
responseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {
        return { data: req.file };
    }
));



router.post("/rotate-token", authentication(TokenTypeEnum.REFRESH),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await userService.rotateToken(req.payload,req.user,getIssuer(req));
            return data;
        }
    )
);

router.post("/logout", authentication(),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await userService.logout(req.payload,req.user,req.body);
            return data;
        }
    )
);

export default router;