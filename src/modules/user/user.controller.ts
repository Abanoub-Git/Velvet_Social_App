import { NextFunction, Response, Router } from "express";
import userService from "./user.service";
import { IAuthRequest, IResponse } from "../../common/interface";
import authenticationMiddleware from "../../middleware/authentication.middleware";
import { TokenTypeEnum } from "../../common/enum";
import { responseFormatter } from "../../middleware";

const router = Router({ strict: true, caseSensitive: true });

router.post("/rotate-token",
    authenticationMiddleware.authentication(TokenTypeEnum.ACCESS),
    responseFormatter(
        async (req: IAuthRequest, res: Response, next: NextFunction): Promise<IResponse> => {
            const data = await userService.rotateToken(
                req.payload,
                req.user,
                `${req.protocol}://${req.host}`
            );
            return { data, status: 200 };
        }
    )
);

router.post("/logout",
    authenticationMiddleware.authentication(),
    responseFormatter(
        async (req: IAuthRequest, res: Response, next: NextFunction): Promise<IResponse> => {
            await userService.logout(req.payload, req.user, req.body);
            return { data: { message: "Logged out successfully" }, status: 200 };
        }
    )
);

export default router;