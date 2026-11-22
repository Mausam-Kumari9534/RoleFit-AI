# RoleFit AI

> **"Understand Your Fit. Bridge Your Skill Gaps. Get Job-Ready."**

**RoleFit AI** is an **AI-Powered Career & Resume Intelligence Platform** engineered to help candidates analyze their resumes against target job descriptions, uncover critical skill gaps, optimize ATS keyword coverage, and accelerate interview readiness.

---

## 🎯 Core Value Proposition

Most job applicants are filtered out before a human recruiter ever sees their profile. **RoleFit AI** levels the playing field by providing objective, recruiter-grade analysis and actionable improvement steps in seconds.

- **Match Score & 4-Pillar Breakdown**: Quantitative compatibility evaluated across Technical Skills (40%), ATS Keywords (30%), Experience Relevance (20%), and Format Readability (10%).
- **Skill Gap Diagnosis**: Identifies confirmed qualifications and flags high-priority missing technologies categorized by urgency (Critical, Important, Optional).
- **ATS Keyword Optimization**: Extracts high-frequency industry terminology missing from your resume to maximize screening success.
- **Actionable Bullet Rewrites**: Automatically suggests impactful, metric-driven bullet points using active verbs grounded strictly in your real background.
- **Career Preparation & Verdict**: Delivers interview probability estimates, tailored interview practice questions, and structured action checklists.
- **Executive PDF Export**: Generates clean, branded, recruiter-ready reports with full calculation methodology and candidate metrics.

---

## 🎨 Visual Identity & Brand System

RoleFit AI is designed with an executive, modern, and accessible visual language:

| Token | Color | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Deep Navy** | Slate 900 / Navy | `#0F172A` | Primary typography, dark headers, structural grounding |
| **Subtle Blue** | Sky / Royal Blue | `#0284C7` / `#2563EB` | Primary brand actions, match rings, links, badges |
| **Soft Violet** | Violet / Purple | `#7C3AED` / `#8B5CF6` | AI intelligence accents, gradient highlights, focus rings |
| **Pure White** | Clean White | `#FFFFFF` | Card surfaces, modals, crisp contrast backdrops |
| **Sky Tint** | Ultra Light Blue | `#F0F9FF` | Application background, subtle panel fills |

### Logo Mark Concept
The **RoleFit AI** emblem synthesizes:
1. **The Skill Pillar**: A vertical foundation bar symbolizing verified capabilities and core strength.
2. **The Intelligent Fit Loop**: An upper soft-violet arc representing the candidate-to-role semantic alignment cycle.
3. **The Career Trajectory Vector**: An ascending diagonal arrow forming the dynamic leg of the monogram **"R"**, symbolizing upward career mobility.
4. **The AI Precision Spark**: A 4-point spark at the apex reflecting algorithmic intelligence.

---

## 🏗️ Architecture & Technology Stack

RoleFit AI is built on the modern MERN stack with strict privacy-first constraints:

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Routing**: React Router v7
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) with custom brand extensions
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & `jspdf-autotable`
- **Authentication**: Google Identity Services (GSI) OAuth 2.0 with JWT management

### Backend
- **Runtime**: Node.js & [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/) (`@google/genai` SDK)
- **Document Parser**: `pdf-parse` (ephemeral buffer processing in RAM — no raw resume persistence)
- **Email Service**: [Resend](https://resend.com/) API integration
- **Security**: Strict CORS policy, HTTP-only refresh tokens, rate limiting, and resource-level authorization

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- MongoDB instance (local or MongoDB Atlas)
- Google Gemini API Key
- Google Cloud OAuth 2.0 Client ID

### 1. Clone & Setup Workspace
```bash
git clone https://github.com/RoleFit-AI/RoleFit-AI.git
cd RoleFit-AI
```

### 2. Backend Configuration
Navigate to `/backend` and configure your environment variables:
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/rolefit_ai
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=RoleFit AI <onboarding@resend.dev>
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Configuration
In another terminal, navigate to `/frontend`:
```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

Launch the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to explore RoleFit AI.

---

## 🔒 Privacy & Data Ethics

- **Ephemeral Processing**: Resumes are parsed exclusively in temporary memory buffers to extract raw text and are never written to permanent disk or publicly exposed bucket URLs.
- **Authentic Grounding**: RoleFit AI models are explicitly prohibited from fabricating fictional degrees, companies, or credentials.
- **Resource Ownership**: Saved analyses are strictly bound to authenticated user IDs with backend verification preventing unauthorized cross-user access.

---

## 📄 License & Attribution

RoleFit AI • Copyright © 2026 RoleFit AI. All rights reserved.