"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoute = void 0;
var message_controller_1 = require("../controllers/message.controller");
var multer_1 = require("multer");
var uploader_controller_1 = require("../controllers/uploader.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var upload = (0, multer_1.default)({ dest: "tmp/" });
var messageRoute = function (router) {
    router.post("/msg/send", auth_middleware_1.authMiddleware, message_controller_1.sendMessageHandler);
    router.post("/msg/get", auth_middleware_1.authMiddleware, message_controller_1.getMessagesHandler);
    router.post("/msg/upload", auth_middleware_1.authMiddleware, upload.single("file"), uploader_controller_1.uploaderHandler);
    router.post("/msg/delete", auth_middleware_1.authMiddleware, message_controller_1.deleteMsgForUserHandler);
};
exports.messageRoute = messageRoute;
