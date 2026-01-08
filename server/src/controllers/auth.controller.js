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
exports.isLoggedIn = exports.logout = exports.login = exports.register = void 0;
var user_service_1 = require("../services/user.service");
var auth_service_1 = require("../services/auth.service");
var register = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, existingUserByEmail, existingUserByUsername, user, jwtToken, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, username = _a.username, email = _a.email, password = _a.password;
                return [4 /*yield*/, (0, user_service_1.getUserByEmail)(email)];
            case 1:
                existingUserByEmail = _b.sent();
                return [4 /*yield*/, (0, user_service_1.getUserByUsername)(username)];
            case 2:
                existingUserByUsername = _b.sent();
                if (existingUserByEmail || existingUserByUsername) {
                    return [2 /*return*/, res.status(400).json({ error: "User already exists" })];
                }
                return [4 /*yield*/, (0, user_service_1.createUser)({ username: username, email: email, password: password })];
            case 3:
                user = _b.sent();
                jwtToken = (0, auth_service_1.generateToken)(user.id);
                res.cookie("token", jwtToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                });
                return [2 /*return*/, res.status(201).json(user)];
            case 4:
                error_1 = _b.sent();
                console.log(error_1);
                return [2 /*return*/, res.status(500).json({ error: "Something went wrong" })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.register = register;
var login = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user, id, jwtToken, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (req.cookies.token) {
                    return [2 /*return*/, res.status(401).json({ message: "User Already LoggedIN" })];
                }
                email = req.body.email;
                return [4 /*yield*/, (0, user_service_1.getUserByEmail)(email)];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ message: "User Not Exist" })];
                }
                id = user.id;
                jwtToken = (0, auth_service_1.generateToken)(id);
                res.cookie("token", jwtToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
                });
                return [2 /*return*/, res.status(200).json(user)];
            case 2:
                error_2 = _a.sent();
                console.log(error_2);
                return [2 /*return*/, res.status(500).json({ error: "Something went wrong" })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
var logout = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            if (!req.cookies.token) {
                return [2 /*return*/, res.status(401).json({ message: "Invalid req" })];
            }
            res.clearCookie("token");
            res.status(200).json({ message: "Successfully logout" });
        }
        catch (error) {
            console.error(error);
            return [2 /*return*/, res.status(500).json({ error: "Something went wrong" })];
        }
        return [2 /*return*/];
    });
}); };
exports.logout = logout;
var isLoggedIn = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, decodedId, user, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
                if (!token) {
                    console.log("No token found");
                    return [2 /*return*/, res.status(401).json({ message: "Not authenticated" })];
                }
                decodedId = (0, auth_service_1.verifyToken)(token);
                if (!decodedId) {
                    console.log("Invalid token");
                    return [2 /*return*/, res.status(401).json({ message: "Invalid token" })];
                }
                return [4 /*yield*/, (0, user_service_1.getUserById)(decodedId)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ message: "User not found" })];
                }
                return [2 /*return*/, res.status(200).json({ user: user })];
            case 2:
                error_3 = _b.sent();
                return [2 /*return*/, res.status(500).json({ error: "Something went wrong" })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.isLoggedIn = isLoggedIn;
