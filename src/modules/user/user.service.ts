import { LogoutEnum } from "../../common/enum"
import { ConflictException } from "../../common/exception"
import { UserRepository} from "../../common/repository"
import { cacheService, CacheService, JwtPayloadType, tokenService, TokenService } from "../../common/service"
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config"
import { HUser } from "../../DB/model"

export class UserService {
    private readonly tokenService:TokenService
    private readonly userRepository:UserRepository
    private readonly cacheService : CacheService
    constructor(){
        this.tokenService = tokenService
        this.userRepository=new UserRepository()
        this.cacheService = cacheService
    }


   async rotateToken(payload:JwtPayloadType, user:HUser, issuer:string){
        const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
        const currentTime = Date.now() + (30 * 60000)
        if (currentTime < accessExpiresIn) {
            throw new ConflictException("Sorry we cannot create new login credentials while current access token still within valid time range")
        }
        const data = await this.tokenService.createLoginCredentials({user,issuer}) 
        await this.tokenService.createRevokeToken({payload,user})
        return data
    }




    async logout(payload:JwtPayloadType, user:HUser, { action = LogoutEnum.DEVICE }:{action:LogoutEnum}){
        switch (action) {
            case LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.cacheService.del({ key: await this.cacheService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: payload.sub }) }) });
                break;
            default:
                await this.tokenService.createRevokeToken({ payload , user });
                break;
        }
        return;
    }

}


export const userService = new UserService()