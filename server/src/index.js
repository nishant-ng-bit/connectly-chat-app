"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var cookie_parser_1 = require("cookie-parser");
var index_route_1 = require("./routes/index.route");
var cors_1 = require("cors");
var index_1 = require("./socket/index");
var http_1 = require("http");
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
var server = http_1.default.createServer(app);
(0, index_1.initSocket)(server);
var PORT = Number(process.env.PORT) || 3001;
server.listen(PORT, "0.0.0.0", function () {
    console.log("server started on port ".concat(PORT));
});
app.use("/", (0, index_route_1.default)());
