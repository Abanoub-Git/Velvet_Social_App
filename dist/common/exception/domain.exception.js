"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequestException = exports.UnauthorizedException = exports.ConflictException = exports.ForbiddenException = exports.NotfoundException = exports.BadRequestException = void 0;
const application_exception_1 = require("./application.exception");
class BadRequestException extends application_exception_1.ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class NotfoundException extends application_exception_1.ApplicationException {
    constructor(message = "Notfound", cause) {
        super(message, 404, cause);
    }
}
exports.NotfoundException = NotfoundException;
class ForbiddenException extends application_exception_1.ApplicationException {
    constructor(message = "Forbidden", cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenException = ForbiddenException;
class ConflictException extends application_exception_1.ApplicationException {
    constructor(message = "Conflict", cause) {
        super(message, 409, cause);
    }
}
exports.ConflictException = ConflictException;
class UnauthorizedException extends application_exception_1.ApplicationException {
    constructor(message = "Unauthorized", cause) {
        super(message, 401, cause);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class TooManyRequestException extends application_exception_1.ApplicationException {
    constructor(message = "TooManyRequest", cause) {
        super(message, 429, cause);
    }
}
exports.TooManyRequestException = TooManyRequestException;
