"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const service_1 = require("../../common/service");
const enum_1 = require("../../common/enum");
const email_1 = require("../../common/utils/email");
const utils_1 = require("../../common/utils");
const security_1 = require("../../common/security");
const service_2 = require("../../common/service");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("../../config");
class AuthenticationService {
    userRepository;
    cacheService;
    tokenService;
    client;
    constructor() {
        this.cacheService = service_1.cacheService;
        this.userRepository = new repository_1.UserRepository();
        this.tokenService = service_2.tokenService;
        this.client = new google_auth_library_1.OAuth2Client();
    }
    async verifyGoogleAccount(idToken) {
        if (!idToken) {
            throw new exception_1.BadRequestException("Google ID token is required");
        }
        const audience = config_1.WEB_CLIENT_IDS?.includes(",") ? config_1.WEB_CLIENT_IDS.split(",").map((id) => id.trim()).filter(Boolean) : config_1.WEB_CLIENT_IDS;
        let ticket;
        try {
            ticket = await this.client.verifyIdToken({ idToken, audience });
        }
        catch (error) {
            throw new exception_1.BadRequestException(error.message || "Invalid Google ID token");
        }
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new exception_1.BadRequestException("Email is not verified");
        }
        return payload;
    }
    async LoginWithGmail({ idToken }, issuer) {
        const { name, email, picture } = await this.verifyGoogleAccount(idToken);
        const existAccount = await this.userRepository.findOne({
            filter: { email: email },
        });
        let user = existAccount;
        if (existAccount) {
            if (existAccount.provider !== enum_1.ProviderEnum.GOOGLE) {
                throw new exception_1.ConflictException("invalid account provider");
            }
            if (!existAccount.image && picture) {
                existAccount.image = picture;
                await existAccount.save();
            }
        }
        else {
            const cleanName = (name || "Google User").trim();
            const parts = cleanName.split(/\s+/).filter(Boolean);
            let firstName = parts[0] || "Google";
            let lastName = parts.slice(1).join(" ") || "User";
            if (firstName.length < 2)
                firstName = `${firstName}_`;
            if (lastName.length < 2)
                lastName = `${lastName}_`;
            user = await this.userRepository.createOne({
                data: { firstName, lastName, email, confirmEmail: new Date(), provider: enum_1.ProviderEnum.GOOGLE, image: picture }
            });
        }
        if (!user) {
            throw new exception_1.NotfoundException("Failed to create or retrieve user");
        }
        return { status: 201, data: await this.tokenService.createLoginCredentials({ user, issuer }) };
    }
    ;
    async sendEmailOtp({ email, subject, expiresIn = 120, maxTrails = 3, blockInSeconds = 300, title }) {
        const existOTP_TTL = await this.cacheService.ttl({ key: (0, email_1.userEmailKey)({ email, subject }) });
        if (existOTP_TTL > 0) {
            throw new exception_1.ConflictException(`Sorry we cannot create new otp while existing one is still valid, please wait for ${existOTP_TTL} seconds`);
        }
        const oldTrails = await this.cacheService.get({ key: (0, email_1.userEmailTrailsKey)({ email, subject }) }) ?? 0;
        if (oldTrails >= maxTrails) {
            throw new exception_1.TooManyRequestException(`Maximum resend attempts reached`);
        }
        const code = (0, utils_1.createOtp)();
        await this.cacheService.set({
            key: (0, email_1.userEmailKey)({ email, subject }),
            value: await (0, security_1.hash)(code.toString()),
            ttl: expiresIn
        });
        const currentTrails = await this.cacheService.incrBy({ key: (0, email_1.userEmailTrailsKey)({ email, subject }) });
        if (currentTrails === 3) {
            await this.cacheService.expire({ key: (0, email_1.userEmailTrailsKey)({ email, subject }), ttl: blockInSeconds });
        }
        email_1.emailEvent.emit("sendEmail", { recipients: { to: email }, subject, data: { code, title: title ?? subject } });
    }
    async signup({ email, password, phone, username }) {
        const duplicatedAccount = await this.userRepository.findOne({
            filter: { email },
            options: { select: "email" }
        });
        if (duplicatedAccount)
            throw new exception_1.ConflictException("Email already exists");
        const account = await this.userRepository.createOne({
            data: { email, password: await (0, security_1.hash)(password), phone: await (0, security_1.encryption)(phone), username }
        });
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL, title: enum_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return account;
    }
    async confirmEmail({ otp, email }) {
        const account = await this.userRepository.findOne({
            filter: { email, provider: enum_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: false } },
            options: { lean: false }
        });
        if (!account)
            throw new exception_1.NotfoundException("Invalid account");
        const hashOtp = await this.cacheService.get({ key: (0, email_1.userEmailKey)({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL }) });
        if (!hashOtp || !await (0, security_1.compare)(otp, hashOtp)) {
            throw new exception_1.ConflictException("Invalid OTP");
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.cacheService.del({ key: await this.cacheService.keys({ prefix: (0, email_1.userEmailKey)({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL }) }) });
        return;
    }
    async resendConfirmEmail({ email }) {
        const account = await this.userRepository.findOne({
            filter: { email, provider: enum_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: false } }
        });
        if (!account)
            throw new exception_1.NotfoundException("Invalid account");
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL, title: enum_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return;
    }
    async login({ email, password }, issuer) {
        const account = await this.userRepository.findOne({
            filter: { email, provider: enum_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: true } }
        });
        if (!account?.password) {
            throw new exception_1.NotfoundException("Invalid email or password");
        }
        const match = await bcrypt_1.default.compare(password, account.password);
        if (!match) {
            throw new exception_1.NotfoundException("Invalid email or password");
        }
        if (account.twoStepVerification === enum_1.TwoStepVerificationEnum.ENABLED) {
            await this.sendEmailOtp({
                email: account.email,
                subject: enum_1.EmailSubjectEnum.TWO_STEP_VERIFICATION,
                title: "Two Step Verification"
            });
            return {
                twoStepVerification: true,
                message: "Verification code sent to your email"
            };
        }
        return await this.tokenService.createLoginCredentials({ user: account, issuer });
    }
    async requestForgotPassword({ email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: enum_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: true }
            }
        });
        if (!account)
            throw new exception_1.NotfoundException("Invalid account");
        await this.sendEmailOtp({
            email,
            subject: enum_1.EmailSubjectEnum.FORGOT_PASSWORD,
            title: enum_1.EmailSubjectEnum.FORGOT_PASSWORD
        });
        return;
    }
    async getVerifiedForgotPasswordAccount({ otp, email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: enum_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: true }
            },
            options: { lean: false }
        });
        if (!account)
            throw new exception_1.NotfoundException("Invalid account");
        const hashOtp = await this.cacheService.get({
            key: (0, email_1.userEmailKey)({
                email,
                subject: enum_1.EmailSubjectEnum.FORGOT_PASSWORD
            })
        });
        if (!hashOtp || !await (0, security_1.compare)(otp, hashOtp)) {
            throw new exception_1.ConflictException("Invalid OTP");
        }
        return account;
    }
    async verifyForgotPassword({ otp, email }) {
        await this.getVerifiedForgotPasswordAccount({ otp, email });
        return;
    }
    async resetPassword({ otp, email, password }) {
        const account = await this.getVerifiedForgotPasswordAccount({ otp, email });
        account.password = await (0, security_1.hash)(password);
        account.changeCredentialsTime = new Date();
        await account.save();
        const result = await Promise.all([
            this.cacheService.keys({
                prefix: service_2.tokenService.userBaseRevokeTokenKey({
                    userId: account._id
                })
            }),
            this.cacheService.keys({
                prefix: (0, email_1.userEmailKey)({
                    email,
                    subject: enum_1.EmailSubjectEnum.FORGOT_PASSWORD
                })
            })
        ]);
        await this.cacheService.del({
            key: [...result[0], ...result[1]]
        });
        return;
    }
}
exports.AuthenticationService = AuthenticationService;
exports.default = new AuthenticationService();
