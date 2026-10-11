const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    resumeFileName: {
        type: String,
        required: true,
        default: 'resume.pdf'
    },
    jobTitle: {
        type: String,
        default: 'Target Role'
    },
    jobDescription: {
        type: String,
        required: true
    },
    matchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    scoreMethodology: {
        type: String,
        default: 'Semantic compatibility estimate calculated using weighted evaluation: Technical Skills Alignment (40%), ATS Keyword Coverage (30%), Role Experience Alignment (20%), and ATS Format Readability (10%). This is an advisory estimate, not a guaranteed employer ATS score or hiring prediction.'
    },
    atsBreakdown: {
        technical: { type: Number, default: 0 },
        keyword: { type: Number, default: 0 },
        experience: { type: Number, default: 0 },
        format: { type: Number, default: 0 }
    },
    summary: {
        type: String,
        default: ''
    },
    matchedSkills: [{
        type: String
    }],
    missingSkills: [{
        skill: { type: String, required: true },
        priority: { type: String, enum: ['Critical', 'Important', 'Optional'], default: 'Important' }
    }],
    partiallyMatchedSkills: [{
        type: String
    }],
    keywordAnalysis: {
        foundKeywords: [{ type: String }],
        missingKeywords: [{ type: String }],
        recommendations: [{ type: String }]
    },
    recommendations: [{
        type: String
    }],
    actionPlan: [{
        priority: { type: Number },
        action: { type: String },
        reason: { type: String },
        impact: { type: String },
        time: { type: String }
    }],
    rewrites: [{
        before: { type: String },
        after: { type: String }
    }],
    verdict: {
        interviewChance: { type: Number, default: 50 },
        opinion: { type: String, default: '' }
    },
    applyDecision: {
        decision: { type: String, default: 'APPLY AFTER UPDATING RESUME' },
        reason: { type: String, default: '' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
