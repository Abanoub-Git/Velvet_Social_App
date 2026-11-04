import { HUser } from "../../DB/model"
import { JwtPayloadType } from "../service/token.service"

declare module "express-serve-static-core" {
    interface Request {
        validate: any
        user: HUser
        payload:JwtPayloadType
    }
}

//kda ana 3mlt reopen llmodule da w zwdt fe alvalidate 3shan ab3to f alrequest