"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_js_1 = require("../../common/enum/index.js");
const userSchema = new mongoose_1.default.Schema({
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
        required: function () {
            return this.provider === index_js_1.ProviderEnum.SYSTEM;
        },
    },
    provider: {
        type: Number,
        enum: index_js_1.ProviderEnum,
        default: index_js_1.ProviderEnum.SYSTEM
    },
    phone: String,
    DOB: Date,
    confirmEmail: Date,
    image: String,
    coverImage: [String],
    changeCredentialsTime: Date,
    twoStepVerification: {
        type: Number,
        enum: index_js_1.TwoStepVerificationEnum,
        default: index_js_1.TwoStepVerificationEnum.DISABLED
    },
    gender: {
        type: Number,
        enum: index_js_1.GenderEnum,
        default: index_js_1.GenderEnum.MALE
    },
    role: {
        type: Number,
        default: index_js_1.RoleEnum.USER,
        enum: index_js_1.RoleEnum
    },
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
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
