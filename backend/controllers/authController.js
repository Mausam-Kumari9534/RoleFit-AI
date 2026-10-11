const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');

// Generate JWT Access Token (Short-lived)
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '15m', // 15 minutes
    });
};

// Generate JWT Refresh Token (Long-lived)
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', {
        expiresIn: '7d', // 7 days
    });
};

// Helper to set refresh token in cookie
const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

// Validate Password Strength
const isValidPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        let { fullName, email, password, confirmPassword, avatar } = req.body;

        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
        }

        email = email.trim().toLowerCase();

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.create({
            fullName,
            email,
            password,
            avatar: avatar || '',
            emailVerified: false,
            isPasswordSet: true,
            emailVerificationOtpHash: otpHash,
            emailVerificationOtpExpiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
            emailVerificationAttempts: 0,
            lastOtpSentAt: Date.now()
        });

        try {
            await emailService.sendOtpEmail(user.email, otp);
        } catch (emailErr) {
            await User.findByIdAndDelete(user._id);
            console.error("Register email send error:", emailErr);
            return res.status(500).json({ success: false, code: 'EMAIL_SEND_FAILED', message: 'We couldn\'t send the verification email right now. Please try again later.' });
        }

        res.status(201).json({
            success: true,
            message: 'Account created successfully. We\'ve sent a verification code to your email.'
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email-otp
// @access  Public
exports.verifyEmailOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
        }

        email = email.trim().toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }

        if (user.emailVerificationAttempts >= 5) {
            return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        if (Date.now() > user.emailVerificationOtpExpiresAt) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');

        if (user.emailVerificationOtpHash !== hashedOtp) {
            user.emailVerificationAttempts += 1;
            await user.save();
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        user.emailVerified = true;
        user.emailVerificationOtpHash = undefined;
        user.emailVerificationOtpExpiresAt = undefined;
        user.emailVerificationAttempts = undefined;
        user.lastOtpSentAt = undefined;
        await user.save();

        res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error("Verify email OTP error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Resend Verification OTP
// @route   POST /api/auth/resend-email-otp
// @access  Public
exports.resendEmailOtp = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Please provide email' });

        email = email.trim().toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: true, message: 'If the email exists and is not verified, a new OTP has been sent.' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ success: false, code: 'ALREADY_VERIFIED', message: 'Email is already verified.' });
        }

        // 60-second cooldown
        if (user.lastOtpSentAt && (Date.now() - user.lastOtpSentAt.getTime()) < 60000) {
            return res.status(429).json({ success: false, message: 'Please wait before requesting a new OTP.' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        user.emailVerificationOtpHash = crypto.createHash('sha256').update(otp).digest('hex');
        user.emailVerificationOtpExpiresAt = Date.now() + 5 * 60 * 1000;
        user.emailVerificationAttempts = 0;
        user.lastOtpSentAt = Date.now();
        await user.save();

        try {
            await emailService.sendOtpEmail(user.email, otp);
        } catch(emailErr) {
            console.error("Resend email error:", emailErr);
            return res.status(500).json({ success: false, code: 'EMAIL_SEND_FAILED', message: 'We couldn\'t send the verification email right now. Please try again later.' });
        }

        res.json({ success: true, message: 'Verification OTP sent. Please check your inbox.' });
    } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        email = email.trim().toLowerCase();

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
        }

        // Check if password has been set on this account
        const hasPasswordSet = Boolean(user.isPasswordSet || user.password);

        if (!hasPasswordSet) {
            return res.status(403).json({
                success: false,
                code: 'PASSWORD_SETUP_REQUIRED',
                message: 'This account was created with Google and has not set up a password yet. Please complete signup to set your password.'
            });
        }

        if (!user.password) {
            return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
        }

        if (!user.emailVerified) {
            return res.status(403).json({ success: false, code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email before logging in.', unverified: true });
        }

        // Backfill isPasswordSet for legacy accounts if not already marked
        if (!user.isPasswordSet) {
            user.isPasswordSet = true;
            await user.save();
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        setRefreshCookie(res, refreshToken);

        res.json({
            success: true,
            token: accessToken, // Short-lived token
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                authProvider: user.authProvider || 'local',
                isPasswordSet: true
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// @desc    Refresh Token
// @route   GET /api/auth/refresh-token
// @access  Public (requires cookie)
exports.refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
        const user = await User.findById(decoded.id);

        if (!user || !user.emailVerified) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const accessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        setRefreshCookie(res, newRefreshToken);

        res.json({
            success: true,
            token: accessToken,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                authProvider: user.authProvider,
                isPasswordSet: Boolean(user.isPasswordSet)
            }
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(401).json({ success: false, message: 'Session expired' });
    }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
    res.cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ success: false, message: 'Please provide an email address' });
        }

        email = email.trim().toLowerCase();
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }

        const user = await User.findOne({ email }).select('+password');

        // Always return generic success message to prevent account enumeration
        const genericSuccessMessage = 'If an account exists for this email, a password reset link has been sent.';

        if (!user) {
            return res.json({ success: true, message: genericSuccessMessage });
        }

        // Check if user has a password set on the account
        const hasPasswordSet = Boolean(user.isPasswordSet || user.password);
        if (!hasPasswordSet) {
            // Google-only account without completed password setup cannot reset password via email
            // Return generic message to prevent account state enumeration
            return res.json({ success: true, message: genericSuccessMessage });
        }

        // Generate cryptographically secure, unpredictable single-use reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes
        await user.save();

        try {
            await emailService.sendPasswordResetEmail(user.email, resetToken);
        } catch (emailErr) {
            // Roll back reset token so an unusable token hash doesn't linger in DB
            user.passwordResetTokenHash = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            console.error(`[ForgotPassword] Email delivery failed for user ID ${user._id}:`, emailErr.message);
            return res.status(503).json({
                success: false,
                code: 'EMAIL_DELIVERY_FAILED',
                message: 'We were unable to deliver the password reset email at this time. Please try again later.'
            });
        }

        return res.json({ success: true, message: genericSuccessMessage });
    } catch (error) {
        console.error('[ForgotPassword] Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Verify Reset Token validity
// @route   GET /api/auth/verify-reset-token/:token
// @access  Public
exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Invalid password reset token.'
            });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            passwordResetTokenHash: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_OR_EXPIRED_TOKEN',
                message: 'This password reset link is invalid or has expired. Please request a new link.'
            });
        }

        res.json({
            success: true,
            message: 'Token is valid.'
        });
    } catch (error) {
        console.error('[VerifyResetToken] Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        if (!token || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match.' });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
            });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            passwordResetTokenHash: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_OR_EXPIRED_TOKEN',
                message: 'This password reset link is invalid or has expired. Please request a new link.'
            });
        }

        // Update password (hashed by pre-save hook in User model; avoiding double-hashing)
        user.password = password;
        user.isPasswordSet = true;
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Invalidate current refresh cookie session for security
        res.cookie('refreshToken', 'none', {
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'Your password has been reset successfully. Please log in with your new password.'
        });
    } catch (error) {
        console.error('[ResetPassword] Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                authProvider: user.authProvider,
                isPasswordSet: Boolean(user.isPasswordSet)
            }
        });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// @desc    Set password for authenticated user (e.g., after Google signup)
