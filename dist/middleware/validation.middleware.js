"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const enum_1 = require("../common/enum");
const exception_1 = require("../common/exception");
const validation = (schema) => {
    return (req, res, next) => {
        const lang = Number(req.headers['lang']) || enum_1.LanguageEnum.EN;
        const validationResult = schema(lang).safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        if (!validationResult.success) {
            throw new exception_1.BadRequestException("Validation Error", validationResult.error.issues);
        }
        req.validate = validationResult.data;
        next();
    };
};
exports.validation = validation;
