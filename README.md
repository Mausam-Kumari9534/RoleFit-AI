# JobFit AI — AI-Powered Resume & Job Matching Platform (Phase 1)

JobFit AI is a recruiter-ready full-stack web application designed for students and job seekers. It compares resumes with real job postings, evaluates compatibility using a documented 4-pillar methodology, identifies skill gaps, and provides actionable, grounded recommendations to help candidates pass Applicant Tracking Systems (ATS) and land interviews.

---

## 1. Problem Statement

Job seekers face critical barriers in modern hiring:
1. **The ATS Filter Barrier**: Over 70% of qualified resumes are filtered out automatically by Applicant Tracking Systems due to missing industry keywords or unparseable formats.
2. **Generic Applications**: Submitting a single standardized resume to multiple job descriptions results in low alignment and silent rejections.
3. **Subjective Self-Assessment**: Candidates struggle to pinpoint exactly which required skills or technologies they lack for a specific position.
4. **Lack of Actionable Feedback**: Automated rejection emails offer zero constructive guidance on how to strengthen an application.

JobFit AI solves these challenges by providing an instant, objective, and privacy-conscious compatibility analysis tailored to each specific job opportunity.

---

## 2. Implemented Features (Phase 1)

### Google-Only Verified Authentication
- Fast, secure, passwordless authentication using Google Identity Services (GIS).
- Backend verification of Google ID tokens via `google-auth-library`.
- Dedicated, full-screen `/login` and `/signup` pages with JobFit AI brand styling.
- Secure session management with short-lived JWT access tokens (15m) and `HttpOnly`, `SameSite` refresh cookies (7d).
- Explicitly excluded: No email/password forms, no OTP flows, and no password-recovery complexity.

### Resume & Job Description Ingestion
- Ephemeral PDF text extraction using `pdf-parse` in server memory.
- File validation (PDF format only, maximum 5MB size limit).
- Graceful handling of empty, corrupt, scanned, or password-protected PDFs with user-friendly errors.
- Target job description validation (50 to 15,000 characters).

### AI Semantic Compatibility Analysis
- Powered by **Google Gemini AI** (`gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-flash-latest`).
- **Documented 4-Pillar Scoring Methodology**:
  $$\text{Match Score} = (0.40 \times \text{Technical}) + (0.30 \times \text{Keywords}) + (0.20 \times \text{Experience}) + (0.10 \times \text{Format})$$
- Prominent advisory disclaimer clearly stating that scores are compatibility estimates, not employer ATS rankings or hiring guarantees.
- **Skills Analysis**: Categorization into Matched Skills, Missing Required Skills (prioritized by Critical, Important, Optional), and Partially Demonstrated Skills.
- **ATS Keyword Analysis**: Identification of keywords present vs. missing from the job spec, with contextual placement recommendations.
- **Actionable AI Bullet Rewrites**: Side-by-side Before/After bullet point enhancements grounded strictly in the candidate's actual qualifications.

### User Workspace & Report Management
- Personalized `/dashboard` displaying candidate welcome message and real summary metrics.
- MongoDB persistence for reports strictly associated with the authenticated user.
- Resource ownership verification on all report endpoints (`/api/reports/:id`) preventing cross-user data leakage.
- Print / Save PDF summary report generation.
- Complete deletion capability for previously saved reports.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v7 |
| **Backend** | Node.js (v20+), Express.js (v5), Multer, express-rate-limit, cookie-parser |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | Google Identity Services, `google-auth-library`, JSON Web Tokens (JWT) |
| **AI Integration** | `@google/genai` (Google Gemini 3.5 Flash) |
| **Document Processing** | `pdf-parse` (Uint8Array buffer parsing) |

---

## 4. Design System & Brand Palette

The user interface follows a clean, professional SaaS aesthetic built on white surfaces over light sky backgrounds:

- **Sky Background**: `#F0F9FF` (`brand-bg`)
- **White Surface**: `#FFFFFF` (`brand-surface`)
- **Sky Accent / Border**: `#BAE6FD` (`brand-sky`)
- **Primary Blue Action**: `#0284C7` (`brand-primary`)
- **Primary Text**: `#0F172A`
- **Secondary Text**: `#475569`
- **Borders & Dividers**: `#E2E8F0`
- **Typography**: Inter sans-serif

---

