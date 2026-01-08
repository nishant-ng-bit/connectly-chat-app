"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpHandler = void 0;
var otp_helper_1 = require("../helpers/otp.helper");
var sendOtpHandler = function (req, res, next) {
    try {
        var email = req.body.email;
        (0, otp_helper_1.otpHandler)(email);
        return res.status(200).json({ message: "OTP sent successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
};
exports.sendOtpHandler = sendOtpHandler;
