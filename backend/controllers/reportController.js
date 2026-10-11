const mongoose = require('mongoose');
const Report = require('../models/Report');
const pdfService = require('../services/pdfService');
const geminiService = require('../services/geminiService');

/**
 * Validate and sanitize score between 0 and 100
 */
const sanitizeScore = (score, fallback = 70) => {
    const num = Number(score);
    if (isNaN(num)) return fallback;
    return Math.max(0, Math.min(100, Math.round(num)));
};

/**
 * Extract an estimated job title from the job description
 */
const extractJobTitle = (jobDescription) => {
    if (!jobDescription) return 'Target Role';
    const lines = jobDescription.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines.slice(0, 5)) {
        if (/role|title|position|engineer|developer|designer|manager|specialist|analyst|intern/i.test(line) && line.length < 80) {
            return line.replace(/^(role|job title|position|title):/i, '').trim() || 'Target Role';
        }
    }
    return lines[0]?.substring(0, 50) || 'Target Role';
};

/**
 * @desc    Analyze resume PDF against Job Description and save report
 * @route   POST /api/analyze-resume
 * @access  Private
 */
exports.analyzeResume = async (req, res) => {
    try {
        const { jobDescription } = req.body;
        const resumeFile = req.file;

        // 1. Validate inputs
        if (!resumeFile) {
            return res.status(400).json({ 
                success: false, 
                error: 'Resume PDF file is required.' 
            });
        }

        if (resumeFile.mimetype !== 'application/pdf' && !resumeFile.originalname.toLowerCase().endsWith('.pdf')) {
            return res.status(400).json({ 
                success: false, 
                error: 'Only PDF format is supported for resume uploads.' 
            });
        }

        if (resumeFile.size > 5 * 1024 * 1024) {
            return res.status(400).json({ 
                success: false, 
                error: 'Resume file size exceeds the 5MB limit.' 
            });
        }

        if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 50) {
            return res.status(400).json({ 
                success: false, 
                error: 'Job description is required and must be at least 50 characters long.' 
            });
        }

        if (jobDescription.trim().length > 15000) {
            return res.status(400).json({ 
                success: false, 
                error: 'Job description is too long (maximum 15,000 characters).' 
            });
        }

        // 2. Extract text from PDF buffer
        let resumeText;
        try {
            resumeText = await pdfService.extractText(resumeFile.buffer);
        } catch (pdfError) {
            return res.status(400).json({ 
                success: false, 
                error: pdfError.message || 'Failed to extract text from the uploaded PDF.' 
            });
        }

        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({ 
                success: false, 
                error: 'The uploaded PDF does not contain sufficient readable text. Please check that it is not scanned or blank.' 
            });
        }

        // 3. Request Gemini AI analysis
        const rawAnalysis = await geminiService.analyze(resumeText, jobDescription.trim());

        // 4. Validate and normalize the analysis output
        const atsBreakdown = {
            technical: sanitizeScore(rawAnalysis.atsBreakdown?.technical, 70),
            keyword: sanitizeScore(rawAnalysis.atsBreakdown?.keyword, 65),
            experience: sanitizeScore(rawAnalysis.atsBreakdown?.projects || rawAnalysis.atsBreakdown?.experience, 70),
            format: sanitizeScore(rawAnalysis.atsBreakdown?.format, 85)
        };

        // Documented weighted methodology:
        // Match Score = (Technical * 40%) + (Keywords * 30%) + (Experience * 20%) + (Formatting * 10%)
        const calculatedWeightedScore = Math.round(
            (atsBreakdown.technical * 0.40) +
            (atsBreakdown.keyword * 0.30) +
            (atsBreakdown.experience * 0.20) +
            (atsBreakdown.format * 0.10)
        );

        const matchScore = sanitizeScore(rawAnalysis.matchScore || calculatedWeightedScore, calculatedWeightedScore);

        // Normalize matched and missing skills
        const matchedSkills = Array.isArray(rawAnalysis.matchingSkills) 
            ? rawAnalysis.matchingSkills.map(s => typeof s === 'string' ? s.trim() : String(s)).filter(Boolean)
            : [];

        const missingSkills = Array.isArray(rawAnalysis.missingSkills)
            ? rawAnalysis.missingSkills.map(item => {
                if (typeof item === 'string') {
                    return { skill: item.trim(), priority: 'Important' };
                }
                return {
                    skill: (item.skill || '').trim(),
                    priority: ['Critical', 'Important', 'Optional'].includes(item.priority) ? item.priority : 'Important'
                };
            }).filter(item => Boolean(item.skill))
            : [];

        const partiallyMatchedSkills = Array.isArray(rawAnalysis.skillsMatch)
            ? rawAnalysis.skillsMatch.filter(s => s && s.status === false).map(s => s.skill).filter(Boolean)
            : [];

        const keywordAnalysis = {
            foundKeywords: Array.isArray(rawAnalysis.keywordDensity)
                ? rawAnalysis.keywordDensity.filter(k => k && k.status).map(k => k.keyword).filter(Boolean)
                : matchedSkills.slice(0, 10),
            missingKeywords: Array.isArray(rawAnalysis.missingKeywords)
                ? rawAnalysis.missingKeywords.map(k => typeof k === 'string' ? k.trim() : String(k)).filter(Boolean)
                : [],
            recommendations: Array.isArray(rawAnalysis.suggestions)
                ? rawAnalysis.suggestions.slice(0, 4)
                : []
        };

        const recommendations = Array.isArray(rawAnalysis.suggestions)
            ? rawAnalysis.suggestions.map(s => typeof s === 'string' ? s.trim() : String(s)).filter(Boolean)
            : [];

        const actionPlan = Array.isArray(rawAnalysis.actionPlan)
            ? rawAnalysis.actionPlan.map((ap, idx) => ({
                priority: ap.priority || (idx + 1),
                action: ap.action || 'Optimize resume section',
                reason: ap.reason || '',
                impact: ap.impact || 'Medium',
                time: ap.time || '15 mins'
            }))
            : [];

        const rewrites = Array.isArray(rawAnalysis.rewrites)
            ? rawAnalysis.rewrites.filter(r => r && r.before && r.after)
            : [];

        const jobTitle = extractJobTitle(jobDescription);

        // 5. Persist report in MongoDB strictly associated with authenticated user
        const report = await Report.create({
            user: req.user._id,
            resumeFileName: resumeFile.originalname || 'resume.pdf',
            jobTitle,
            jobDescription: jobDescription.trim(),
            matchScore,
            atsBreakdown,
            summary: rawAnalysis.summary || `Resume shows ${matchScore}% alignment with the target role.`,
            matchedSkills,
            missingSkills,
            partiallyMatchedSkills,
            keywordAnalysis,
            recommendations,
            actionPlan,
            rewrites,
            verdict: {
                interviewChance: sanitizeScore(rawAnalysis.verdict?.interviewChance, matchScore),
                opinion: rawAnalysis.verdict?.opinion || rawAnalysis.summary || ''
            },
            applyDecision: {
                decision: rawAnalysis.applyDecision?.decision || (matchScore >= 75 ? 'YES' : 'APPLY AFTER UPDATING RESUME'),
                reason: rawAnalysis.applyDecision?.reason || ''
            }
        });

        res.status(201).json({
            success: true,
            reportId: report._id,
            report
        });

    } catch (error) {
        console.error('[AnalyzeResume Error]:', error.message);
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'An error occurred during resume analysis.'
        });
    }
};

/**
 * @desc    Get all saved reports for the authenticated user
 * @route   GET /api/reports
 * @access  Private
 */
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .select('-jobDescription'); // exclude long text for lightweight summary list

        res.json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (error) {
        console.error('[GetReports Error]:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Server error retrieving reports' 
        });
    }
};

/**
 * @desc    Get a single report by ID (with strict ownership check)
 * @route   GET /api/reports/:id
 * @access  Private
 */
exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid report ID format' 
            });
        }

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({ 
                success: false, 
                error: 'Report not found' 
            });
        }

        // Strict ownership enforcement
        if (report.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                error: 'Not authorized to access this report' 
            });
        }

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error('[GetReportById Error]:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Server error retrieving report' 
        });
    }
};

/**
 * @desc    Delete a report by ID (with strict ownership check)
 * @route   DELETE /api/reports/:id
 * @access  Private
 */
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid report ID format' 
            });
        }

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({ 
                success: false, 
                error: 'Report not found' 
            });
        }

        // Strict ownership enforcement
        if (report.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                error: 'Not authorized to delete this report' 
            });
        }

        await report.deleteOne();

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('[DeleteReport Error]:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Server error deleting report' 
        });
    }
};
