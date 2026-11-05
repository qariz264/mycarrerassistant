/**
 * Career Assistant KE - Recommendation Engine
 * Combines grades, subjects, hobbies, interests, and alternative pathways
 * 
 * Ensures strict separation between:
 * - Student estimated cluster points (Degree ONLY)
 * - Programme requirements (Minimum Mean Grade & Subjects)
 * - Institution historical cut-offs (2024/2025 published data)
 * - Comprehensive evaluation without artificial course limits
 */

import { Programme, StudentAssessment, ProgrammeEligibilityResult } from '../types';
import { GRADE_POINTS } from '../data/kcseSubjects';
import { evaluateProgrammeEligibility, analyzeIntendedCourse, StudentEvaluationInput } from './eligibilityEngine';
import { calculateKcseMeanGrade, calculateEstimatedClusterPoints } from './clusterCalculator';

export function runFullCareerAssessment(
  assessmentInput: {
    studentName: string;
    studentEmail?: string;
    studentPhone?: string;
    kcseYear: number;
    indexNumber?: string;
    subjects: { subject: string; grade: any }[];
    hobbies: string[];
    otherHobby?: string;
    intendedCourse: string;
  },
  programmes: Programme[]
): Omit<StudentAssessment, 'id' | 'paymentStatus' | 'createdAt' | 'updatedAt'> {
  // 1. Calculate KNEC Mean Grade (KNEC 7-subject criteria)
  const meanGradeResult = calculateKcseMeanGrade(assessmentInput.subjects);

  // 2. Base general cluster points (Student's overall estimated cluster baseline)
  const generalCluster = calculateEstimatedClusterPoints(
    assessmentInput.subjects,
    ['Mathematics', 'English or Kiswahili', 'Physics or Chemistry or Biology', 'Any 4th Subject'],
    meanGradeResult.totalAggregate
  );

  const evalInput: StudentEvaluationInput = {
    meanGrade: meanGradeResult.meanGrade,
    totalAggregate: meanGradeResult.totalAggregate,
    subjects: assessmentInput.subjects,
    hobbies: assessmentInput.hobbies.concat(assessmentInput.otherHobby ? [assessmentInput.otherHobby] : []),
    intendedCourse: assessmentInput.intendedCourse,
  };

  // 3. Evaluate Intended Course
  const intendedAnalysis = analyzeIntendedCourse(
    assessmentInput.intendedCourse,
    programmes,
    evalInput
  );

  // 4. Evaluate all active programmes comprehensively across all fields
  const activeProgrammes = programmes.filter(p => p.active);
  const allEvaluations: ProgrammeEligibilityResult[] = activeProgrammes.map(p => 
    evaluateProgrammeEligibility(p, evalInput)
  );

  // Separate all confirmed eligible programmes (all requirements met)
  const rawEligibleProgrammes = allEvaluations.filter(e => e.eligibilityStatus === 'ELIGIBLE');
  
  // Sort eligible programmes by personal match score
  rawEligibleProgrammes.sort((a, b) => b.matchScore - a.matchScore);

  // Partition into:
  // 1. Courses in the student's field / selected interests
  // 2. Other courses the student qualifies for
  const fieldMatchProgrammes = rawEligibleProgrammes.filter(p => p.isFieldMatch);
  const otherEligibleProgrammes = rawEligibleProgrammes.filter(p => !p.isFieldMatch);

  // Put courses in the student's field FIRST, followed by all other qualifying courses
  const eligibleProgrammes = [...fieldMatchProgrammes, ...otherEligibleProgrammes];

  // Distinct competitive vs aspirational subsets for degrees
  const competitiveProgrammes = eligibleProgrammes.filter(p => 
    p.level !== 'Degree' || p.cutoffComparison === 'ABOVE_CUTOFF' || p.cutoffComparison === 'WITHIN_RANGE'
  );
  const aspirationalProgrammes = eligibleProgrammes.filter(p => 
    p.level === 'Degree' && p.cutoffComparison === 'BELOW_CUTOFF'
  );

  // Featured personalized recommendations (prioritizing field matches)
  const topRecommendations = eligibleProgrammes.slice(0, 8);

  // 5. Generate Alternative Pathways (Crucial when student's intended degree wasn't met, or for TVET stepping stones)
  type DetailedResultsType = NonNullable<StudentAssessment['detailedResults']>;
  const alternativePathways: DetailedResultsType['alternativePathways'] = [];

  const diplomaOptions = allEvaluations.filter(e => e.level === 'Diploma' && e.eligibilityStatus === 'ELIGIBLE');
  const certOptions = allEvaluations.filter(e => (e.level === 'Certificate' || e.level === 'Artisan') && e.eligibilityStatus === 'ELIGIBLE');

  if (intendedAnalysis.status === 'ELIGIBLE_ALTERNATIVE_SUGGESTED') {
    const cat = intendedAnalysis.matchedProgramme?.category;
    const sameCatDip = diplomaOptions.find(d => d.category === cat);
    if (sameCatDip) {
      alternativePathways.push({
        category: sameCatDip.category,
        level: 'Diploma',
        programmeName: sameCatDip.programmeName,
        reason: `Direct stepping-stone: Complete this 2-year National Polytechnic Diploma and apply for credit transfer / direct progression to ${intendedAnalysis.matchedProgramme?.name}.`,
      });
    }
  }

  // Add high-value alternatives across fields
  for (const dip of diplomaOptions.slice(0, 3)) {
    if (!alternativePathways.some(a => a.programmeName === dip.programmeName)) {
      alternativePathways.push({
        category: dip.category,
        level: dip.level,
        programmeName: dip.programmeName,
        reason: `Practical vocational route with high industry demand and entry threshold matching your ${meanGradeResult.meanGrade} profile.`,
      });
    }
  }

  for (const cert of certOptions.slice(0, 3)) {
    if (!alternativePathways.some(a => a.programmeName === cert.programmeName)) {
      alternativePathways.push({
        category: cert.category,
        level: cert.level,
        programmeName: cert.programmeName,
        reason: `Competency-based technical certification enabling hands-on mastery and quick entry into technical enterprise or self-employment.`,
      });
    }
  }

  // 6. Map Institution Offerings
  const institutionOfferings: DetailedResultsType['institutionOfferings'] = [];
  for (const prog of eligibleProgrammes) {
    const rawProg = programmes.find(p => p.id === prog.programmeId);
    if (!rawProg) continue;

    const isDegree = prog.level === 'Degree';

    for (const inst of rawProg.institutions) {
      const historicalCutoff = isDegree && inst.historicalCutoffs ? inst.historicalCutoffs['2024/2025'] : undefined;
      const admissionYear = isDegree && historicalCutoff ? '2024/2025' : undefined;

      let statusText = `Placement based on KCSE Mean Grade (${prog.programmeMinimumMeanGrade})`;
      if (isDegree && historicalCutoff && prog.studentEstimatedClusterPoints !== undefined) {
        const margin = Number((prog.studentEstimatedClusterPoints - historicalCutoff).toFixed(2));
        if (margin >= 0.5) {
          statusText = `+${margin.toFixed(2)} pts Above Cut-Off (${historicalCutoff}) — High Placement Chance`;
        } else if (margin >= -1.2) {
          statusText = `${margin >= 0 ? '+' : ''}${margin.toFixed(2)} pts of Cut-Off (${historicalCutoff}) — Competitive Range`;
        } else {
          statusText = `${Math.abs(margin).toFixed(2)} pts Below Cut-Off (${historicalCutoff}) — Higher Cut-Off University`;
        }
      } else if (isDegree) {
        statusText = prog.cutoffStatusText;
      }

      institutionOfferings.push({
        programmeName: prog.programmeName,
        level: prog.level,
        institutionName: inst.institutionName,
        county: inst.county,
        type: inst.type,
        admissionYear,
        historicalCutoff,
        studentScore: isDegree ? prog.studentEstimatedClusterPoints : undefined,
        cutoffStatusText: statusText,
      });
    }
  }

  // 7. Summary counts for preview
  const degreeCount = eligibleProgrammes.filter(p => p.level === 'Degree').length;
  const diplomaCount = eligibleProgrammes.filter(p => p.level === 'Diploma').length;
  const tvetCount = eligibleProgrammes.filter(p => p.level === 'Certificate' || p.level === 'Artisan' || p.level === 'TVET').length;

  return {
    studentName: assessmentInput.studentName,
    studentEmail: assessmentInput.studentEmail,
    studentPhone: assessmentInput.studentPhone,
    kcseYear: assessmentInput.kcseYear,
    indexNumber: assessmentInput.indexNumber,
    subjects: assessmentInput.subjects.map(s => ({
      subject: s.subject,
      grade: s.grade as any,
      points: GRADE_POINTS[s.grade as keyof typeof GRADE_POINTS] || 1,
    })),
    hobbies: assessmentInput.hobbies,
    otherHobby: assessmentInput.otherHobby,
    intendedCourse: assessmentInput.intendedCourse,
    meanGrade: meanGradeResult.meanGrade,
    meanPoints: meanGradeResult.meanPoints,
    totalAggregate: meanGradeResult.totalAggregate,
    gradePointsDisplay: `${meanGradeResult.totalAggregate}/84 pts`,
    studentEstimatedClusterPoints: generalCluster,
    previewSummary: {
      meanGrade: meanGradeResult.meanGrade,
      gradePointsDisplay: `${meanGradeResult.totalAggregate}/84 pts`,
      studentEstimatedClusterPoints: generalCluster,
      potentialDegreeMatches: degreeCount,
      potentialDiplomaMatches: diplomaCount,
      potentialTvetMatches: tvetCount,
      totalEligibleInstitutions: institutionOfferings.length,
      totalEvaluatedProgrammes: activeProgrammes.length,
      intendedCoursePreview: assessmentInput.intendedCourse,
      intendedCourseMeetsMinimums: intendedAnalysis.status === 'STRONG_MATCH',
    },
    detailedResults: {
      totalEvaluatedCount: activeProgrammes.length,
      intendedCourseAnalysis: intendedAnalysis,
      eligibleProgrammes,
      fieldMatchProgrammes,
      otherEligibleProgrammes,
      allEvaluations,
      competitiveProgrammes,
      aspirationalProgrammes,
      topRecommendations,
      alternativePathways,
      institutionOfferings,
    },
  };
}