// @route   POST /api/auth/set-password
// @access  Private
exports.setPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide password and confirm password' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
            });
        }

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = password; // Will be hashed by pre-save hook
        user.isPasswordSet = true;
        await user.save();

        res.json({
            success: true,
            message: 'Password created successfully',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                authProvider: user.authProvider || 'google',
                isPasswordSet: true
            }
        });
    } catch (error) {
        console.error("Set password error:", error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// @desc    Google Sign-in / Sign-up
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
    try {
        const idToken = req.body.credential || req.body.idToken;

        if (!idToken || typeof idToken !== 'string') {
            return res.status(400).json({
                success: false,
                code: 'MISSING_CREDENTIAL',
                message: 'Google credential / ID token is required'
            });
        }

        let payload;

        // Automated test mode helper
        if (process.env.NODE_ENV === 'test' && idToken.startsWith('test-token:')) {
            const rawParts = idToken.replace('test-token:', '').split('|');
            payload = {
                sub: rawParts[0] || 'test_google_sub_123',
                email: (rawParts[1] || 'testuser@example.com').trim().toLowerCase(),
                name: rawParts[2] || 'Test Candidate',
                picture: 'https://lh3.googleusercontent.com/test-avatar',
                email_verified: true
            };
        } else {
            const googleClientId = process.env.GOOGLE_CLIENT_ID;
            if (!googleClientId || googleClientId.includes('your_google_client_id_here')) {
                console.error('[GoogleAuth Error] GOOGLE_CLIENT_ID is not configured in environment variables');
                return res.status(500).json({
                    success: false,
                    code: 'AUTH_CONFIG_ERROR',
                    message: 'Google authentication is not properly configured on the server.'
                });
            }

            try {
                const client = new OAuth2Client(googleClientId);
                const ticket = await client.verifyIdToken({
                    idToken,
                    audience: googleClientId,
                });
                payload = ticket.getPayload();
            } catch (verificationError) {
                console.error('[GoogleAuth Error] Token verification failed:', verificationError.message);
                return res.status(401).json({
                    success: false,
                    code: 'INVALID_CREDENTIAL',
                    message: 'Invalid or expired Google credential'
                });
            }
        }

        if (!payload || !payload.sub) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_PAYLOAD',
                message: 'Invalid Google token payload'
            });
        }

        if (!payload.email || payload.email_verified !== true) {
            return res.status(403).json({
                success: false,
                code: 'EMAIL_NOT_VERIFIED',
                message: 'Google account email is not verified'
            });
        }

        const googleId = payload.sub;
        const email = payload.email.trim().toLowerCase();
        const fullName = payload.name || payload.given_name || 'JobFit Candidate';
        const avatar = payload.picture || '';

        // 1. Check if user already exists by googleId
        let user = await User.findOne({ googleId });

        if (user) {
            if (!user.emailVerified) {
                user.emailVerified = true;
            }
            if (avatar && !user.avatar) {
                user.avatar = avatar;
            }
            if (fullName && user.fullName === 'Google User') {
                user.fullName = fullName;
            }
            await user.save();

            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);
            setRefreshCookie(res, refreshToken);

            return res.json({
                success: true,
                token: accessToken,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    avatar: user.avatar,
                    authProvider: 'google'
                }
            });
        }

        // 2. Check if user exists by verified email (link existing account)
        const existingUserByEmail = await User.findOne({ email });

        if (existingUserByEmail) {
            if (existingUserByEmail.googleId && existingUserByEmail.googleId !== googleId) {
                return res.status(409).json({
                    success: false,
                    code: 'GOOGLE_ACCOUNT_CONFLICT',
                    message: 'This email is already associated with another Google account.'
                });
            }

            existingUserByEmail.googleId = googleId;
            existingUserByEmail.emailVerified = true;
            existingUserByEmail.authProvider = 'google';
            if (!existingUserByEmail.avatar && avatar) {
                existingUserByEmail.avatar = avatar;
            }
            await existingUserByEmail.save();

            const accessToken = generateAccessToken(existingUserByEmail._id);
            const refreshToken = generateRefreshToken(existingUserByEmail._id);
            setRefreshCookie(res, refreshToken);

            return res.json({
                success: true,
                token: accessToken,
                user: {
                    _id: existingUserByEmail._id,
                    fullName: existingUserByEmail.fullName,
                    email: existingUserByEmail.email,
                    avatar: existingUserByEmail.avatar,
                    authProvider: 'google'
                }
            });
        }

        // 3. New user registration via Google
        try {
            user = await User.create({
                googleId,
                email,
                fullName,
                avatar,
                emailVerified: true,
                authProvider: 'google'
            });
        } catch (createError) {
            if (createError.code === 11000) {
                user = await User.findOne({ $or: [{ googleId }, { email }] });
                if (!user) {
                    throw createError;
                }
            } else {
                throw createError;
            }
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        setRefreshCookie(res, refreshToken);

        return res.status(201).json({
            success: true,
            token: accessToken,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                authProvider: 'google'
            }
        });
    } catch (error) {
        console.error('[GoogleAuth Error] Unexpected error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during Google authentication' });
    }
};
