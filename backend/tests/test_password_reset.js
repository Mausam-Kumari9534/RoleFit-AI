const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const emailService = require('../services/emailService');
const { forgotPassword, verifyResetToken, resetPassword, login } = require('../controllers/authController');

// Mock Express req & res
function mockReqRes(body = {}, params = {}, cookies = {}) {
    let statusCode = 200;
    let responseData = null;
    let cookieData = {};

    const req = {
        body,
        params,
        cookies,
        headers: {}
    };

    const res = {
        status: function(code) {
            statusCode = code;
            return this;
        },
        json: function(data) {
            responseData = data;
            return this;
        },
        cookie: function(name, val, opts) {
            cookieData[name] = { val, opts };
            return this;
        },
        getStatusCode: () => statusCode,
        getBody: () => responseData,
        getCookies: () => cookieData
    };

    return { req, res };
}

async function runTests() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/matchai');
    console.log('Connected to MongoDB.\n');

    const testEmailWithPassword = 'test_reset_user_' + Date.now() + '@example.com';
    const testGoogleOnlyEmail = 'test_google_user_' + Date.now() + '@example.com';
    const initialPassword = 'InitialPassword123!';
    const newPassword = 'BrandNewPassword123$';

    let passedTests = 0;
    let failedTests = 0;

    function assert(condition, message) {
        if (condition) {
            console.log('  PASS:', message);
            passedTests++;
        } else {
            console.error('  FAIL:', message);
            failedTests++;
        }
    }

    try {
        // --- 1. Test invalid email format on forgot-password ---
        console.log('Test 1: Invalid email format request');
        {
            const { req, res } = mockReqRes({ email: 'not-an-email' });
            await forgotPassword(req, res);
            assert(res.getStatusCode() === 400, 'Returns HTTP 400 for invalid email');
            assert(res.getBody().success === false, 'Returns success: false');
        }

        // --- 2. Test unknown email request (prevent enumeration) ---
        console.log('\nTest 2: Unknown email request (prevent account enumeration)');
        {
            const { req, res } = mockReqRes({ email: 'nonexistent_account_xyz@example.com' });
            await forgotPassword(req, res);
            assert(res.getStatusCode() === 200, 'Returns HTTP 200');
            assert(res.getBody().success === true, 'Returns generic success: true');
            assert(res.getBody().message.includes('If an account exists'), 'Returns generic enumeration-safe message');
        }

        // --- 3. Test Google account without password setup ---
        console.log('\nTest 3: Google account without configured password');
        {
            const googleUser = await User.create({
                fullName: 'Google User Test',
                email: testGoogleOnlyEmail,
                googleId: 'google_id_' + Date.now(),
                authProvider: 'google',
                isPasswordSet: false,
                emailVerified: true
            });

            const { req, res } = mockReqRes({ email: testGoogleOnlyEmail });
            await forgotPassword(req, res);
            assert(res.getStatusCode() === 200, 'Returns HTTP 200 with generic success');
            
            const reloadedGoogleUser = await User.findById(googleUser._id);
            assert(!reloadedGoogleUser.passwordResetTokenHash, 'Does NOT generate reset token for Google user without password setup');
        }

        // --- 4. Create standard user with password ---
        console.log('\nCreating standard user for password reset tests...');
        const user = await User.create({
            fullName: 'Reset Test User',
            email: testEmailWithPassword,
            password: initialPassword,
            authProvider: 'local',
            isPasswordSet: true,
            emailVerified: true
        });

        // --- 5a. Provider failure rollback on forgot-password ---
        console.log('\nTest 4a: Email provider failure rolls back token and returns HTTP 503');
        {
            const originalSend = emailService.sendPasswordResetEmail;
            emailService.sendPasswordResetEmail = async () => {
                throw new Error('Resend API Error: You can only send testing emails to your own email address');
            };

            const { req, res } = mockReqRes({ email: testEmailWithPassword });
            await forgotPassword(req, res);
            assert(res.getStatusCode() === 503, 'Returns HTTP 503 on email provider failure');
            assert(res.getBody().success === false, 'Returns success: false');
            assert(res.getBody().code === 'EMAIL_DELIVERY_FAILED', 'Returns EMAIL_DELIVERY_FAILED code');

            const reloadedFailedUser = await User.findById(user._id);
            assert(!reloadedFailedUser.passwordResetTokenHash, 'Rolls back and clears reset token hash in MongoDB on delivery failure');
            assert(!reloadedFailedUser.passwordResetExpires, 'Clears reset token expiry in MongoDB on delivery failure');

            emailService.sendPasswordResetEmail = originalSend;
        }

        // --- 5b. Valid forgot-password request with successful dispatch ---
        console.log('\nTest 4b: Valid forgot-password request with successful email dispatch');
        {
            const originalSend = emailService.sendPasswordResetEmail;
            emailService.sendPasswordResetEmail = async () => true;

            const { req, res } = mockReqRes({ email: testEmailWithPassword });
            await forgotPassword(req, res);
            assert(res.getStatusCode() === 200, 'Returns HTTP 200');
            assert(res.getBody().success === true, 'Returns generic success: true');

            const reloadedSuccessUser = await User.findById(user._id);
            assert(Boolean(reloadedSuccessUser.passwordResetTokenHash), 'Generates and stores SHA-256 token hash in MongoDB');
            assert(reloadedSuccessUser.passwordResetExpires > Date.now(), 'Sets future expiry timestamp');

            emailService.sendPasswordResetEmail = originalSend;
        }

        // Retrieve raw token hash to simulate receiving the reset token
        const reloadedUser = await User.findById(user._id);

        // Create a known token and store its hash directly to test exact matching
        const knownToken = crypto.randomBytes(32).toString('hex');
        const knownHash = crypto.createHash('sha256').update(knownToken).digest('hex');
        reloadedUser.passwordResetTokenHash = knownHash;
        reloadedUser.passwordResetExpires = new Date(Date.now() + 20 * 60 * 1000);
        await reloadedUser.save();

        // --- 6. Valid token verification ---
        console.log('\nTest 5: Verify valid reset token');
        {
            const { req, res } = mockReqRes({}, { token: knownToken });
            await verifyResetToken(req, res);
            assert(res.getStatusCode() === 200, 'Returns HTTP 200');
            assert(res.getBody().success === true, 'Token verified as valid');
        }

        // --- 7. Invalid token verification ---
        console.log('\nTest 6: Verify invalid reset token');
        {
            const { req, res } = mockReqRes({}, { token: 'completely_fake_invalid_token_123' });
            await verifyResetToken(req, res);
            assert(res.getStatusCode() === 400, 'Returns HTTP 400');
            assert(res.getBody().code === 'INVALID_OR_EXPIRED_TOKEN', 'Returns INVALID_OR_EXPIRED_TOKEN code');
        }

        // --- 8. Expired token verification ---
        console.log('\nTest 7: Verify expired reset token');
        {
            const expiredToken = crypto.randomBytes(32).toString('hex');
            const expiredHash = crypto.createHash('sha256').update(expiredToken).digest('hex');
            reloadedUser.passwordResetTokenHash = expiredHash;
            reloadedUser.passwordResetExpires = new Date(Date.now() - 10000); // 10 seconds in past
            await reloadedUser.save();

            const { req, res } = mockReqRes({}, { token: expiredToken });
            await verifyResetToken(req, res);
            assert(res.getStatusCode() === 400, 'Returns HTTP 400');
            assert(res.getBody().code === 'INVALID_OR_EXPIRED_TOKEN', 'Returns INVALID_OR_EXPIRED_TOKEN code');
        }

        // Reset to valid known token for password reset tests
        reloadedUser.passwordResetTokenHash = knownHash;
        reloadedUser.passwordResetExpires = new Date(Date.now() + 20 * 60 * 1000);
        await reloadedUser.save();

        // --- 9. Mismatched passwords on reset ---
        console.log('\nTest 8: Mismatched passwords rejection');
        {
            const { req, res } = mockReqRes({
                token: knownToken,
                password: newPassword,
                confirmPassword: 'DifferentPassword123!'
            });
            await resetPassword(req, res);
            assert(res.getStatusCode() === 400, 'Returns HTTP 400');
            assert(res.getBody().message.includes('do not match'), 'Error indicates passwords do not match');
        }

        // --- 10. Weak password on reset ---
        console.log('\nTest 9: Weak password rejection');
        {
            const { req, res } = mockReqRes({
                token: knownToken,
                password: 'weak',
                confirmPassword: 'weak'
            });
            await resetPassword(req, res);
            assert(res.getStatusCode() === 400, 'Returns HTTP 400');
            assert(res.getBody().message.includes('8 characters'), 'Error indicates strength requirements');
        }

        // --- 11. Successful password reset ---
        console.log('\nTest 10: Successful password reset');
        {
            const { req, res } = mockReqRes({
                token: knownToken,
                password: newPassword,
                confirmPassword: newPassword
            });
            await resetPassword(req, res);
            assert(res.getStatusCode() === 200, 'Returns HTTP 200');
            assert(res.getBody().success === true, 'Returns success: true');
            assert(res.getCookies().refreshToken?.val === 'none', 'Invalidates refresh token cookie');

            const updatedUser = await User.findById(user._id).select('+password');
            assert(updatedUser.isPasswordSet === true, 'Ensures isPasswordSet is true');
            assert(!updatedUser.passwordResetTokenHash, 'Clears passwordResetTokenHash from DB');
            assert(!updatedUser.passwordResetExpires, 'Clears passwordResetExpires from DB');

            const isMatch = await updatedUser.matchPassword(newPassword);
            assert(isMatch, 'New password matches and was hashed with bcrypt');
        }

        // --- 12. Reused token attempt (Single-use enforcement) ---
        console.log('\nTest 11: Reused token attempt (single-use enforcement)');
        {
            const { req, res } = mockReqRes({
                token: knownToken,
                password: 'AnotherPassword123$',
                confirmPassword: 'AnotherPassword123$'
            });
            await resetPassword(req, res);
            assert(res.getStatusCode() === 400, 'Returns HTTP 400');
            assert(res.getBody().code === 'INVALID_OR_EXPIRED_TOKEN', 'Rejects already-used token');
        }

        // --- 13. Login with OLD password (should fail) ---
        console.log('\nTest 12: Login with old password fails');
        {
            const { req, res } = mockReqRes({
                email: testEmailWithPassword,
                password: initialPassword
            });
            await login(req, res);
            assert(res.getStatusCode() === 401, 'Returns HTTP 401 for old password');
            assert(res.getBody().code === 'INVALID_CREDENTIALS', 'Returns INVALID_CREDENTIALS');
        }

        // --- 14. Login with NEW password (should succeed) ---
        console.log('\nTest 13: Login with new password succeeds');
        {
            const { req, res } = mockReqRes({
                email: testEmailWithPassword,
                password: newPassword
            });
            await login(req, res);
            assert(res.getStatusCode() === 200, 'Returns HTTP 200 for new password');
            assert(res.getBody().success === true, 'Login successful with new password');
            assert(Boolean(res.getBody().token), 'Returns valid access token');
            assert(Boolean(res.getCookies().refreshToken?.val), 'Sets valid refresh token cookie');
        }

        // Clean up test records
        await User.deleteMany({ email: { $in: [testEmailWithPassword, testGoogleOnlyEmail] } });
        console.log('\nCleaned up test users from MongoDB.');

    } catch (err) {
        console.error('Unhandled test error:', err);
        failedTests++;
    } finally {
        await mongoose.disconnect();
        console.log(`\n========================================`);
        console.log(`TEST SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
        console.log(`========================================\n`);
        process.exit(failedTests > 0 ? 1 : 0);
    }
}

runTests();
