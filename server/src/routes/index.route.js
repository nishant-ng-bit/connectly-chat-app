"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var message_route_1 = require("./message.route");
var auth_route_1 = require("./auth.route");
var conversation_route_1 = require("./conversation.route");
var user_route_1 = require("./user.route");
var router = express_1.default.Router();
exports.default = (function () {
    (0, auth_route_1.authRoute)(router);
    (0, message_route_1.messageRoute)(router);
    (0, conversation_route_1.conversationRoute)(router);
    (0, user_route_1.userRoute)(router);
    return router;
});
