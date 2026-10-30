"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = exports.hash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hash = async (plaintext, rounds = 12, minor = "b") => {
    const salt = bcrypt_1.default.genSaltSync(rounds, minor).toString();
    return await bcrypt_1.default.hash(plaintext, salt);
};
exports.hash = hash;
const compare = async (plaintext, cipherText) => {
    return await bcrypt_1.default.compare(plaintext, cipherText);
};
exports.compare = compare;
