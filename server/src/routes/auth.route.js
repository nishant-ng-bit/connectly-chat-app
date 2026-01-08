"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoute = void 0;
var auth_controller_1 = require("../controllers/auth.controller");
var otp_middleware_1 = require("../middlewares/otp.middleware");
var otp_controller_1 = require("../controllers/otp.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var authRoute = function (router) {
    router.post("/auth/request-otp", otp_controller_1.sendOtpHandler);
    router.post("/auth/register", otp_middleware_1.verifyOtpMiddleware, auth_controller_1.register);
    router.post("/auth/login", otp_middleware_1.verifyOtpMiddleware, auth_controller_1.login);
    router.post("/auth/logout", auth_middleware_1.authMiddleware, auth_controller_1.logout);
    router.get("/auth/me", auth_middleware_1.authMiddleware, auth_controller_1.isLoggedIn);
};
exports.authRoute = authRoute;
