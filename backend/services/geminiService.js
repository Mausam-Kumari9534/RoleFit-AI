const { GoogleGenAI } = require('@google/genai');

// Initialize the Gemini client
// Assumes GEMINI_API_KEY is set in environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Model fallback chain: Try verified active models first
const MODELS_TO_TRY = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest'
];

const executeGemini = async (prompt, isJson = true) => {
    let primaryError = null;

    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`[Gemini] Attempting analysis with model: ${modelName}`);
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
            });

            let text = response.text || '';
            
            if (isJson) {
                // Strip markdown code fences if present
                let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                // Find first '{' and last '}' to handle any conversational text
                const firstBrace = clean.indexOf('{');
                const lastBrace = clean.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1) {
                    clean = clean.substring(firstBrace, lastBrace + 1);
                }
                return JSON.parse(clean);
            }
            return text;
            
        } catch (error) {
            const status = error.status || (error.response && error.response.status) || 500;
            console.error(`[Gemini] Model ${modelName} failed with status ${status}:`, error.message);
            
            if (status === 401) {
                primaryError = error;
                break;
            }
            
            if (!primaryError || status === 429 || status === 503 || status === 500) {
                primaryError = error;
            }
        }
    }

    let errorMessage = "An unexpected error occurred during AI generation.";
    const status = primaryError?.status || (primaryError?.response && primaryError?.response?.status);
    const msg = primaryError?.message || "";

    if (status === 401 || msg.includes('401') || msg.toLowerCase().includes('api key')) {
        errorMessage = "AI is unavailable because the configured Gemini API key is invalid or missing.";
    } else if (status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota')) {
        errorMessage = "AI is temporarily unavailable because the API quota has been exceeded.";
    } else if (status === 404 || msg.includes('404')) {
        errorMessage = "The requested AI models are not available for this account.";
    } else if (status === 503 || msg.includes('503') || msg.toLowerCase().includes('high demand')) {
        errorMessage = "AI is temporarily unavailable due to high API demand.";
    }

    const err = new Error(errorMessage);
    err.status = status || 500;
    throw err;
};

exports.analyze = async (resumeText, jobDescription) => {
    const prompt = `
You are an expert AI recruiter and career assistant for students.
Compare the following Resume Text with the Job Description.

Return ONLY a valid JSON object matching exactly this structure (no markdown, no explanations, no code blocks around it, just raw JSON):
{
  "matchScore": number (0-100),
  "matchingSkills": [ "skill1", "skill2" ],
  "missingKeywords": [ "keyword1", "keyword2" ],
  "summary": "Short 1-2 sentence summary of compatibility",
  "suggestions": [ "suggestion1", "suggestion2" ],
  "eligibility": {
    "status": "Eligible" | "Partially Eligible" | "Not Eligible",
    "checks": [ { "requirement": "e.g., Degree Eligible", "status": true | false } ]
  },
  "atsBreakdown": {
    "format": number, "technical": number, "projects": number, "education": number, "keyword": number, "softSkills": number
  },
  "skillsMatch": [
    { "skill": "string", "status": true | false }
  ],
  "missingSkills": [
    { "skill": "string", "priority": "Critical" | "Important" | "Optional" }
  ],
  "actionPlan": [
    { "priority": number, "action": "string", "reason": "string", "impact": "string", "time": "string" }
  ],
  "scorePrediction": {
    "current": number, "afterResume": number, "afterSkills": number
  },
  "rewrites": [
    { "before": "string", "after": "string" }
  ],
  "verdict": {
    "interviewChance": number, "opinion": "string"
  },
  "applyDecision": {
    "decision": "YES" | "APPLY AFTER UPDATING RESUME" | "NO",
    "reason": "string"
  },
  "nextSteps": [ "string" ],
  "resumeHighlights": [
    { "section": "string", "feedback": "string", "status": "Green" | "Yellow" | "Red" }
  ],
  "keywordDensity": [
    { "keyword": "string", "mentions": number, "status": true | false }
  ],
  "recruiterReview": {
    "strengths": [ "string" ], "weaknesses": [ "string" ], "finalRecommendation": "string"
  },
  "interviewPrep": [
    { "category": "Technical" | "HR" | "Project" | "Coding", "question": "string", "difficulty": "Easy" | "Medium" | "Hard" }
  ],
  "learningResources": [
    { "skill": "string", "resources": ["string", "string"], "estimatedTime": "string" }
  ],
  "companyFit": {
    "best": ["string"], "average": ["string"], "needsImprovement": ["string"], "explanation": "string"
  },
  "timeline": [
    { "step": "string", "duration": "string" }
  ],
  "careerSummary": {
    "readiness": number, "suitableRoles": ["string"], "salaryRange": "string", "overallRecommendation": "string"
  }
}

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;
    return executeGemini(prompt, true);
};

exports.optimizeResume = async (resumeText, jobDescription) => {
    const prompt = `
You are an expert AI resume writer.
Analyze the original RESUME TEXT and the target JOB DESCRIPTION.
Provide optimized bullet points for experience, projects, and a new summary that perfectly aligns with the job description.

RULES:
- Do NOT invent qualifications, skills, experience, projects, marks, certifications, internships, or achievements not present in the original resume.
- Only rewrite, reorganize, improve wording, and improve ATS keywords where truthful.
- Return ONLY a valid JSON object matching exactly this structure (no markdown):
{
  "summary": { "before": "string", "after": "string" },
  "experience": [
    { "role": "string", "company": "string", "bullets": [ { "before": "string", "after": "string" } ] }
  ],
  "projects": [
    { "name": "string", "bullets": [ { "before": "string", "after": "string" } ] }
  ],
  "skills": { "before": "string", "after": "string" }
}

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;
    return executeGemini(prompt, true);
};

exports.generateCoverLetter = async (resumeText, jobDescription) => {
    const prompt = `
You are an expert career counselor. 
Based on the following RESUME TEXT and JOB DESCRIPTION, generate a professional, personalized cover letter.
Structure it with:
- Dear Hiring Manager,
- Introduction
- Relevant technical skills
- Relevant projects/experience
- Why the candidate fits this role
- Closing

RULES:
- Do NOT generate fake experience. If information is missing, use placeholders like [Your Phone Number] or adapt gracefully.
- Do NOT return JSON. Return the raw cover letter text.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;
    return executeGemini(prompt, false);
};

exports.generateInterviewQuestions = async (resumeText, jobDescription) => {
    const prompt = `
You are an expert technical interviewer.
Generate 10-15 interview questions specifically tailored to the provided RESUME TEXT and JOB DESCRIPTION.

Divide the questions strictly into these 4 categories: "Technical", "HR", "Project", "Coding".

For each question, provide:
- The question text
- Difficulty (Easy, Medium, Hard)
- Why this question is relevant to the candidate's resume/JD
- A suggested answer approach for the candidate

Return ONLY a valid JSON object matching exactly this structure (no markdown):
{
  "questions": [
    {
      "category": "Technical",
      "question": "string",
      "difficulty": "Easy",
      "why": "string",
      "suggestedAnswer": "string"
    }
  ]
}

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;
    return executeGemini(prompt, true);
};
