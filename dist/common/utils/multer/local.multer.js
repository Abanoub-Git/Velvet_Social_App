"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMulterUpload = exports.processFields = exports.processFiles = exports.processFile = exports.localFileUpload = exports.fileValidation = void 0;
const multer_1 = __importDefault(require("multer"));
const file_type_1 = require("file-type");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const crypto_1 = require("crypto");
const exception_1 = require("../../exception");
const enum_1 = require("../../enum");
const os_1 = require("os");
exports.fileValidation = {
    image: ["image/jpeg", "image/png", "image/gif"],
    files: ["application/pdf", "application/json"]
};
const localFileUpload = ({ maxFileSize = 5, storageApproach = enum_1.StorageApproachEnum.MEMORY }) => {
    const storage = storageApproach == enum_1.StorageApproachEnum.MEMORY ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({
        destination(req, file, callback) {
            callback(null, (0, os_1.tmpdir)());
        },
        filename(req, file, callback) {
            callback(null, (0, crypto_1.randomUUID)() + file.originalname);
        },
    });
    return (0, multer_1.default)({ storage, limits: { fileSize: maxFileSize * 1024 * 1024 } });
};
exports.localFileUpload = localFileUpload;
const processFile = async ({ customPath = "general", file, validation }) => {
    if (file.path) {
        file.buffer = await (0, promises_1.readFile)(file.path);
    }
    const result = await (0, file_type_1.fileTypeFromBuffer)(file.buffer);
    if (!result || !validation.includes(result.mime)) {
        await (0, promises_1.unlink)(file.path);
        throw new exception_1.BadRequestException("Invalid file formats");
    }
    else {
        await (0, promises_1.mkdir)((0, path_1.resolve)(`./assets/${customPath}`), { recursive: true });
        const uniqueFilePath = `assets/${customPath}/${(0, crypto_1.randomUUID)()}.${result.ext}`;
        await (0, promises_1.writeFile)((0, path_1.resolve)(`./${uniqueFilePath}`), file.buffer);
        if (file.path) {
            await (0, promises_1.unlink)(file.path);
        }
        file.path = uniqueFilePath;
        return file;
    }
};
exports.processFile = processFile;
const processFiles = async ({ customPath = "general", files, validation }) => {
    const validatedFiles = [];
    for (const file of files) {
        const result = await (0, file_type_1.fileTypeFromBuffer)(file.buffer);
        if (!result || !validation.includes(result.mime)) {
            throw new exception_1.BadRequestException("Invalid file formats");
        }
        validatedFiles.push({ file, result });
    }
    const assets = [];
    for (const { file, result } of validatedFiles) {
        const uniqueFilePath = `${customPath}/${(0, crypto_1.randomUUID)()}.${result.ext}`;
        await (0, promises_1.mkdir)((0, path_1.resolve)(`./assets/${customPath}`), { recursive: true });
        await (0, promises_1.writeFile)((0, path_1.resolve)(`./assets/${uniqueFilePath}`), file.buffer);
        file.path = `assets/${uniqueFilePath}`;
        assets.push(file);
    }
    return assets;
};
exports.processFiles = processFiles;
const processFields = async ({ customPath = "general", fields, validation }) => {
    const assets = [];
    for (const field of Object.keys(fields)) {
        for (const file of fields[field]) {
            const result = await (0, file_type_1.fileTypeFromBuffer)(file.buffer);
            if (!result || !validation.includes(result.mime)) {
                throw new exception_1.BadRequestException("Invalid file formats");
            }
        }
    }
    for (const field of Object.keys(fields)) {
        const files = await (0, exports.processFiles)({ customPath, files: fields[field], validation });
        assets.push({ field, files });
    }
    return assets;
};
exports.processFields = processFields;
const processMulterUpload = async ({ req, customPath = "general", validation = [] }) => {
    if (req.file) {
        await (0, exports.processFile)({ customPath, file: req.file, validation });
    }
    else if (Array.isArray(req.files)) {
        await (0, exports.processFiles)({ customPath, files: req.files, validation });
    }
    else if (typeof req.files == "object" && Object.keys(req.files ?? {})?.length) {
        await (0, exports.processFields)({ customPath, fields: req.files, validation });
    }
};
exports.processMulterUpload = processMulterUpload;
