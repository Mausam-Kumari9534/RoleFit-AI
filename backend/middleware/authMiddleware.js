const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

            // Get user from the token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            if (!req.user.emailVerified) {
                return res.status(403).json({ success: false, message: 'Not authorized, email not verified' });
            }

            next();
        } catch (error) {
            console.error("Not authorized, token failed:", error.message);
            if (error.name === 'TokenExpiredError') {
                 return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
            }
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
