const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.post("/auth/register", authController.registerUser);

router.post("/auth/login", authController.loginUser);

router.post("/auth/forget-password", authController.forgetPassword);

router.post("/auth/reset-password", authController.resetPassword);

router.post("/auth/verify-otp", authController.verifyOtp);

router.post("/auth/resend-otp", authController.resendOtp);

module.exports = router;
