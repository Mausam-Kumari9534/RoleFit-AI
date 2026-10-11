/**
 * HTTP Integration Test Suite for JobFit AI Phase 1 API Endpoints
 */
const assert = require('assert');
const express = require('express');
const cors = require('cors');
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
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

async function runHttpTests() {
    console.log('--- Starting HTTP API Endpoints Test Suite ---');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/matchai_test');

    // Clean test data
    await User.deleteMany({ email: { $regex: /@httptest\.com$/i } });
    await Report.deleteMany({ jobTitle: 'HTTP Test Role' });

    let server;
    let baseUrl;

    try {
        server = await new Promise((resolve) => {
            const s = app.listen(0, () => {
                const port = s.address().port;
                baseUrl = `http://127.0.0.1:${port}`;
                console.log(`✓ Test Express server running on ${baseUrl}`);
                resolve(s);
            });
        });

        // TEST 1: Google Auth Signup/Login
        console.log('\n[HTTP Test 1] POST /api/auth/google (Google Authentication)...');
        const authRes = await fetch(`${baseUrl}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                credential: 'test-token:google_sub_http_user_1|user1@httptest.com|Sarah Candidate'
            })
        });
        const authData = await authRes.json();
        assert.strictEqual(authRes.status, 201);
        assert.strictEqual(authData.success, true);
        assert.ok(authData.token, 'Should return access token');
        assert.strictEqual(authData.user.email, 'user1@httptest.com');
        assert.strictEqual(authData.user.fullName, 'Sarah Candidate');
        const token1 = authData.token;
        const userId1 = authData.user._id;
        console.log('✓ Successfully authenticated User 1 via Google');

        // Second call for existing user -> returns 200
        const loginRes = await fetch(`${baseUrl}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                credential: 'test-token:google_sub_http_user_1|user1@httptest.com|Sarah Candidate'
            })
        });
        const loginData = await loginRes.json();
        assert.strictEqual(loginRes.status, 200);
        assert.strictEqual(loginData.success, true);
        console.log('✓ Successfully logged in existing User 1 via Google');

        // Create User 2
        const authRes2 = await fetch(`${baseUrl}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                credential: 'test-token:google_sub_http_user_2|user2@httptest.com|Alex Second'
            })
        });
        const authData2 = await authRes2.json();
        const token2 = authData2.token;
        console.log('✓ Successfully authenticated User 2 via Google');

        // TEST 2: Protected profile endpoint
        console.log('\n[HTTP Test 2] GET /api/auth/profile (Authorization Verification)...');
        // Without token -> 401
        const unauthRes = await fetch(`${baseUrl}/api/auth/profile`);
        assert.strictEqual(unauthRes.status, 401);
        console.log('✓ Correctly rejected unauthenticated request with 401');

        // With token -> 200
        const profRes = await fetch(`${baseUrl}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token1}` }
        });
        const profData = await profRes.json();
        assert.strictEqual(profRes.status, 200);
        assert.strictEqual(profData.user.email, 'user1@httptest.com');
        console.log('✓ Authenticated profile retrieved successfully');

        // TEST 3: Report creation directly in DB and API retrieval
        console.log('\n[HTTP Test 3] GET /api/reports and GET /api/reports/:id...');
        const newReport = await Report.create({
            user: userId1,
            resumeFileName: 'sarah_resume.pdf',
            jobTitle: 'HTTP Test Role',
            jobDescription: 'Software Engineer role with React and Node.js requirements.',
            matchScore: 82,
            atsBreakdown: { technical: 85, keyword: 80, experience: 80, format: 90 },
            summary: 'Solid compatibility with software engineering requirements.',
            matchedSkills: ['React', 'JavaScript'],
            missingSkills: [{ skill: 'GraphQL', priority: 'Optional' }]
        });

        // User 1 lists reports
        const listRes = await fetch(`${baseUrl}/api/reports`, {
            headers: { 'Authorization': `Bearer ${token1}` }
        });
        const listData = await listRes.json();
        assert.strictEqual(listRes.status, 200);
        assert.strictEqual(listData.count, 1);
        assert.strictEqual(listData.reports[0]._id.toString(), newReport._id.toString());
        console.log('✓ User 1 lists their reports successfully');

        // User 1 gets specific report
        const getRes = await fetch(`${baseUrl}/api/reports/${newReport._id}`, {
            headers: { 'Authorization': `Bearer ${token1}` }
        });
        const getData = await getRes.json();
        assert.strictEqual(getRes.status, 200);
        assert.strictEqual(getData.report.jobTitle, 'HTTP Test Role');
        console.log('✓ User 1 gets report by ID successfully');

        // TEST 4: Security - User 2 attempts to access User 1's report
        console.log('\n[HTTP Test 4] Report Security: User 2 cannot access User 1 report...');
        const forbiddenRes = await fetch(`${baseUrl}/api/reports/${newReport._id}`, {
            headers: { 'Authorization': `Bearer ${token2}` }
        });
        assert.strictEqual(forbiddenRes.status, 403);
        console.log('✓ User 2 blocked with 403 Forbidden from accessing User 1 report');

        // User 2 cannot delete User 1's report
        const deleteForbiddenRes = await fetch(`${baseUrl}/api/reports/${newReport._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token2}` }
        });
        assert.strictEqual(deleteForbiddenRes.status, 403);
        console.log('✓ User 2 blocked with 403 Forbidden from deleting User 1 report');

        // TEST 5: User 1 deletes own report
        console.log('\n[HTTP Test 5] Report Deletion by Owner...');
        const deleteRes = await fetch(`${baseUrl}/api/reports/${newReport._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token1}` }
        });
        assert.strictEqual(deleteRes.status, 200);
        console.log('✓ User 1 deleted their own report');

        // Verify report is gone
        const goneRes = await fetch(`${baseUrl}/api/reports/${newReport._id}`, {
            headers: { 'Authorization': `Bearer ${token1}` }
        });
        assert.strictEqual(goneRes.status, 404);
        console.log('✓ Verified deleted report returns 404 Not Found');

        // Cleanup
        await User.deleteMany({ email: { $regex: /@httptest\.com$/i } });

        console.log('\n===========================================');
        console.log('✓ ALL HTTP API ENDPOINT TESTS PASSED SUCCESSFULLY!');
        console.log('===========================================\n');
    } finally {
        if (server) server.close();
        await mongoose.disconnect();
    }
}

runHttpTests().catch(err => {
    console.error('HTTP Tests Failed:', err);
    process.exit(1);
});
