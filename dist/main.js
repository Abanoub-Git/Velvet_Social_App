"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const modules_1 = require("./modules");
const middleware_1 = require("./middleware");
const config_1 = require("./config");
const connection_db_1 = require("./DB/connection.db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)(), express_1.default.json());
app.use("/assets", express_1.default.static("./assets"));
(0, connection_db_1.bootstrapDB)(app, config_1.PORT);
app.all("/", async (req, res, next) => {
    return res.status(200).json({ message: "Done" });
});
app.use('/auth', modules_1.authenticationController);
app.use('/user', modules_1.userController);
app.use(middleware_1.globalErrorHandling);
