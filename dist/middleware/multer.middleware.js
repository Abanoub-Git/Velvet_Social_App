"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = require("../common/utils/multer");
const uploadMiddleware = ({ isRequired = true, multerMiddleware, customPath = "general", validation = [] }) => {
    return (req, res, next) => {
        multerMiddleware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
                return;
            }
            try {
                await (0, multer_1.processMulterUpload)({ req: req, customPath, validation });
                next();
            }
            catch (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
            }
        });
    };
};
exports.uploadMiddleware = uploadMiddleware;
