import mongoose, { HydratedDocument } from "mongoose";
import { GenderEnum, ProfileVisibilityEnum, ProviderEnum, RoleEnum, TwoStepVerificationEnum } from "../../common/enum/index.js";
import { IUser } from "../../common/interface/user.interface.js";

const userSchema = new mongoose.Schema<IUser>({
    firstName: {
        type: String,
        minLength: 2,
        maxLength: 25,
        required: true
    },
    lastName: {
        type: String,
        minLength: 2,
        maxLength: 25,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function ():boolean {
            return this.provider === ProviderEnum.SYSTEM
        },
    },
    provider: {
        type: Number,
        enum: ProviderEnum,
        default: ProviderEnum.SYSTEM
    },
    phone:String,
    DOB: Date,
    confirmEmail:Date,
    image: String,
    coverImage: [String],
    changeCredentialsTime: Date,
    twoStepVerification: {
        type: Number,
        enum: TwoStepVerificationEnum,
        default: TwoStepVerificationEnum.DISABLED
    },
    gender: {
        type: Number,
        enum: GenderEnum,
        default: GenderEnum.MALE
    },
    role: {
        type: Number,
        default: RoleEnum.USER,
        enum:RoleEnum
    },
     profileVisibility: {
        type: Number,
        enum: ProfileVisibilityEnum,
        default: ProfileVisibilityEnum.PUBLIC
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],


}, {
    timestamps: true,
    autoIndex: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    strictQuery: true
});

userSchema.virtual("username").set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export type HUser = HydratedDocument<IUser>