import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateATSReportPDF = (result, candidateName = "Candidate") => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = 20;

  // Colors
  const primaryColor = [79, 70, 229]; // Indigo-600
  const successColor = [16, 185, 129]; // Emerald-500
  const dangerColor = [244, 63, 94]; // Rose-500
  const warningColor = [245, 158, 11]; // Amber-500
  const grayDark = [55, 65, 81];
  const grayLight = [156, 163, 175];
  
  // Helper to add a new page if needed
  const checkPageBreak = (neededHeight) => {
    if (yPos + neededHeight > pageHeight - margin) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Helper for Section Headers
  const addSectionHeader = (title, iconText = "") => {
    checkPageBreak(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    if (iconText) {
       doc.text(`${iconText} ${title}`, margin, yPos);
    } else {
       doc.text(title, margin, yPos);
    }
    yPos += 2;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
  };

  // Helper for normal text wrapping
  const addWrappedText = (text, fontSize = 11, fontStyle = "normal", color = grayDark) => {
    if (!text) return;
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
    const textHeight = splitText.length * (fontSize * 0.4);
    checkPageBreak(textHeight + 5);
    doc.text(splitText, margin, yPos);
    yPos += textHeight + 5;
  };

  // 1. HEADER
  doc.setFillColor(15, 23, 42); // Deep Navy
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("RoleFit AI | Career & Resume Intelligence", margin, 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(186, 230, 253); // Subtle Sky Blue
  doc.text("Understand Your Fit. Bridge Your Skill Gaps. Get Job-Ready.", margin, 21);
  yPos = 38;

  const {
    matchScore = 0, summary = "", eligibility = { status: "Unknown", checks: [] },
    atsBreakdown = { format: 0, technical: 0, projects: 0, education: 0, keyword: 0, softSkills: 0 },
    skillsMatch = [], missingSkills = [],
    actionPlan = [], scorePrediction = { current: 0, afterResume: 0, afterSkills: 0 },
    rewrites = [], verdict = { interviewChance: 0, opinion: "" },
    applyDecision = { decision: "UNKNOWN", reason: "" }, nextSteps = [],
    resumeHighlights = [], keywordDensity = [], recruiterReview = { strengths: [], weaknesses: [], finalRecommendation: "" },
    interviewPrep = [], learningResources = [], companyFit = { best: [], average: [], needsImprovement: [], explanation: "" },
    timeline = [], careerSummary = { readiness: 0, suitableRoles: [], salaryRange: "", overallRecommendation: "" }
  } = result || {};

  // 2. CANDIDATE INFORMATION
  addSectionHeader("Candidate Information");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...grayDark);
  doc.text(`Candidate Name: ${candidateName}`, margin, yPos);
  yPos += 6;
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 10;

  // 3. JOB DESCRIPTION SUMMARY & RECRUITER OPINION
  addSectionHeader("Job Description Summary");
  addWrappedText(summary || verdict.opinion || "N/A");

  // 4. OVERALL COMPATIBILITY SCORE & 5. RECRUITER VERDICT & 6. SHOULD I APPLY?
  checkPageBreak(30);
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, yPos, pageWidth - margin * 2, 35, 'F');
  
  // Score
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...grayDark);
  doc.text("RoleFit Match Score:", margin + 5, yPos + 10);
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text(`${matchScore}/100`, margin + 5, yPos + 20);

  // Interview Chance
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...grayDark);
  doc.text("Interview Chance:", margin + 60, yPos + 10);
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text(`${verdict.interviewChance}%`, margin + 60, yPos + 20);

  // Should I Apply
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...grayDark);
  doc.text("Should I Apply?", margin + 120, yPos + 10);
  
  let applyColor = primaryColor;
  if (applyDecision.decision === 'YES') applyColor = successColor;
  if (applyDecision.decision === 'NO') applyColor = dangerColor;
  if (applyDecision.decision.includes('UPDATE')) applyColor = warningColor;
  
  doc.setFontSize(12);
  doc.setTextColor(...applyColor);
  doc.text(applyDecision.decision, margin + 120, yPos + 20);
  yPos += 45;

  // Apply Reason
  addWrappedText(`Reason: ${applyDecision.reason}`, 10, "italic", grayDark);

  // 7. ELIGIBILITY CHECK
  if (eligibility.checks && eligibility.checks.length > 0) {
    addSectionHeader("Eligibility Check");
    doc.setFont("helvetica", "bold");
    let eColor = primaryColor;
    if (eligibility.status === 'Eligible') eColor = successColor;
    if (eligibility.status === 'Not Eligible') eColor = dangerColor;
    
    doc.setTextColor(...eColor);
    doc.text(`Status: ${eligibility.status}`, margin, yPos);
    yPos += 6;

    const eligibilityBody = eligibility.checks.map(c => [c.requirement, c.status ? "Yes" : "No"]);
    autoTable(doc, {
      startY: yPos,
      margin: { left: margin },
      head: [['Requirement', 'Met']],
      body: eligibilityBody,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      columnStyles: { 1: { halign: 'center' } },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 1) {
          if (data.cell.raw === "Yes") {
            data.cell.styles.textColor = successColor;
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = dangerColor;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // 8. ATS SCORE BREAKDOWN
  addSectionHeader("ATS Score Breakdown");
  const renderProgressBar = (label, score, y) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...grayDark);
    doc.text(label, margin, y);
    doc.text(`${score}%`, margin + 50, y);
    
    // Background bar
    doc.setFillColor(229, 231, 235);
    doc.rect(margin + 65, y - 3, 100, 4, 'F');
    // Foreground bar
    let barColor = primaryColor;
    if (score < 50) barColor = dangerColor;
    else if (score < 75) barColor = warningColor;
    else barColor = successColor;
    
    doc.setFillColor(...barColor);
    doc.rect(margin + 65, y - 3, score, 4, 'F');
  };

  const breakdownKeys = [
    { label: "Resume Formatting", val: atsBreakdown.format },
    { label: "Technical Skills", val: atsBreakdown.technical },
    { label: "Projects", val: atsBreakdown.projects },
    { label: "Education", val: atsBreakdown.education },
    { label: "Keyword Match", val: atsBreakdown.keyword },
    { label: "Soft Skills", val: atsBreakdown.softSkills }
  ];

  breakdownKeys.forEach((item, idx) => {
    checkPageBreak(10);
    renderProgressBar(item.label, item.val || 0, yPos);
    yPos += 8;
  });
  yPos += 5;

  // 9. REQUIREMENTS MATCH
  if (skillsMatch && skillsMatch.length > 0) {
    addSectionHeader("Requirements Match");
    const skillsBody = skillsMatch.map(s => [s.skill, s.status ? "Matched" : "Missing"]);
    autoTable(doc, {
      startY: yPos,
      margin: { left: margin },
      head: [['Skill / Requirement', 'Status']],
      body: skillsBody,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 1) {
          if (data.cell.raw === "Matched") {
            data.cell.styles.textColor = successColor;
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = dangerColor;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // 10. MISSING SKILLS PRIORITY & LEARNING RESOURCES
  if (learningResources && learningResources.length > 0) {
    addSectionHeader("Missing Skills Priority & Resources");
    learningResources.forEach(lr => {
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...grayDark);
      doc.text(`${lr.skill} (Est. Time: ${lr.estimatedTime || "N/A"})`, margin, yPos);
      yPos += 5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      lr.resources?.forEach(res => {
        const splitRes = doc.splitTextToSize(`• ${res}`, pageWidth - margin * 2 - 5);
        checkPageBreak(splitRes.length * 4 + 2);
        doc.text(splitRes, margin + 5, yPos);
        yPos += splitRes.length * 4 + 1;
      });
      yPos += 5;
    });
  }

  // 11. RESUME STRENGTH
  addSectionHeader("Resume Strength (Recruiter Review)");
  checkPageBreak(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...successColor);
  doc.text("Strengths", margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...grayDark);
  (recruiterReview.strengths || []).forEach(s => {
    addWrappedText(`• ${s}`, 10, "normal", grayDark);
  });

  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...dangerColor);
  doc.text("Weaknesses", margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...grayDark);
  (recruiterReview.weaknesses || []).forEach(w => {
    addWrappedText(`• ${w}`, 10, "normal", grayDark);
  });

  checkPageBreak(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text("Final Recommendation:", margin, yPos);
  yPos += 6;
  addWrappedText(recruiterReview.finalRecommendation || "N/A", 10, "italic", grayDark);

  // 12. SMART AI ACTION PLAN
  if (actionPlan && actionPlan.length > 0) {
    addSectionHeader("Smart AI Action Plan");
    const actionBody = actionPlan.map(ap => [
      ap.priority || "Normal",
      ap.action,
      ap.reason || "-",
      ap.expectedImpact ? `+${ap.expectedImpact}` : "-",
      ap.estimatedTime || "-"
    ]);
    autoTable(doc, {
      startY: yPos,
      margin: { left: margin },
      head: [['Priority', 'Action', 'Reason', 'Score Impact', 'Est. Time']],
      body: actionBody,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      columnStyles: { 
        0: { cellWidth: 20 },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 0) {
          if (data.cell.raw === "High" || data.cell.raw === "Critical") {
            data.cell.styles.textColor = dangerColor;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // 13. SCORE PREDICTION
  addSectionHeader("Score Prediction");
  checkPageBreak(25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...grayDark);
  
  doc.text(`Current Score: ${scorePrediction.current || matchScore}`, margin, yPos);
  yPos += 7;
  doc.text(`After Resume Updates: ${scorePrediction.afterResume || "-"}`, margin, yPos);
  yPos += 7;
  doc.text(`After Skills Updates: ${scorePrediction.afterSkills || "-"}`, margin, yPos);
  yPos += 10;

  // 14. AI RESUME REWRITE
  if (rewrites && rewrites.length > 0) {
    addSectionHeader("AI Resume Rewrite Suggestions");
    rewrites.forEach(rw => {
      checkPageBreak(35);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...grayDark);
      doc.text(`Section: ${rw.section || "General"}`, margin, yPos);
      yPos += 6;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...dangerColor);
      doc.text("BEFORE:", margin, yPos);
      yPos += 5;
      addWrappedText(rw.before, 10, "normal", grayDark);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...successColor);
      doc.text("AFTER:", margin, yPos);
      yPos += 5;
      addWrappedText(rw.after, 10, "normal", grayDark);
      yPos += 5;
    });
  }

  // 15. NEXT STEPS CHECKLIST
  if (nextSteps && nextSteps.length > 0) {
    addSectionHeader("Next Steps Checklist");
    nextSteps.forEach((ns, i) => {
      addWrappedText(`[ ] ${ns}`, 11, "normal", grayDark);
    });
  }

  // 16. AI INTERVIEW QUESTIONS
  if (interviewPrep && interviewPrep.length > 0) {
    addSectionHeader("AI Interview Questions");
    const prepBody = interviewPrep.map(q => [q.category, q.difficulty, q.question]);
    autoTable(doc, {
      startY: yPos,
      margin: { left: margin },
      head: [['Category', 'Difficulty', 'Question']],
      body: prepBody,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      columnStyles: { 
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 125 }
      }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  // 17. FINAL AI CAREER SUMMARY
  addSectionHeader("Final AI Career Summary");
  checkPageBreak(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...grayDark);
  doc.text(`Readiness: ${careerSummary.readiness || 0}%`, margin, yPos);
  yPos += 6;
  doc.text(`Expected Salary Range: ${careerSummary.salaryRange || "N/A"}`, margin, yPos);
  yPos += 6;
  
  const roles = careerSummary.suitableRoles?.join(", ") || "N/A";
  addWrappedText(`Suitable Roles: ${roles}`, 11, "bold", grayDark);
  
  doc.setFont("helvetica", "bold");
  doc.text("Overall Recommendation:", margin, yPos);
  yPos += 6;
  addWrappedText(careerSummary.overallRecommendation || "N/A", 11, "normal", grayDark);

  // Footer / Page Numbers
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8.5);
  doc.setTextColor(130);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
    doc.text("Generated by RoleFit AI — AI-Powered Career & Resume Intelligence Platform", margin, pageHeight - 10);
  }

  const finalFileName = `RoleFit_AI_Report_${candidateName.replace(/\s+/g, '_')}.pdf`;
  doc.save(finalFileName);
};
