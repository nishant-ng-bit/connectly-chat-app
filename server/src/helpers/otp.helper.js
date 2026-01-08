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
exports.verifyOTP = exports.otpHandler = void 0;
var mail_service_1 = require("../services/mail.service");
var prisma_1 = require("../lib/prisma");
var bcryptjs_1 = require("bcryptjs");
var otpHandler = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var otp, hashedOTP, expiresAt, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                otp = (0, mail_service_1.generateOTP)();
                console.log("OTP:", otp);
                return [4 /*yield*/, bcryptjs_1.default.hash(otp, 10)];
            case 1:
                hashedOTP = _a.sent();
                expiresAt = new Date(Date.now() + 10 * 60 * 1000);
                return [4 /*yield*/, prisma_1.default.otp.deleteMany({ where: { email: email } })];
            case 2:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.otp.create({
                        data: {
                            email: email,
                            hashedOTP: hashedOTP,
                            expiresAt: expiresAt,
                        },
                    })];
            case 3:
                _a.sent();
                return [4 /*yield*/, (0, mail_service_1.sendOTP)(email, otp)];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error("Something went wrong", error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.otpHandler = otpHandler;
var verifyOTP = function (email, otp) { return __awaiter(void 0, void 0, void 0, function () {
    var otpData, isValid, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, prisma_1.default.otp.findUnique({
                        where: {
                            email: email,
                        },
                    })];
            case 1:
                otpData = _a.sent();
                if (!otpData) {
                    console.log("OTP not found");
                    return [2 /*return*/, false];
                }
                if (otpData.expiresAt < new Date()) {
                    console.log("OTP expired");
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(otp, otpData.hashedOTP)];
            case 2:
                isValid = _a.sent();
                if (!isValid) {
                    console.log("Invalid OTP");
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, prisma_1.default.otp.deleteMany({ where: { email: email } })];
            case 3:
                _a.sent();
                return [2 /*return*/, true];
            case 4:
                error_2 = _a.sent();
                console.error("Something went wrong", error_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.verifyOTP = verifyOTP;
