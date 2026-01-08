"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserOnline = exports.removeOnlineUser = exports.addOnlineUser = exports.onlineUsers = void 0;
exports.onlineUsers = new Map();
var addOnlineUser = function (userId, socketId) {
    var _a;
    if (exports.onlineUsers.has(userId)) {
        (_a = exports.onlineUsers.get(userId)) === null || _a === void 0 ? void 0 : _a.add(socketId);
    }
    else {
        exports.onlineUsers.set(userId, new Set([socketId]));
    }
};
exports.addOnlineUser = addOnlineUser;
var removeOnlineUser = function (userId, socketId) {
    var sockets = exports.onlineUsers.get(userId);
    if (!sockets)
        return;
    sockets.delete(socketId);
    if (sockets.size === 0) {
        exports.onlineUsers.delete(userId);
    }
};
exports.removeOnlineUser = removeOnlineUser;
var isUserOnline = function (userId) { return exports.onlineUsers.has(userId); };
exports.isUserOnline = isUserOnline;
