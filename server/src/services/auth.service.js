"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var generateToken = function (userId) {
    return jsonwebtoken_1.default.sign({ userId: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};
exports.generateToken = generateToken;
var verifyToken = function (token) {
    try {
        var decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return decoded.userId;
    }
    catch (_a) {
        return null;
    }
};
exports.verifyToken = verifyToken;
