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
exports.clearConversationHandler = exports.getConversationIdHandler = exports.getConversationsHandler = void 0;
var conversation_service_1 = require("../services/conversation.service");
var getConversationsHandler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, conversations, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.user) {
                    return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                }
                userId = req.user.id;
                return [4 /*yield*/, (0, conversation_service_1.getChatUsers)(userId)];
            case 1:
                conversations = _a.sent();
                if (!conversations) {
                    return [2 /*return*/, res.status(404).json({ message: "Conversations not found" })];
                }
                return [2 /*return*/, res.status(200).json(conversations)];
            case 2:
                error_1 = _a.sent();
                console.error("Get conversations error:", error_1);
                return [2 /*return*/, res.status(500).json({
                        error: "Failed to fetch conversations",
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getConversationsHandler = getConversationsHandler;
var getConversationIdHandler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conversationId, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, conversation_service_1.getConversationId)(req.query.currentUserId, req.query.otherUserId)];
            case 1:
                conversationId = _a.sent();
                return [2 /*return*/, res.status(200).json(conversationId)];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, res.status(500).json({
                        error: "Failed to fetch conversation id",
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getConversationIdHandler = getConversationIdHandler;
var clearConversationHandler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conversationId, userId, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                conversationId = req.params.conversationId;
                userId = req.user.id;
                if (!conversationId || !userId)
                    return [2 /*return*/, res.status(400).json({ message: "Bad request" })];
                return [4 /*yield*/, (0, conversation_service_1.clearConversation)(conversationId, userId)];
            case 1:
                _a.sent();
                return [2 /*return*/, res
                        .status(200)
                        .json({ message: "Conversation cleared successfully" })];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, res.status(500).json({ error: "Failed to clear conversation" })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.clearConversationHandler = clearConversationHandler;
