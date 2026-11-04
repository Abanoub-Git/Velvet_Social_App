import { Request as ExpressRequest } from "express";

export interface MulterRequest extends ExpressRequest {
    file?: Express.Multer.File;
    files?: Express.Multer.File[] | {
        [fieldname: string]: Express.Multer.File[];
    };
}