## 5. Application Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)              │
│  /           Landing Page (Hero, Features, FAQ)        │
│  /login      Google-only Sign In                       │
│  /signup     Google-only Sign Up                       │
│  /dashboard  Workspace & Saved Reports                 │
│  /analyze    PDF Upload & Job Description Form         │
│  /analysis/:id Detailed Compatibility Breakdown        │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼────────────────────────────┐
│                  Backend (Express.js)                  │
│  ├── Auth Routes (/api/auth)                           │
│  │   ├── POST /google  (Verify ID token via Google)    │
│  │   ├── GET /refresh-token (Issue new access token)   │
│  │   └── POST /logout (Clear refresh cookie)           │
│  └── API Routes (/api)                                 │
│      ├── POST /analyze-resume (Multer + Gemini + Save) │
│      ├── GET /reports (List user's reports)            │
│      ├── GET /reports/:id (Protected report fetch)     │
│      └── DELETE /reports/:id (Owner-only delete)       │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
┌─────────────▼──────────┐   ┌────────────▼──────────────┐
│  MongoDB Database      │   │  Google Gemini 3.5 Flash  │
│  - Users Collection    │   │  - Semantic alignment     │
│  - Reports Collection  │   │  - Structured JSON schema │
└────────────────────────┘   └───────────────────────────┘
```

---

## 6. Local Setup Instructions

### Prerequisites
- Node.js v20.x or higher
- MongoDB running locally or a MongoDB Atlas URI
- Google Cloud Console OAuth 2.0 Web Client ID
- Google Gemini API Key

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Mausam-Kumari9534/ai-compatibility-score.git
cd ai-compatibility-score

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend `.env` (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/matchai
JWT_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Frontend `.env` (`frontend/.env`)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 3. Google OAuth Configuration
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** with Application type **Web application**.
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173`
   - `http://localhost:5000`
4. Copy the Client ID into both `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).

### 4. Running the Application

```bash
# Terminal 1: Start Backend Server
cd backend
npm run dev # or: node server.js

# Terminal 2: Start Frontend Development Server
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 7. API Documentation

### Authentication Endpoints

#### `POST /api/auth/google`
Authenticates a user with a Google ID token. Creates a user record on first login.
- **Request Body**: `{ "credential": "<google_id_token>" }`
- **Response**:
```json
{
  "success": true,
  "token": "<jwt_access_token>",
  "user": {
    "_id": "67...",
    "fullName": "Sarah Candidate",
    "email": "sarah@gmail.com",
    "avatar": "https://...",
    "authProvider": "google"
  }
}
```

#### `GET /api/auth/refresh-token`
Issues a new short-lived access token using the `refreshToken` HttpOnly cookie.

#### `POST /api/auth/logout`
Clears the `refreshToken` cookie and invalidates the session.

---

### Resume Analysis Endpoints

#### `POST /api/analyze-resume`
Extracts text from an uploaded resume PDF, evaluates it against the job description with Gemini AI, and saves the report.
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body**:
  - `resume`: PDF file (max 5MB)
  - `jobDescription`: String (50 - 15,000 characters)
- **Response (201 Created)**:
```json
{
  "success": true,
  "reportId": "6acbad...",
  "report": {
    "_id": "6acbad...",
    "matchScore": 84,
    "jobTitle": "Frontend Engineer",
    "atsBreakdown": {
      "technical": 88,
      "keyword": 80,
      "experience": 85,
      "format": 95
    },
    "matchedSkills": ["React.js", "TypeScript", "Tailwind CSS"],
    "missingSkills": [
      { "skill": "Docker", "priority": "Critical" }
    ],
    "keywordAnalysis": {
      "foundKeywords": ["React", "TypeScript"],
      "missingKeywords": ["Docker", "CI/CD"],
      "recommendations": ["Incorporate containerization keywords..."]
    },
    "recommendations": ["Quantify component optimization wins..."],
    "rewrites": [
      {
        "before": "Developed front-end features.",
        "after": "Engineered 12+ reusable React components, speeding up page load by 25%."
      }
    ]
  }
}
```

#### `GET /api/reports`
Retrieves all saved reports belonging to the authenticated user.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "count": 2, "reports": [...] }`

#### `GET /api/reports/:id`
Retrieves a specific report by ID. Enforces strict ownership.
- **Headers**: `Authorization: Bearer <token>`
- **Errors**: `403 Forbidden` if the report belongs to another user, `404 Not Found` if missing.

#### `DELETE /api/reports/:id`
Deletes a specific report by ID. Enforces strict ownership.
- **Headers**: `Authorization: Bearer <token>`

---

## 8. Automated Testing

The project includes an automated test suite covering unit models, API authorization, PDF extraction, and live Gemini AI integration:

```bash
cd backend
npm test
```

### Test Suites:
1. `tests/test_phase1.js`: User model defaults, JWT tokens, Report creation, ownership isolation, PDF extraction, and report deletion.
2. `tests/test_http_endpoints.js`: Express HTTP integration, Google auth endpoint, 401 unauthenticated guard, report listing, cross-user 403 access prevention.
3. `tests/test_end_to_end_analysis.js`: End-to-end multipart PDF upload, live Gemini 3.5 Flash analysis, MongoDB report persistence, and retrieval.

---

## 9. Data Security & Application Hardening

1. **Ephemeral Resume Processing**: Uploaded PDF files are buffered in server RAM via Multer's `memoryStorage`. No raw resume files are saved to public web directories or cloud buckets.
2. **Strict Server-Side Ownership**: Every report is tied to `req.user._id`. Querying or mutating a report verifies `report.user.toString() === req.user._id.toString()`, preventing IDOR vulnerabilities.
3. **Google Credential Verification**: ID tokens are verified cryptographically using `OAuth2Client.verifyIdToken`. Client-provided identity is never trusted without signature verification.
4. **Rate Limiting**: AI endpoints are rate-limited (`express-rate-limit`) to prevent abuse and protect API quotas.
5. **Sanitized Error Responses**: Internal server error stacks and raw database errors are caught and masked with user-friendly messages.
6. **No Password Risks**: Phase 1 completely avoids storing, hashing, or resetting passwords by delegating authentication solely to Google.

---

## 10. Known Limitations & Next Phases

- **Supported Formats**: Phase 1 supports PDF documents with selectable text. Scanned images or password-protected PDFs are rejected gracefully with informative guidance.
- **Single Target Role Comparison**: Resumes are compared against one job description per submission.
- **AI Model Rate Quotas**: If Google Gemini API rate limits are exceeded, the system surfaces a friendly quota notice and prompts the candidate to retry in a moment.
