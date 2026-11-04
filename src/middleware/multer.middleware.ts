import {NextFunction, Request, RequestHandler, Response} from 'express'
import { BadRequestException } from '../common/exception'
import { processMulterUpload } from '../common/utils/multer'
import { MulterRequest } from '../common/interface'

export const uploadMiddleware = ({isRequired=true, multerMiddleware, customPath = "general", validation = [] }:{
    isRequired?:boolean, multerMiddleware:RequestHandler, customPath?:string, validation:string[] }) => {
    return (req:Request, res:Response, next:NextFunction) => {
        multerMiddleware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }))
                return;
            }
           try {
                await processMulterUpload({req: req as MulterRequest,customPath,validation});
                next()
            } catch (error:any) {
                next(new Error(error.message, { cause: { status: 400 } }))
            }
        })
    }
}
