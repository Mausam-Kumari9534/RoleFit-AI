const fs = require('fs');

let content = fs.readFileSync('controllers/authController.js', 'utf8');

// Replace isVerified with emailVerified globally
content = content.replace(/isVerified/g, 'emailVerified');

// Replace emailVerificationTokenHash with emailVerificationOtpHash
content = content.replace(/emailVerificationTokenHash/g, 'emailVerificationOtpHash');
// Replace emailVerificationExpires with emailVerificationOtpExpiresAt
content = content.replace(/emailVerificationExpires/g, 'emailVerificationOtpExpiresAt');

// Rewrite register
const registerRegex = /exports\.register = async \(req, res\) => \{[\s\S]*?(?=\/\/ @desc    Verify Email)/;
const newRegister = `exports.register = async (req, res) => {
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
            return res.status(500).json({ success: false, code: 'EMAIL_SEND_FAILED', message: 'We couldn\\'t send the verification email right now. Please try again later.' });
        }

        res.status(201).json({
            success: true,
            message: 'Account created successfully. We\\'ve sent a verification code to your email.'
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

`;
content = content.replace(registerRegex, newRegister);

// Add verifyEmailOtp and resendEmailOtp, replace old verifyEmail and resendVerification
const verifyResendRegex = /\/\/ @desc    Verify Email[\s\S]*?(?=\/\/ @desc    Login user)/;
const newVerifyResend = `// @desc    Verify Email OTP
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
            return res.status(500).json({ success: false, code: 'EMAIL_SEND_FAILED', message: 'We couldn\\'t send the verification email right now. Please try again later.' });
        }

        res.json({ success: true, message: 'Verification OTP sent. Please check your inbox.' });
    } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

`;
content = content.replace(verifyResendRegex, newVerifyResend);

fs.writeFileSync('controllers/authController.js', content);
