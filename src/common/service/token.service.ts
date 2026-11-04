import mongoose from "mongoose"
import { UserRepository } from "../repository"
import { cacheService, CacheService } from "./cache.service"
import { ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNATURE } from "../../config"
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken"
import { RoleEnum, TokenTypeEnum } from "../enum"
import { BadRequestException, NotfoundException, UnauthorizedException } from "../exception"
import { toObjectId } from "../utils"
import { HUser } from "../../DB/model"
import { randomUUID } from "node:crypto"

type UserIdType = mongoose.Types.ObjectId | string
export type JwtPayloadType = JwtPayload & {
    sub: string;
    aud: number[];
    jti: string;
    iat: number
}


export class TokenService {
    private readonly userRepository: UserRepository
    private readonly cacheService: CacheService

    constructor() {
        this.cacheService = cacheService
        this.userRepository = new UserRepository()
    }
    
     userBaseKey ({ userId }:{userId:UserIdType}) : string  {
        return `User::${userId.toString()}`
    }
    
    
     userBaseRevokeTokenKey ({ userId }:{userId:UserIdType}) : string {
        return `${this.userBaseKey({ userId })}::Revoke_Token`
    }
    
     userRevokeTokenKey ({ userId, jti }:{userId:UserIdType , jti:string}) : string {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`
    }
    
    
    async createToken ({
        payload,
        options,
        secret = ACCESS_USER_TOKEN_SIGNATURE
    }:{
        payload: string | Buffer | object,
        secret: Secret, //8irnaha lsecret 3shan law hsht8l sym aw asym
        options?: SignOptions,
    }):Promise<string>  {
        return jwt.sign(payload, secret, options)
    }
    
    
    async verifyToken ({
        token = "",
        secret = ACCESS_USER_TOKEN_SIGNATURE
    }:{
        token: string,
        secret: Secret,
    }):Promise<JwtPayloadType>  {
        return jwt.verify(token, secret) as JwtPayloadType
    }
    
    
    async getTokenSignatures ({ role = RoleEnum.USER }:{role:RoleEnum}):Promise<{ accessSignature: string, refreshSignature: string}> {
        let signatures:{ accessSignature: string, refreshSignature: string };
        switch (role) {
            case RoleEnum.ADMIN:
                signatures = { accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE }
                break;
            default:
                signatures = { accessSignature: ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: REFRESH_USER_TOKEN_SIGNATURE }
                break;
        }
        return signatures
    }
    
    
    
    async getSignature ({ tokenType = TokenTypeEnum.ACCESS  , role = RoleEnum.USER} :{ tokenType:TokenTypeEnum, role?:RoleEnum}):Promise<string>  {
        const signatures = await this.getTokenSignatures({ role }) //eni ba3tlo role da hyfdne eni a5lih yrg3li access w refresh token
        return tokenType == TokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature
    }
    
    
    async decodeToken ({authorization = "", tokenType = TokenTypeEnum.ACCESS}:{authorization:string,tokenType?:TokenTypeEnum}):Promise<{user:HUser,payload:JwtPayloadType}>  {
        const decoded = jwt.decode(authorization) as JwtPayloadType
        if (!decoded?.aud?.length) { 
            throw new BadRequestException("invalid token")
        }
    
        const payload = await this.verifyToken({ token: authorization , secret: await this.getSignature({ tokenType , role: decoded.aud[0] as unknown as RoleEnum }) })
        if (!payload?.sub) {
            throw new BadRequestException("missing token payload")
        }
    
        if(await this.cacheService.exist({key:this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti })})) {
            throw new UnauthorizedException("expired login credentials")
        } 
    
        const user = await this.userRepository.findById({
            id: toObjectId(payload.sub) //id howa bya5od objId w alsub gy string (fa 3aizine n3ml almethod ali bt3ml convert string l objId)
        })
        if (!user) {
            throw new NotfoundException("Invalid user")
        }
    
        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new UnauthorizedException("Expired login credentials");
        }
    
        return { user, payload }
    }
    
    
    async createLoginCredentials ({user,issuer}:{user:HUser,issuer:string}):Promise<{ access_token:string, refresh_token:string}>  {
        const { accessSignature, refreshSignature } = await this.getTokenSignatures({ role:user.role })
        const jwtid = randomUUID()
        const access_token = await this.createToken({
            payload:{sub:user._id},
            secret: accessSignature,
            options: {
                issuer,
                audience: [user.role as unknown as string],
                expiresIn: ACCESS_TOKEN_EXPIRES_IN,
                jwtid
            }
        })
    
        const refresh_token = await this.createToken({
            payload:{sub:user._id},
            secret: refreshSignature,
            options: {
                issuer,
                audience: [user.role as unknown as string],
                expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            }
        })
        return { access_token, refresh_token }
    }
    
    async createRevokeToken ({ payload, user }:{ payload:JwtPayloadType, user:HUser })  {
        const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
        const refreshExpiresIn = payload.iat + REFRESH_TOKEN_EXPIRES_IN;
        const revokeTtl = refreshExpiresIn - consumedTime;
        const key = this.userRevokeTokenKey({userId: user._id,jti: payload.jti});
        await this.cacheService.set({key,value: payload.jti,ttl: revokeTtl});
        return;
    };
}

export const tokenService = new TokenService()