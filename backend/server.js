const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ai-compatibility-score.vercel.app'
];

if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(',').forEach((url) => {
        const clean = url.trim().replace(/\/+$/, '');
        if (clean && !allowedOrigins.includes(clean)) {
            allowedOrigins.push(clean);
        }
    });
}

// Middlewares
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/+$/, '');
        const isAllowed = 
            allowedOrigins.includes(cleanOrigin) ||
            /^https:\/\/ai-compatibility-score(-[a-z0-9-]+)?\.vercel\.app$/.test(cleanOrigin);

        if (isAllowed) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());



// Dummy route to prevent 404 errors for Chrome DevTools
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.json({});
});

// Health-check route for Render
app.get('/', (req, res) => {
    res.send('Backend is running successfully!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Database connection
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

// Keep-alive for the event loop
setInterval(() => {}, 1000 * 60 * 60);
