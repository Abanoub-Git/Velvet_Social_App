import { NextFunction, Request, Response, Router } from "express";
import authService from "./authetication.service";
import { responseFormatter, validation } from "../../middleware";
import * as validators from './authentication.validation'
import { IResponse, IUser } from "../../common/interface";
const router = Router({ strict: true, caseSensitive: true });


router.post("/loginWithGmail", 
    responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse> => {
        const data = await authService.loginWithGmail(req.body, `${req.protocol}://${req.host}`);
        return { data, status: 200 };
    }
));



router.post("/signup",validation(validators.signup) ,
responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IUser>> => {
        const data = await authService.signup(req.validate.body)
        return { data, status: 201 }
    }
));


router.patch("/confirm-email", validation(validators.confirmEmail) ,
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction) => {
            await authService.confirmEmail(req.body)
    }
))


router.patch("/resend-confirm-email", validation(validators.resendConfirmEmail) ,
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction) => {
            await authService.resendConfirmEmail(req.body)
        }
))



router.post("/login", validation(validators.login), 
responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse<any>> => {
        const data = await authService.login( req.validate.body, `${req.protocol}://${req.get("host")}` );
        return { data, status: 200 };
    }
));



router.post("/request-confirm-password", validation(validators.resendConfirmEmail), 
responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse<void>> => {
        await authService.requestForgotPassword(req.validate.body);
        return { status: 200 };
    }
));


router.post("/verify-forgot-password", validation(validators.confirmEmail), 
responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse<void>> => {
        await authService.verifyForgotPassword(req.validate.body);
        return { status: 200 };
    }
));


router.patch("/reset-password", validation(validators.resetPassword), 
responseFormatter(
    async (req: Request, res: Response, next: NextFunction): Promise<IResponse<void>> => {
        await authService.resetPassword(req.validate.body);
        return { status: 200 };
    }
));


export default router;