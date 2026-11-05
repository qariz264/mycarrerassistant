/**
 * Career Assistant KE - Official PDF Report Generator
 * Uses jsPDF to create a standalone, crisp, downloadable PDF document.
 * Works seamlessly across mobile devices, tablets, and sandboxed iframes.
 */

import { jsPDF } from 'jspdf';
import { StudentAssessment } from '../types';

export function generateCareerReportPDF(assessment: StudentAssessment) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const results = assessment.detailedResults;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // Primary Colors (Kenyan Navy & Sky Blue)
  const primaryNavy = [11, 25, 44] as const;
  const accentSky = [2, 132, 199] as const;
  const textDark = [15, 23, 42] as const;
  const textMuted = [100, 116, 139] as const;
  const borderGrey = [226, 232, 240] as const;

  // Helper: check page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 16;
      drawHeaderSmall();
    }
  };

  const drawHeaderSmall = () => {
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('Career Assistant KE — Official KCSE Career Guidance Report', margin, y);
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 8;
  };

  // ----------------------------------------------------
  // TOP BRANDING HEADER
  // ----------------------------------------------------
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('CAREER ASSISTANT KE', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(186, 230, 253);
  doc.text('Official Personalized KCSE Career & KUCCPS Guidance Report', margin + 6, y + 16);

  // Reference & Date on right side
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Ref: ${assessment.id || 'CAKE'}`, pageWidth - margin - 6, y + 8, { align: 'right' });
  const dateFormatted = new Date(assessment.createdAt || Date.now()).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Issued: ${dateFormatted}`, pageWidth - margin - 6, y + 14, { align: 'right' });
  doc.setTextColor(52, 211, 153);
  doc.text('Verified Complete Report', pageWidth - margin - 6, y + 20, { align: 'right' });

  y += 28;

  // ----------------------------------------------------
  // CANDIDATE PROFILE SUMMARY BOX
  // ----------------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.rect(margin, y, contentWidth, 26, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Candidate: ${assessment.studentName || 'Student'}`, margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`KCSE Year: ${assessment.kcseYear || 2024}`, margin + 6, y + 12);

  // 3 Metric columns
  const colWidth = (contentWidth - 12) / 3;

  // Col 1: Mean Grade
  doc.setFillColor(255, 255, 255);
  doc.rect(margin + 6, y + 14, colWidth - 4, 9, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text(`Mean Grade: ${assessment.meanGrade || 'E'}`, margin + 9, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`(${assessment.totalAggregate || 0}/84 pts)`, margin + colWidth - 8, y + 20, { align: 'right' });

  // Col 2: Estimated Cluster Points
  doc.rect(margin + 6 + colWidth, y + 14, colWidth - 4, 9, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentSky[0], accentSky[1], accentSky[2]);
  const estCluster = assessment.studentEstimatedClusterPoints !== undefined 
    ? assessment.studentEstimatedClusterPoints.toFixed(3) 
    : 'N/A';
  doc.text(`Cluster Points: ${estCluster}`, margin + 9 + colWidth, y + 20);

  // Col 3: Target Course
  doc.rect(margin + 6 + colWidth * 2, y + 14, colWidth - 4, 9, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const intended = assessment.intendedCourse || 'Open';
  const courseShort = intended.length > 22 ? intended.substring(0, 20) + '...' : intended;
  doc.text(`Target: ${courseShort}`, margin + 9 + colWidth * 2, y + 20);

  y += 31;

  // ----------------------------------------------------
  // SECTION 1: INTENDED COURSE EVALUATION
  // ----------------------------------------------------
  checkPageBreak(30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(accentSky[0], accentSky[1], accentSky[2]);
  doc.text('1. INTENDED COURSE ANALYSIS', margin, y);
  y += 4;

  if (results && results.intendedCourseAnalysis) {
    const analysis = results.intendedCourseAnalysis;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const statusLabel = analysis.status === 'STRONG_MATCH'
      ? 'Meets Published Prerequisites'
      : analysis.status === 'ELIGIBLE_ALTERNATIVE_SUGGESTED'
        ? 'Prerequisites Missing — TVET Bridge Recommended'
        : 'Open Exploration';
    doc.text(`Status: ${statusLabel} — ${analysis.courseName || ''}`, margin + 3, y + 4.5);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const note = analysis.recommendationNote || '';
    const noteLines = doc.splitTextToSize(note, contentWidth - 4);
    doc.text(noteLines, margin + 2, y);
    y += noteLines.length * 3.8 + 2;

    if (analysis.missingRequirements && analysis.missingRequirements.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(220, 38, 38);
      doc.text('Missing Prerequisites:', margin + 2, y);
      y += 3.5;
      doc.setFont('helvetica', 'normal');
      for (const req of analysis.missingRequirements) {
        doc.text(`• ${req}`, margin + 4, y);
        y += 3.2;
      }
      y += 2;
    }
  }

  y += 4;

  // ----------------------------------------------------
  // SECTION 2: AI COUNSELOR GUIDANCE
  // ----------------------------------------------------
  if (results?.aiCounselorGuidance) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(accentSky[0], accentSky[1], accentSky[2]);
    doc.text('2. STRATEGIC COUNSELOR ADVISORY', margin, y);
    y += 4;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(186, 230, 253);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(51, 65, 85);

    const guidanceLines = doc.splitTextToSize(results.aiCounselorGuidance, contentWidth - 8);
    const boxHeight = guidanceLines.length * 3.6 + 6;
    doc.rect(margin, y, contentWidth, boxHeight, 'FD');
    doc.text(guidanceLines, margin + 4, y + 4.5);
    y += boxHeight + 6;
  }

  // ----------------------------------------------------
  // SECTION 3: TOP RECOMMENDED PROGRAMMES
  // ----------------------------------------------------
  checkPageBreak(50);

  const allEligibleDegrees = results?.eligibleProgrammes?.filter(p => p.level === 'Degree') || [];
  const progsToDisplay = allEligibleDegrees.length > 0 ? allEligibleDegrees : (results?.eligibleProgrammes || results?.topRecommendations || []);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(accentSky[0], accentSky[1], accentSky[2]);
  const sectionTitle = allEligibleDegrees.length > 0 
    ? `3. ALL QUALIFYING DEGREE PROGRAMMES (${allEligibleDegrees.length} QUALIFYING)`
    : `3. ALL QUALIFYING PROGRAMMES (${progsToDisplay.length} COURSES QUALIFIED)`;
  doc.text(sectionTitle, margin, y);
  y += 5;

  if (progsToDisplay.length > 0) {
    // Table Header
    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Code', margin + 3, y + 4.8);
    doc.text('Programme Name', margin + 22, y + 4.8);
    doc.text('Level', margin + 98, y + 4.8);
    doc.text('Est. Cluster / Min Grade', margin + 118, y + 4.8);
    doc.text('Historical Status', margin + 152, y + 4.8);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    progsToDisplay.forEach((p, idx) => {
      checkPageBreak(12);

      // Alternating row background
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 9.5, 'F');
      }

      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(p.programmeCode || '', margin + 3, y + 4.5);
      
      const progName = p.programmeName || '';
      const progNameTrunc = progName.length > 40 ? progName.substring(0, 38) + '...' : progName;
      doc.text(progNameTrunc, margin + 22, y + 4.5);
      
      doc.text(p.level || '', margin + 98, y + 4.5);
      
      doc.setFont('helvetica', 'bold');
      if (p.level === 'Degree' && p.studentEstimatedClusterPoints !== undefined) {
        doc.setTextColor(accentSky[0], accentSky[1], accentSky[2]);
        doc.text(`${p.studentEstimatedClusterPoints.toFixed(3)} pts`, margin + 118, y + 4.5);
      } else {
        doc.setTextColor(5, 150, 105); // Emerald
        doc.text(`Min: ${p.programmeMinimumMeanGrade || 'C-'}`, margin + 118, y + 4.5);
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      let statusTrunc = 'Eligible';
      if (p.level === 'Degree') {
        statusTrunc = p.cutoffComparison === 'ABOVE_CUTOFF' ? 'Above 2024 Cut-Off' :
          p.cutoffComparison === 'WITHIN_RANGE' ? 'Within Range' :
          p.cutoffComparison === 'BELOW_CUTOFF' ? 'Below Cut-Off' : 'Data Pending';
      } else {
        statusTrunc = 'TVET (No Cluster)';
      }
      doc.text(statusTrunc, margin + 152, y + 4.5);

      // Subtitle with cluster group or subject prerequisites
      doc.setFontSize(6.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const reason = p.recommendedReason || '';
      const reasonTrunc = reason.length > 95 ? reason.substring(0, 92) + '...' : reason;
      doc.text(reasonTrunc, margin + 22, y + 8);
      doc.setFontSize(7.5);

      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.line(margin, y + 9.5, pageWidth - margin, y + 9.5);
      y += 10;
    });
  }

  y += 4;

  // ----------------------------------------------------
  // SECTION 4: STEPPING STONE ALTERNATIVES
  // ----------------------------------------------------
  const alts = results?.alternativePathways || [];
  if (alts.length > 0) {
    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(accentSky[0], accentSky[1], accentSky[2]);
    doc.text('4. ALTERNATIVE TVET & DIPLOMA BRIDGES', margin, y);
    y += 5;

    alts.forEach((a) => {
      checkPageBreak(12);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(4, 120, 87);
      doc.text(`${a.level} Pathway: ${a.programmeName}`, margin + 3, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const reasonLines = doc.splitTextToSize(a.reason || '', contentWidth - 6);
      doc.text(reasonLines, margin + 3, y + 7.5);

      y += 12;
    });
  }

  // ----------------------------------------------------
  // APPLICATION ASSISTANCE CALLOUT
  // ----------------------------------------------------
  checkPageBreak(16);
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(134, 239, 172);
  doc.rect(margin, y, contentWidth, 10, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  doc.text("If you'll need any assistance with applying any school text/call 0117334197", margin + 4, y + 6.2);
  y += 14;

  // ----------------------------------------------------
  // DISCLAIMER FOOTER
  // ----------------------------------------------------
  checkPageBreak(25);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.rect(margin, y, contentWidth, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('Important KUCCPS Information & Placement Disclaimer:', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  const disclaimerText = 
    'Career Assistant KE is an independent advisory platform and is not KUCCPS. Programme requirements and historical cut-offs reflect the published 2024/2025 placement cycle. Always confirm current requirements through the official KUCCPS student portal before submitting final application choices.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 8);
  doc.text(disclaimerLines, margin + 4, y + 8.5);

  // ----------------------------------------------------
  // RUNNING REPORT FOOTER (On every page)
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text("If you'll need any assistance with applying any school text/call 0117334197", margin, pageHeight - 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6.5, { align: 'right' });
  }

  // Robust Blob Trigger for guaranteed download across browsers and iframes
  try {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    const cleanName = (assessment.studentName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Career_Assistant_KE_Report_${cleanName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
  } catch (downloadErr) {
    console.error('Blob download failed, trying doc.save fallback:', downloadErr);
    const cleanName = (assessment.studentName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Career_Assistant_KE_Report_${cleanName}.pdf`);
  }
}
