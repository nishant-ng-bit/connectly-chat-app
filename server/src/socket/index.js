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
exports.getIO = exports.initSocket = void 0;
var socket_io_1 = require("socket.io");
var message_socket_1 = require("./message.socket");
var user_socket_1 = require("./user.socket");
var io;
var initSocket = function (server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });
    io.on("connection", function (socket) {
        var userId = socket.handshake.auth.userId;
        if (!userId)
            return;
        (0, user_socket_1.addOnlineUser)(userId, socket.id);
        var onlineUserIds = Array.from(user_socket_1.onlineUsers.keys());
        socket.emit("presence:sync", onlineUserIds);
        socket.broadcast.emit("presence:update", {
            userId: userId,
            online: true,
        });
        (0, message_socket_1.messageSocket)(io, socket);
        socket.on("conversation:opened", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var conversationId = _b.conversationId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, message_socket_1.markMessagesAsSeenSocket)(socket, conversationId, userId)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        socket.on("join:conversation", function (conversationId) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // console.log("🟢 Socket joined conversation:", conversationId);
                socket.join(conversationId);
                return [2 /*return*/];
            });
        }); });
        socket.on("leave:conversation", function (conversationId) {
            socket.leave(conversationId);
            // console.log(`🟡 Socket ${socket.id} left room ${conversationId}`);
        });
        socket.on("typing:start", function (_a) {
            var conversationId = _a.conversationId;
            socket.to(conversationId).emit("typing:start", {
                userId: userId,
                conversationId: conversationId,
            });
        });
        socket.on("typing:stop", function (_a) {
            var conversationId = _a.conversationId;
            socket.to(conversationId).emit("typing:stop", {
                userId: userId,
                conversationId: conversationId,
            });
        });
        socket.on("disconnect", function () {
            (0, user_socket_1.removeOnlineUser)(userId, socket.id);
            if (!(0, user_socket_1.isUserOnline)(userId))
                io.emit("presence:update", { userId: userId, online: false });
        });
    });
    return io;
};
exports.initSocket = initSocket;
var getIO = function () {
    if (!io)
        throw new Error("Socket not initialized");
    return io;
};
exports.getIO = getIO;
