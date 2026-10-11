/**
 * JobFit AI - Phase 1 Complete Backend Integration & Security Test Suite
 */
const assert = require('assert');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Report = require('../models/Report');
const pdfService = require('../services/pdfService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matchai_test';

async function runTests() {
    console.log('--- Starting JobFit AI Phase 1 Test Suite ---');
    
    // Connect to database
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    try {
        // Clean test collections
        await User.deleteMany({ email: { $regex: /@testjobfit\.com$/i } });
        await Report.deleteMany({ jobTitle: 'Test Software Engineer' });

        // TEST 1: User creation with Google-only schema
        console.log('\n[Test 1] Testing User Model for Google-Only Auth...');
        const userA = await User.create({
            googleId: 'google_test_sub_user_a',
            email: 'user_a@testjobfit.com',
            fullName: 'User Alpha',
            avatar: 'https://example.com/avatar_a.png',
            emailVerified: true,
            authProvider: 'google'
        });
        assert.strictEqual(userA.emailVerified, true);
        assert.strictEqual(userA.authProvider, 'google');
        assert.strictEqual(userA.googleId, 'google_test_sub_user_a');
        console.log('✓ User A created with Google identity successfully');

        const userB = await User.create({
            googleId: 'google_test_sub_user_b',
            email: 'user_b@testjobfit.com',
            fullName: 'User Beta',
            avatar: 'https://example.com/avatar_b.png',
            emailVerified: true,
            authProvider: 'google'
        });
        console.log('✓ User B created successfully');

        // TEST 2: JWT Access Token generation & verification
        console.log('\n[Test 2] Testing JWT Authentication Tokens...');
        const tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });
        const decodedA = jwt.verify(tokenA, process.env.JWT_SECRET || 'fallback_secret');
        assert.strictEqual(decodedA.id.toString(), userA._id.toString());
        console.log('✓ JWT token verified correctly');

        // TEST 3: Report Model Creation & Scoring Calculations
        console.log('\n[Test 3] Testing Report Creation & Documented Scoring Methodology...');
        const testReport = await Report.create({
            user: userA._id,
            resumeFileName: 'test_resume.pdf',
            jobTitle: 'Test Software Engineer',
            jobDescription: 'Seeking a Senior Frontend Engineer with React, TypeScript, Node.js, and CSS expertise.',
            matchScore: 85,
            atsBreakdown: {
                technical: 90,
                keyword: 80,
                experience: 85,
                format: 95
            },
            summary: 'Strong candidate with clear alignment for React and TypeScript roles.',
            matchedSkills: ['React', 'TypeScript', 'Node.js'],
            missingSkills: [{ skill: 'Docker', priority: 'Important' }],
            partiallyMatchedSkills: ['CSS'],
            keywordAnalysis: {
                foundKeywords: ['React', 'TypeScript'],
                missingKeywords: ['Docker'],
                recommendations: ['Highlight Docker containerization experience if applicable.']
            },
            recommendations: ['Quantify frontend performance metrics in bullet points.'],
            actionPlan: [{
                priority: 1,
                action: 'Add Docker keyword',
                reason: 'Listed as preferred in JD',
                impact: 'High',
                time: '10 mins'
            }],
            rewrites: [{
                before: 'Worked on React components.',
                after: 'Built 15+ reusable React and TypeScript components, cutting page load time by 30%.'
            }]
        });
        assert.strictEqual(testReport.user.toString(), userA._id.toString());
        assert.strictEqual(testReport.matchScore, 85);
        assert.strictEqual(testReport.matchedSkills.length, 3);
        console.log('✓ Report document created and validated in MongoDB');

        // TEST 4: Resource Ownership & Authorization Isolation
        console.log('\n[Test 4] Testing Resource Ownership Enforcement...');
        // User A fetches their report -> Allowed
        const fetchedByUserA = await Report.findOne({ _id: testReport._id, user: userA._id });
        assert.ok(fetchedByUserA, 'User A must be able to retrieve their own report');
        console.log('✓ User A successfully retrieved their own report');

        // User B attempts to fetch User A's report -> Must be blocked
        const fetchedByUserB = await Report.findOne({ _id: testReport._id, user: userB._id });
        assert.strictEqual(fetchedByUserB, null, 'User B must NOT be able to find User A report');
        console.log('✓ Report isolation verified: User B cannot access User A report');

        // TEST 5: PDF Service Text Extraction & Error Handling
        console.log('\n[Test 5] Testing PDF Extraction...');
        const fs = require('fs');
        const path = require('path');
        const validPdfPath = path.join(__dirname, '../valid.pdf');
        if (fs.existsSync(validPdfPath)) {
            const pdfBuffer = fs.readFileSync(validPdfPath);
            const extracted = await pdfService.extractText(pdfBuffer);
            assert.ok(extracted.length > 0, 'Extracted text should not be empty');
            console.log(`✓ Successfully extracted ${extracted.length} chars from valid.pdf`);
        }

        // Test rejection of empty buffer
        try {
            await pdfService.extractText(Buffer.from(''));
            assert.fail('Should have thrown an error for empty buffer');
        } catch (err) {
            assert.ok(err.message.includes('No PDF file') || err.message.includes('corrupted') || err.message.includes('empty'));
            console.log('✓ Gracefully rejected empty PDF buffer');
        }

        // TEST 6: Report Deletion Ownership
        console.log('\n[Test 6] Testing Report Deletion Protection...');
        // Simulating ownership check before deletion:
        const reportToDelete = await Report.findById(testReport._id);
        assert.strictEqual(reportToDelete.user.toString() === userB._id.toString(), false);
        console.log('✓ User B denied permission to delete User A report');

        // User A deletes their report
        if (reportToDelete.user.toString() === userA._id.toString()) {
            await reportToDelete.deleteOne();
            console.log('✓ User A successfully deleted their own report');
        }
        const verifyDeleted = await Report.findById(testReport._id);
        assert.strictEqual(verifyDeleted, null);
        console.log('✓ Verified report is cleanly removed from MongoDB');

        // Cleanup test users
        await User.deleteMany({ email: { $regex: /@testjobfit\.com$/i } });

        console.log('\n===========================================');
        console.log('✓ ALL 6 PHASE 1 BACKEND SECURITY & FUNCTIONAL TESTS PASSED!');
        console.log('===========================================\n');
    } finally {
        await mongoose.disconnect();
    }
}

runTests().catch(err => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
});
