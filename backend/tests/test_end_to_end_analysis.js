/**
 * End-to-End Live Resume Analysis Integration Test
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

process.env.NODE_ENV = 'test';

const authRoutes = require('../routes/auth');
const apiRoutes = require('../routes/api');
const User = require('../models/User');
const Report = require('../models/Report');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

async function runLiveAnalysisTest() {
    console.log('--- Starting Live E2E Resume Analysis Test ---');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/matchai_test');

    await User.deleteMany({ email: 'e2e_candidate@httptest.com' });

    let server;
    try {
        server = await new Promise(resolve => {
            const s = app.listen(0, () => resolve(s));
        });
        const port = server.address().port;
        const baseUrl = `http://127.0.0.1:${port}`;

        // 1. Authenticate user
        const authRes = await fetch(`${baseUrl}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                credential: 'test-token:google_e2e_sub_999|e2e_candidate@httptest.com|E2E Candidate'
            })
        });
        const authData = await authRes.json();
        assert.ok(authRes.status === 200 || authRes.status === 201);
        const token = authData.token;
        console.log('✓ Authenticated E2E user with Google');

        // 2. Prepare multipart form with test_resume.pdf
        const resumePdfPath = path.join(__dirname, '../test_resume.pdf');
        const pdfBytes = fs.readFileSync(resumePdfPath);
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

        const jobDescription = `We are looking for a Software Engineer with expertise in JavaScript, React, web development, REST APIs, and team collaboration. Requirements: Bachelor's degree in CS or equivalent experience, 2+ years of professional programming, and great problem solving skills.`;

        const headerPart = Buffer.from(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="jobDescription"\r\n\r\n` +
            `${jobDescription}\r\n` +
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="resume"; filename="valid.pdf"\r\n` +
            `Content-Type: application/pdf\r\n\r\n`
        );
        const footerPart = Buffer.from(`\r\n--${boundary}--\r\n`);
        const multipartBody = Buffer.concat([headerPart, pdfBytes, footerPart]);

        console.log('Posting resume and job description to /api/analyze-resume...');
        const analyzeRes = await fetch(`${baseUrl}/api/analyze-resume`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: multipartBody
        });

        const analyzeData = await analyzeRes.json();
        console.log('Response Status:', analyzeRes.status);

        assert.strictEqual(analyzeRes.status, 201, `Failed with: ${JSON.stringify(analyzeData)}`);
        assert.strictEqual(analyzeData.success, true);
        assert.ok(analyzeData.reportId, 'Must return saved reportId');
        assert.ok(analyzeData.report.matchScore >= 0 && analyzeData.report.matchScore <= 100);
        console.log(`✓ Analysis succeeded! Calculated Match Score: ${analyzeData.report.matchScore}%`);
        console.log(`✓ Report successfully persisted in MongoDB with ID: ${analyzeData.reportId}`);

        // 3. Verify report can be fetched by ID
        const fetchRes = await fetch(`${baseUrl}/api/reports/${analyzeData.reportId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const fetchData = await fetchRes.json();
        assert.strictEqual(fetchRes.status, 200);
        assert.strictEqual(fetchData.report.resumeFileName, 'valid.pdf');
        console.log('✓ Successfully retrieved report from /api/reports/:id');

        // Cleanup
        await User.deleteMany({ email: 'e2e_candidate@httptest.com' });
        await Report.findByIdAndDelete(analyzeData.reportId);
        console.log('✓ Cleaned up test data');

        console.log('\n===========================================');
        console.log('✓ COMPLETE LIVE END-TO-END RESUME ANALYSIS PASSED!');
        console.log('===========================================\n');
    } finally {
        if (server) server.close();
        await mongoose.disconnect();
    }
}

runLiveAnalysisTest().catch(err => {
    console.error('E2E Analysis Test Failed:', err);
    process.exit(1);
});
