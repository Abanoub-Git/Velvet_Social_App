import { UserRepository } from "../../common/repository";
import { CacheService, cacheService } from "../../common/service";
import { LogoutEnum, TokenTypeEnum } from "../../common/enum";
import { ConflictException } from "../../common/exception";
import tokenServiceInstance from "../../common/security/token.security";
import { IUser } from "../../common/interface";
import { HydratedDocument } from "mongoose";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config";

export class UserService {
    private userRepository: UserRepository;
    private cacheService: CacheService;
    constructor() {
        this.cacheService = cacheService;
        this.userRepository = new UserRepository();
    }

    async rotateToken(payload: any, user: HydratedDocument<IUser>, issuer: string) {
        const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000;
        const currentTime = Date.now() + (30 * 60000);
        if (currentTime < accessExpiresIn) {
            throw new ConflictException("Sorry we cannot create new login credentials while current access token still within valid time range");
        }
        const data = await tokenServiceInstance.createLoginCredentials({ user, issuer });
        await tokenServiceInstance.createRevokeToken({ payload, user });
        return data;
    }

    async logout(payload: any, user: HydratedDocument<IUser>,
        { action = LogoutEnum.DEVICE }: { action?: LogoutEnum } = {}
    ): Promise<void> {
        switch (action) {
            case LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.cacheService.del({
                    key: await this.cacheService.keys({prefix: tokenServiceInstance.userBaseRevokeTokenKey({userId: payload.sub})})
                });
                break;
            default:
                await tokenServiceInstance.createRevokeToken({ payload, user });
                break;
        }
        return;
    }
}

export default new UserService();