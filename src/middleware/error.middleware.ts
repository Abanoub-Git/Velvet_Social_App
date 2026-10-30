import type { NextFunction, Request, Response } from "express";
import { IError } from "../common/interface";



export const globalErrorHandling = (error: IError,req: Request,res: Response,next: NextFunction
): Response => {
    return res.status(error.status ?? 500).json({
        error_message: error.message || "server error",
        error,
        cause: error.cause,
        stack: error.stack
    });
};