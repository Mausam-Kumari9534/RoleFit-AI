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

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
