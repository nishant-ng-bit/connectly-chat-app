"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
var user_controller_1 = require("../controllers/user.controller");
var multer_1 = require("multer");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var upload = (0, multer_1.default)({ dest: "tmp/" });
var userRoute = function (router) {
    router.get("/users/search", auth_middleware_1.authMiddleware, user_controller_1.getUserByQueryHandler);
    router.post("/user/profile", auth_middleware_1.authMiddleware, upload.single("profilePic"), user_controller_1.setProfilePicHandler);
    router.get("/user/:userId", auth_middleware_1.authMiddleware, user_controller_1.getUserByIdHandler);
};
exports.userRoute = userRoute;
