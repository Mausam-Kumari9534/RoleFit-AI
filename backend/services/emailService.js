const { Resend } = require('resend');

// Helper to mask email securely
const maskEmail = (email) => {
    if (!email) return 'unknown';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    return `${local.substring(0, 2)}***@${domain}`;
};

// Helper to extract domain safely
const extractDomain = (emailString) => {
    if (!emailString) return 'none';
    const match = emailString.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return match ? match[1] : 'unknown';
};

exports.sendVerificationEmail = async (toEmail, token) => {
    console.log('\n--- [EmailService Debug] Email Verification Flow Started ---');
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is missing from environment variables. Resend is the only supported email provider.');
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationUrl = `${frontendUrl}/verify-email/${token}`;
        const fromEmail = process.env.EMAIL_FROM || 'MatchAI <onboarding@resend.dev>';
        const subject = 'Verify your JobFit AI account';
        
        console.log(`[EmailService Debug] Recipient: ${maskEmail(toEmail)}`);
        console.log(`[EmailService Debug] EMAIL_FROM domain: ${extractDomain(fromEmail)}`);
        console.log('[EmailService Debug] RESEND_API_KEY is present at runtime.');
        
        const html = `
            <p>Hi,</p>
            <p>Thanks for creating your JobFit AI account.</p>
            <p>Please verify your email address to activate your account.</p>
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; margin-bottom: 10px;">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This verification link will expire in 30 minutes.</p>
            <p>If you did not create this account, you can ignore this email.</p>
        `;

        const resend = new Resend(process.env.RESEND_API_KEY);
        console.log('[EmailService Debug] Resend API request attempted...');
        
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject,
            html
        });
        
        if (error) {
            console.error(`[EmailService Debug] Resend Response Error Status: ${error.statusCode || error.status || 'unknown'}`);
            console.error(`[EmailService Debug] Resend Response Error Message: ${error.message || JSON.stringify(error)}`);
            throw new Error(`Resend API Error: ${error.message}`);
        }
        
        console.log(`[EmailService Debug] Resend Response Status: OK (200)`);
        console.log(`[EmailService Debug] Verification email sent successfully via Resend. ID: ${data?.id}`);
        console.log('--- [EmailService Debug] Flow Ended ---\n');
        return true;

    } catch (error) {
        console.error('[EmailService Debug] Error sending verification email:', error.message);
        console.log('--- [EmailService Debug] Flow Ended with Error ---\n');
        throw error; // Throw so the controller knows it failed
    }
};

exports.maskEmail = maskEmail;

exports.sendPasswordResetEmail = async (toEmail, token) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is missing from environment variables.');
        }

        const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        let cleanFrontendUrl = rawFrontendUrl.replace(/\/+$/, '');
        if (process.env.NODE_ENV === 'production' && cleanFrontendUrl.startsWith('http://')) {
            cleanFrontendUrl = cleanFrontendUrl.replace('http://', 'https://');
        }

        const resetUrl = `${cleanFrontendUrl}/reset-password/${token}`;
        const fromEmail = process.env.EMAIL_FROM || 'MatchAI <onboarding@resend.dev>';
        const subject = 'Password Reset Request - MatchAI';

        const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="margin-bottom: 24px; text-align: left;">
                    <h1 style="color: #4f46e5; font-size: 20px; font-weight: 700; margin: 0;">MatchAI</h1>
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Career Intelligence</span>
                </div>
                <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Reset Your Password</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px;">We received a request to reset the password for your MatchAI account. Click the button below to choose a new password:</p>
                <div style="margin: 24px 0;">
                    <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px; font-weight: 600;">Reset Password</a>
                </div>
                <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 8px;">If the button above does not work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; line-height: 1.5; color: #4f46e5; word-break: break-all; margin: 0 0 20px;"><a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a></p>
                <div style="padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; line-height: 1.6; color: #94a3b8;">
                    <p style="margin: 0 0 6px;">This link will expire in 20 minutes and can only be used once.</p>
                    <p style="margin: 0;">If you did not request a password reset, you can safely ignore this email. Your password will not change until you access the link above and create a new one.</p>
                </div>
            </div>
        `;

        const resend = new Resend(process.env.RESEND_API_KEY);
        console.log(`[EmailService] Attempting to send password reset email to ${maskEmail(toEmail)} via Resend (sender domain: ${extractDomain(fromEmail)})...`);
        
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject,
            html
        });

        if (error) {
            console.error(`[EmailService] Resend rejected reset email for ${maskEmail(toEmail)}: [${error.statusCode || error.status || 'unknown'}] ${error.message}`);
            if (error.message && error.message.includes('only send testing emails to your own email address')) {
                console.error('[EmailService] CAUSE: Resend Sandbox restriction. The default sender onboarding@resend.dev only allows sending to the account owner email. To deliver reset emails to any recipient, verify a domain in Resend (resend.com/domains) and set EMAIL_FROM in backend/.env.');
            }
            const providerErr = new Error(`Email provider error: ${error.message}`);
            providerErr.statusCode = error.statusCode || error.status || 403;
            providerErr.code = error.name || 'RESEND_ERROR';
            throw providerErr;
        }

        console.log(`[EmailService] Password reset email delivered via Resend. ID: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (error) {
        console.error('[EmailService] Failed to send password reset email to', maskEmail(toEmail), ':', error.message);
        throw error;
    }
};

exports.sendOtpEmail = async (toEmail, otp) => {
    console.log('\n--- [EmailService Debug] OTP Email Flow Started ---');
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is missing from environment variables.');
        }

        const fromEmail = process.env.EMAIL_FROM || 'MatchAI <onboarding@resend.dev>';
        const subject = 'Your Verification Code - JobFit AI';
        
        console.log(`[EmailService Debug] Recipient: ${maskEmail(toEmail)}`);
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Verify Your Email</h2>
                <p>Hi,</p>
                <p>Thanks for registering with JobFit AI. Please use the verification code below to complete your registration:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 6px; margin: 20px 0;">
                    <h1 style="font-size: 36px; letter-spacing: 8px; color: #111827; margin: 0;">${otp}</h1>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This code will expire in 5 minutes.</p>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
        `;

        const resend = new Resend(process.env.RESEND_API_KEY);
        console.log('[EmailService Debug] Resend API request attempted...');
        
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject,
            html
        });
        
        if (error) {
            console.error(`[EmailService Debug] Resend Response Error Message: ${error.message}`);
            throw new Error(`Resend API Error: ${error.message}`);
        }
        
        console.log(`[EmailService Debug] OTP email sent successfully. ID: ${data?.id}`);
        console.log('--- [EmailService Debug] OTP Flow Ended ---\n');
        return true;

    } catch (error) {
        console.error('[EmailService Debug] Error sending OTP email:', error.message);
        console.log('--- [EmailService Debug] OTP Flow Ended with Error ---\n');
        throw error;
    }
};
