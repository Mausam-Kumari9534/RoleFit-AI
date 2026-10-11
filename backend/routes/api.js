const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const reportController = require('../controllers/reportController');
const actionController = require('../controllers/actionController');
const builderController = require('../controllers/builderController');
const { protect } = require('../middleware/authMiddleware');

// Ephemeral memory storage for PDF processing
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF resume files are accepted.'), false);
        }
    }
});

// Rate limiter for AI analysis to protect resources
const analyzeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per window
    message: { 
        success: false, 
        error: 'Too many analysis requests. Please try again after a few minutes.' 
    }
});

// 1. Core Resume Analysis & Report Routes
router.post(
    '/analyze-resume', 
    protect, 
    analyzeLimiter, 
    (req, res, next) => {
        upload.single('resume')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ success: false, error: 'Resume file size exceeds the 5MB limit.' });
                }
                return res.status(400).json({ success: false, error: err.message });
            } else if (err) {
                return res.status(400).json({ success: false, error: err.message });
            }
            next();
        });
    },
    reportController.analyzeResume
);

router.get('/reports', protect, reportController.getReports);
router.get('/reports/:id', protect, reportController.getReportById);
router.delete('/reports/:id', protect, reportController.deleteReport);

// 2. Action Routes (JSON payloads)
router.post('/action/optimize-resume', protect, actionController.optimizeResume);
router.post('/action/generate-cover-letter', protect, actionController.generateCoverLetter);
router.post('/action/prepare-interview', protect, actionController.prepareInterview);

// 3. Builder Routes
router.route('/resume-builder/drafts')
    .get(protect, builderController.getDrafts)
    .post(protect, builderController.saveDraft);

router.route('/resume-builder/drafts/:id')
    .delete(protect, builderController.deleteDraft);

router.post('/resume-builder/rewrite', protect, builderController.aiRewrite);
router.post('/resume-builder/suggest', protect, builderController.aiSuggest);
router.post('/resume-builder/autofill', protect, upload.single('resume'), builderController.autoFill);

module.exports = router;
