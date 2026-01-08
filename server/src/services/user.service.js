"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setProfilePic = exports.getUserByQuery = exports.getUserById = exports.getUserByUsername = exports.getUserByEmail = exports.createUser = void 0;
var prisma_1 = require("../lib/prisma");
var uploader_service_1 = require("./uploader.service");
var createUser = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var user;
    var username = _b.username, email = _b.email, password = _b.password;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.create({
                    data: {
                        username: username,
                        email: email,
                        password: password,
                        status: "Hi! I'm using Connectly",
                    },
                })];
            case 1:
                user = _c.sent();
                return [2 /*return*/, user];
        }
    });
}); };
exports.createUser = createUser;
var getUserByEmail = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({
                    where: {
                        email: email,
                    },
                })];
            case 1:
                user = _a.sent();
                return [2 /*return*/, user];
        }
    });
}); };
exports.getUserByEmail = getUserByEmail;
var getUserByUsername = function (username) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({
                    where: {
                        username: username,
                    },
                })];
            case 1:
                user = _a.sent();
                return [2 /*return*/, user];
        }
    });
}); };
exports.getUserByUsername = getUserByUsername;
var getUserById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({
                    where: {
                        id: id,
                    },
                })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, user];
        }
    });
}); };
exports.getUserById = getUserById;
var getUserByQuery = function (username) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (!username || username.trim().length === 0) {
            return [2 /*return*/, []];
        }
        return [2 /*return*/, prisma_1.default.user.findMany({
                where: {
                    username: {
                        startsWith: username.trim(),
                        mode: "insensitive",
                    },
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
                take: 10,
            })];
    });
}); };
exports.getUserByQuery = getUserByQuery;
var setProfilePic = function (userId, file) { return __awaiter(void 0, void 0, void 0, function () {
    var res, updatedUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, uploader_service_1.uploader)(file)];
            case 1:
                res = _a.sent();
                return [4 /*yield*/, prisma_1.default.user.update({
                        where: {
                            id: userId,
                        },
                        data: {
                            profilePic: res.secure_url,
                        },
                    })];
            case 2:
                updatedUser = _a.sent();
                return [2 /*return*/, updatedUser];
        }
    });
}); };
exports.setProfilePic = setProfilePic;
