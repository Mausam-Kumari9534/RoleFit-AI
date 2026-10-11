const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getProfile, 
    verifyEmailOtp, 
    resendEmailOtp,
    logout,
    refreshToken,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    googleAuth,
    setPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate Limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs for auth routes
    message: { success: false, message: 'Too many requests, please try again later.' }
});

const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs for password reset
    message: { success: false, message: 'Too many password reset requests from this IP. Please try again after 15 minutes.' }
});

router.post('/google', authLimiter, googleAuth);
router.post('/set-password', protect, setPassword);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.get('/refresh-token', refreshToken);
router.get('/profile', protect, getProfile);

// Email Verification
router.post('/verify-email-otp', authLimiter, verifyEmailOtp);
router.post('/resend-email-otp', authLimiter, resendEmailOtp);

// Password Reset
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.get('/verify-reset-token/:token', passwordResetLimiter, verifyResetToken);
router.post('/reset-password', passwordResetLimiter, resetPassword);

module.exports = router;
