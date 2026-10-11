const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please add a full name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'google',
    },
    isPasswordSet: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId && this.authProvider === 'local';
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't return password by default
    },
    avatar: {
        type: String,
        default: '',
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationOtpHash: String,
    emailVerificationOtpExpiresAt: Date,
    emailVerificationAttempts: {
        type: Number,
        default: 0
    },
    lastOtpSentAt: Date,
    passwordResetTokenHash: String,
    passwordResetExpires: Date
}, {
    timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
