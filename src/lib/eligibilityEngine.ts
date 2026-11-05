/**
 * KUCCPS Eligibility Engine
 * Checks mean grades, subject requirements, cluster points, and historical cut-offs.
 * 
 * Strict separation of concerns:
 * - Student's estimated score belongs to the STUDENT.
 * - Programme requirements belong to the PROGRAMME.
 * - Historical cut-offs belong to the specific INSTITUTION + PROGRAMME + PUBLISHED YEAR.
 * - Cluster points ONLY apply to Degree programmes (never to Diploma/Certificate/TVET).
 */

import { 
  KCSEGrade, 
  Programme, 
  ProgrammeEligibilityResult, 
  IntendedCourseAnalysis, 
  SubjectGrade, 
  FitLevel,
  InstitutionCutoffEvaluation
} from '../types';
import { GRADE_POINTS } from '../data/kcseSubjects';
import { calculateEstimatedClusterPoints, isGradeEqualOrHigher } from './clusterCalculator';

export interface StudentEvaluationInput {
  meanGrade: KCSEGrade;
  totalAggregate: number;
  subjects: { subject: string; grade: KCSEGrade }[];
  hobbies: string[];
  intendedCourse: string;
}

/**
 * Evaluates a student against a single programme with complete separation of data fields
 */
export function evaluateProgrammeEligibility(
  programme: Programme,
  input: StudentEvaluationInput
): ProgrammeEligibilityResult {
  const studentSubjectMap = new Map<string, KCSEGrade>();
  const studentSubjectGrades: SubjectGrade[] = input.subjects.map(s => ({
    subject: s.subject,
    grade: s.grade,
    points: GRADE_POINTS[s.grade] || 1,
  }));

  for (const s of input.subjects) {
    studentSubjectMap.set(s.subject, s.grade);
  }

  // 1. Mean Grade Requirement Check (PROGRAMME MINIMUM)
  const meetsMeanGrade = isGradeEqualOrHigher(input.meanGrade, programme.minimumMeanGrade);

  // 2. Subject Requirements Check (PROGRAMME PREREQUISITES)
  const subjectChecks: ProgrammeEligibilityResult['subjectChecks'] = [];
  let allSubjectRequirementsMet = true;

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const getStudentGrade = (targetName: string): KCSEGrade | undefined => {
    if (studentSubjectMap.has(targetName)) return studentSubjectMap.get(targetName);
    const targetNorm = norm(targetName);
    for (const [key, val] of studentSubjectMap.entries()) {
      const keyNorm = norm(key);
      if (keyNorm === targetNorm) return val;
      if (
        (keyNorm.startsWith('cre') && targetNorm.startsWith('cre')) ||
        (keyNorm.startsWith('ire') && targetNorm.startsWith('ire')) ||
        (keyNorm.startsWith('history') && targetNorm.startsWith('history')) ||
        (keyNorm.startsWith('business') && targetNorm.startsWith('business')) ||
        (keyNorm.startsWith('computer') && targetNorm.startsWith('computer')) ||
        (keyNorm.startsWith('agriculture') && targetNorm.startsWith('agriculture'))
      ) {
        return val;
      }
    }
    return undefined;
  };

  for (const req of programme.subjectRequirements) {
    let studentGrade = getStudentGrade(req.subject);
    let passed = isGradeEqualOrHigher(studentGrade, req.minGrade);

    // If alternative subjects are allowed (e.g. Physics or Chemistry)
    if (!passed && req.alternativeSubjects && req.alternativeSubjects.length > 0) {
      for (const alt of req.alternativeSubjects) {
        const altGrade = getStudentGrade(alt);
        if (isGradeEqualOrHigher(altGrade, req.minGrade)) {
          studentGrade = altGrade;
          passed = true;
          break;
        }
      }
    }

    if (!passed) {
      allSubjectRequirementsMet = false;
    }

    subjectChecks.push({
      subject: req.subject,
      requiredGrade: req.minGrade,
      studentGrade,
      passed,
      note: passed 
        ? `Satisfies minimum ${req.minGrade}` 
        : studentGrade 
          ? `Scored ${studentGrade}, below required ${req.minGrade}` 
          : `Subject not entered in KCSE results (requires ${req.minGrade})`
    });
  }

  const isEligible = meetsMeanGrade && allSubjectRequirementsMet;
  const eligibilityStatus = isEligible ? 'ELIGIBLE' : 'INELIGIBLE';

  // 3. Cluster Points calculation & Per-Institution Cut-Off Evaluation
  const isDegree = programme.level === 'Degree';
  let studentEstimatedClusterPoints: number | undefined = undefined;
  let cutoffComparison: ProgrammeEligibilityResult['cutoffComparison'] = 'NOT_APPLICABLE_TVET';
  let cutoffStatusText = 'Admissions based on KCSE Mean Grade & subject prerequisites (No cluster points for TVET/Diploma)';
  let institutionHistoricalCutoff: ProgrammeEligibilityResult['institutionHistoricalCutoff'] = undefined;
  const institutionsBreakdown: InstitutionCutoffEvaluation[] = [];
  let minInstitutionCutoff: number | undefined = undefined;
  let maxInstitutionCutoff: number | undefined = undefined;
  let qualifyingInstitutionsCount = 0;

  const latestPublishedYear = '2024/2025';

  if (isDegree) {
    const clusterSubjects = programme.clusterSubjects && programme.clusterSubjects.length === 4
      ? programme.clusterSubjects
      : ['Mathematics', 'Physics', 'Chemistry', 'English'];

    studentEstimatedClusterPoints = calculateEstimatedClusterPoints(
      input.subjects,
      clusterSubjects,
      input.totalAggregate
    );

    // Evaluate against EVERY offering institution (different universities have different cluster cut-offs)
    for (const inst of programme.institutions) {
      const instCutoff = inst.historicalCutoffs?.[latestPublishedYear] || 
                         inst.historicalCutoffs?.['2023/2024'];

      if (instCutoff !== undefined && instCutoff > 0) {
        if (minInstitutionCutoff === undefined || instCutoff < minInstitutionCutoff) {
          minInstitutionCutoff = instCutoff;
        }
        if (maxInstitutionCutoff === undefined || instCutoff > maxInstitutionCutoff) {
          maxInstitutionCutoff = instCutoff;
        }

        const diff = Number((studentEstimatedClusterPoints - instCutoff).toFixed(3));
        let status: InstitutionCutoffEvaluation['status'] = 'BELOW_CUTOFF';
        let statusText = '';

        if (diff >= 0.5) {
          status = 'QUALIFIES_ABOVE';
          statusText = `+${diff.toFixed(2)} pts Above Cut-Off (${instCutoff})`;
          qualifyingInstitutionsCount++;
        } else if (diff >= -1.2) {
          status = 'WITHIN_RANGE';
          statusText = `Competitive (${diff >= 0 ? '+' : ''}${diff.toFixed(2)} pts of ${instCutoff})`;
          qualifyingInstitutionsCount++;
        } else {
          status = 'BELOW_CUTOFF';
          statusText = `${Math.abs(diff).toFixed(2)} pts Below Cut-Off (${instCutoff})`;
        }

        institutionsBreakdown.push({
          institutionId: inst.institutionId,
          institutionCode: inst.institutionCode,
          institutionName: inst.institutionName,
          county: inst.county,
          type: inst.type,
          cutoffPoints: instCutoff,
          admissionYear: latestPublishedYear,
          diff,
          status,
          statusText,
        });
      } else {
        institutionsBreakdown.push({
          institutionId: inst.institutionId,
          institutionCode: inst.institutionCode,
          institutionName: inst.institutionName,
          county: inst.county,
          type: inst.type,
          status: 'NO_HISTORICAL_DATA',
          statusText: 'Cut-off pending official KUCCPS release',
        });
      }
    }

    // Sort institution breakdown: Qualified first, then Within Range, then Below (sorted by cutoff ascending)
    institutionsBreakdown.sort((a, b) => {
      const order = { QUALIFIES_ABOVE: 1, WITHIN_RANGE: 2, NO_HISTORICAL_DATA: 3, BELOW_CUTOFF: 4, NOT_APPLICABLE_TVET: 5 };
      const diffOrder = (order[a.status] || 99) - (order[b.status] || 99);
      if (diffOrder !== 0) return diffOrder;
      return (a.cutoffPoints || 999) - (b.cutoffPoints || 999);
    });

    // Determine overall course-level cutoff comparison considering multi-university options
    if (qualifyingInstitutionsCount > 0) {
      const hasStrong = institutionsBreakdown.some(i => i.status === 'QUALIFIES_ABOVE');
      if (hasStrong) {
        cutoffComparison = 'ABOVE_CUTOFF';
        cutoffStatusText = qualifyingInstitutionsCount === programme.institutions.length
          ? `Your cluster score (${studentEstimatedClusterPoints.toFixed(3)}) exceeds cut-offs at ALL ${programme.institutions.length} offering universities (Range: ${minInstitutionCutoff} - ${maxInstitutionCutoff} pts)`
          : `Your cluster score (${studentEstimatedClusterPoints.toFixed(3)}) meets cut-offs at ${qualifyingInstitutionsCount} of ${programme.institutions.length} offering universities (Cut-off range: ${minInstitutionCutoff} - ${maxInstitutionCutoff} pts)`;
      } else {
        cutoffComparison = 'WITHIN_RANGE';
        cutoffStatusText = `Your cluster score (${studentEstimatedClusterPoints.toFixed(3)}) is within competitive range at ${qualifyingInstitutionsCount} offering universities (Range: ${minInstitutionCutoff} - ${maxInstitutionCutoff} pts)`;
      }
    } else if (minInstitutionCutoff !== undefined) {
      cutoffComparison = 'BELOW_CUTOFF';
      cutoffStatusText = `Your cluster score (${studentEstimatedClusterPoints.toFixed(3)}) is below historical cut-offs (Lowest university cut-off is ${minInstitutionCutoff} pts; highest is ${maxInstitutionCutoff} pts)`;
    } else {
      cutoffComparison = 'HISTORICAL_CUTOFF_UNAVAILABLE';
      cutoffStatusText = 'Official historical cut-off pending KUCCPS publication';
    }

    // Pick top qualifying institution or primary for institutionHistoricalCutoff
    const bestInst = institutionsBreakdown.find(i => i.status === 'QUALIFIES_ABOVE') || 
                     institutionsBreakdown.find(i => i.status === 'WITHIN_RANGE') || 
                     institutionsBreakdown[0];

    if (bestInst && bestInst.cutoffPoints) {
      institutionHistoricalCutoff = {
        institutionName: bestInst.institutionName,
        county: bestInst.county,
        admissionYear: latestPublishedYear,
        cutoffPoints: bestInst.cutoffPoints,
        source: `KUCCPS Published Placement Data ${latestPublishedYear}`,
      };
    }
  } else {
    // TVET / Diploma / Certificate - every institution admits on Mean Grade basis
    for (const inst of programme.institutions) {
      institutionsBreakdown.push({
        institutionId: inst.institutionId,
        institutionCode: inst.institutionCode,
        institutionName: inst.institutionName,
        county: inst.county,
        type: inst.type,
        status: 'NOT_APPLICABLE_TVET',
        statusText: `Direct placement via KCSE Mean Grade (${programme.minimumMeanGrade})`,
      });
    }
  }

  // 4. Fit Dimensions (Hobbies, Interests & Career Alignment)
  let matchScore = 0;
  const matchedKeywords: string[] = [];
  const matchedFieldNames: string[] = [];
  let isFieldMatch = false;

  const categoryKeywords: Record<string, string[]> = {
    'Computing & IT': ['coding', 'technology', 'gaming', 'electronics', 'problem solving', 'computers', 'software', 'programming', 'cybersecurity', 'data', 'cloud', 'systems', 'information', 'hardware'],
    'Engineering': ['machines', 'engineering', 'electronics', 'construction', 'design', 'mathematics', 'mechanics', 'building', 'electrical', 'civil', 'mechatronics', 'automotive', 'telecommunications', 'solar', 'drilling', 'mining'],
    'Architecture & Design': ['drawing', 'art', 'design', 'construction', 'photography', 'creative', 'architecture', 'surveying', 'valuation', 'interior', 'landscape', 'geoinformatics', 'planning', 'town'],
    'Health Sciences': ['medicine', 'helping people', 'science', 'biology', 'health', 'hospital', 'nursing', 'pharmacy', 'laboratory', 'clinical', 'dietetics', 'nutrition', 'dental', 'radiography', 'physiotherapy'],
    'Pure & Applied Sciences': ['science', 'mathematics', 'research', 'problem solving', 'biology', 'chemistry', 'physics', 'biochemistry', 'genetics', 'statistics', 'geology', 'meteorology'],
    'Business & Finance': ['business', 'entrepreneurship', 'finance', 'mathematics', 'leadership', 'accounting', 'marketing', 'banking', 'actuarial', 'economics', 'procurement', 'logistics', 'sacco'],
    'Agriculture & Environment': ['agriculture', 'animals', 'science', 'nature', 'farming', 'environment', 'agribusiness', 'horticulture', 'crops', 'dairy', 'wildlife', 'fisheries', 'forestry'],
    'Education': ['teaching', 'helping people', 'communication', 'reading', 'mentoring', 'instructor', 'pedagogy', 'training'],
    'Law & Governance': ['law', 'reading', 'writing', 'public speaking', 'leadership', 'communication', 'justice', 'criminology', 'diplomacy', 'governance', 'policy', 'psychology', 'counseling'],
    'Hospitality & Creative': ['travel', 'fashion', 'beauty', 'art', 'design', 'photography', 'food', 'cooking', 'culinary', 'hotel', 'tourism', 'safari', 'broadcasting', 'journalism', 'film', 'music'],
    'Professional & Technical': ['logistics', 'machines', 'engineering', 'vehicles', 'management', 'real estate', 'plumbing', 'welding', 'carpentry'],
  };

  const relevantKeywords = categoryKeywords[programme.category] || [];
  const normalizedHobbies = input.hobbies.map(h => h.toLowerCase());

  // Check category keywords
  for (const kw of relevantKeywords) {
    if (normalizedHobbies.some(h => h.includes(kw) || kw.includes(h))) {
      matchScore += 20;
      matchedKeywords.push(kw);
    }
  }

  // Check specific career interests & hobbies selected by student
  const progNameLower = programme.name.toLowerCase();
  const progCatLower = programme.category.toLowerCase();
  const progClusterLower = (programme.clusterGroupName || '').toLowerCase();

  for (const hobby of input.hobbies) {
    if (!hobby || !hobby.trim()) continue;
    const hLower = hobby.toLowerCase();

    // Check direct name / category containment
    const directHit = progNameLower.includes(hLower) || hLower.includes(progNameLower) ||
                      progCatLower.includes(hLower) || hLower.includes(progCatLower) ||
                      progClusterLower.includes(hLower);

    // Check meaningful token overlaps
    const hobbyTokens = hLower.split(/[\s,&/()\-]+/).filter(t => t.length >= 4 && !['with', 'management', 'science', 'technology', 'engineering', 'school', 'secondary'].includes(t));
    const progTokens = (progNameLower + ' ' + progCatLower).split(/[\s,&/()\-]+/).filter(t => t.length >= 4);
    const tokenHit = hobbyTokens.some(t => progTokens.includes(t));

    if (directHit || tokenHit) {
      if (!matchedFieldNames.includes(hobby)) {
        matchedFieldNames.push(hobby);
      }
      isFieldMatch = true;
      matchScore += 35;
    }
  }

  // Check against student's intended course(s)
  let careerMatch: FitLevel = 'LOW';
  if (input.intendedCourse && input.intendedCourse !== "I don't know yet") {
    const intendedList = input.intendedCourse.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);

    for (const intended of intendedList) {
      if (progNameLower.includes(intended) || intended.includes(progNameLower)) {
        careerMatch = 'HIGH';
        matchScore += 55;
        isFieldMatch = true;
        const label = `Intended: ${intended}`;
        if (!matchedFieldNames.includes(label)) {
          matchedFieldNames.unshift(label);
        }
      } else if (progCatLower.includes(intended) || intended.includes(progCatLower) || progClusterLower.includes(intended)) {
        if (careerMatch !== 'HIGH') careerMatch = 'MODERATE';
        matchScore += 30;
        isFieldMatch = true;
      }
    }
  }

  let interestMatch: FitLevel = 'LOW';
  if (matchedKeywords.length >= 2 || matchedFieldNames.length >= 1) interestMatch = 'HIGH';
  else if (matchedKeywords.length === 1) interestMatch = 'MODERATE';

  if (isEligible) matchScore += 50;
  if (cutoffComparison === 'ABOVE_CUTOFF') matchScore += 25;
  else if (cutoffComparison === 'WITHIN_RANGE') matchScore += 15;

  // 5. Rationale & Missing Prerequisites
  const missing: string[] = [];
  if (!meetsMeanGrade) {
    missing.push(`Minimum Mean Grade of ${programme.minimumMeanGrade} (Your grade: ${input.meanGrade})`);
  }
  for (const sc of subjectChecks) {
    if (!sc.passed) {
      missing.push(`${sc.subject}: minimum ${sc.requiredGrade} (Your grade: ${sc.studentGrade || 'Not taken'})`);
    }
  }

  let recommendedReason = '';
  if (isEligible) {
    if (isDegree) {
      recommendedReason = matchedKeywords.length > 0 || matchedFieldNames.length > 0
        ? `Meets published KCSE degree prerequisites (${programme.minimumMeanGrade}) and aligns with your chosen career interest in ${matchedFieldNames[0] || matchedKeywords.slice(0, 2).join(', ')}. Estimated cluster: ${studentEstimatedClusterPoints}.`
        : `Meets all published KUCCPS degree minimums (${programme.minimumMeanGrade} & subject requirements). Estimated cluster: ${studentEstimatedClusterPoints}.`;
    } else {
      recommendedReason = matchedKeywords.length > 0 || matchedFieldNames.length > 0
        ? `Meets published ${programme.level} entry criteria (Min Mean Grade ${programme.minimumMeanGrade}) and matches your stated interest in ${matchedFieldNames[0] || matchedKeywords.slice(0, 2).join(', ')}. TVET placement is based on mean grade.`
        : `Academically eligible for ${programme.level} placement (Requires Mean Grade ${programme.minimumMeanGrade}). No cluster points required.`;
    }
  } else {
    recommendedReason = `Does not meet published minimum criteria: Requires ${missing.join(', ')}.`;
  }

  const fieldMatchReason = isFieldMatch && matchedFieldNames.length > 0
    ? `Matches your selected field in ${matchedFieldNames.slice(0, 2).join(' & ')}`
    : isFieldMatch
      ? 'In your chosen study field'
      : undefined;

  const programmeCluster = isDegree
    ? (programme.clusterGroupName || `KUCCPS Cluster ${programme.clusterNumber}: ${programme.category}`)
    : `TVET / ${programme.level} (Cluster Points Do Not Apply)`;

  return {
    programmeId: programme.id,
    programmeCode: programme.code,
    programmeName: programme.name,
    level: programme.level,
    category: programme.category,

    // 1. Programme data
    programmeCluster,
    programmeClusterNumber: programme.clusterNumber,
    programmeMinimumMeanGrade: programme.minimumMeanGrade,
    programmeSubjectRequirements: programme.subjectRequirements,
    programmeHistoricalCutoffs: programme.historicalCutoffs,

    // 2. Student score data
    studentSubjectGrades,
    studentEstimatedClusterPoints,

    // 3. Institution data
    institutionHistoricalCutoff,
    institutionCount: programme.institutions.length,
    institutionsBreakdown,
    qualifyingInstitutionsCount,
    minInstitutionCutoff,
    maxInstitutionCutoff,

    // 4. Eligibility evaluation
    eligibilityStatus,
    meetsMeanGrade,
    studentMeanGrade: input.meanGrade,
    subjectChecks,
    allSubjectRequirementsMet,

    // 5. Cut-off comparison
    cutoffComparison,
    cutoffStatusText,

    // 6. Fit dimensions
    interestMatch,
    careerMatch,
    matchScore,
    matchedInterestKeywords: matchedKeywords,

    // 7. Rationale
    recommendedReason,
    missingRequirements: missing,

    // 8. Targeted Field Match
    isFieldMatch,
    matchedFieldNames,
    fieldMatchReason,
  };
}

/**
 * Evaluates the student's intended course specifically
 */
export function analyzeIntendedCourse(
  intendedCourse: string,
  programmes: Programme[],
  input: StudentEvaluationInput
): IntendedCourseAnalysis {
  if (!intendedCourse || intendedCourse === "I don't know yet") {
    return {
      courseName: "Undecided / Open Exploration",
      status: 'UNDECIDED',
      missingRequirements: [],
      recommendationNote: "You indicated you are still exploring. Our system has analyzed your subject strengths and stated interests to recommend suitable university, diploma, and technical college pathways."
    };
  }

  const normIntended = intendedCourse.toLowerCase().trim();

  // Find best matching programme
  let matchedProg = programmes.find(p => 
    p.name.toLowerCase().includes(normIntended) || 
    normIntended.includes(p.name.toLowerCase()) ||
    normIntended.includes(p.category.toLowerCase())
  );

  // Fallback to token search
  if (!matchedProg) {
    const tokens = normIntended.split(/\s+/).filter(t => t.length > 3);
    for (const token of tokens) {
      matchedProg = programmes.find(p => p.name.toLowerCase().includes(token));
      if (matchedProg) break;
    }
  }

  if (!matchedProg) {
    return {
      courseName: intendedCourse,
      status: 'UNDECIDED',
      missingRequirements: [],
      recommendationNote: `You expressed interest in ${intendedCourse}. While this exact title is not directly listed, related degree, diploma, and technical courses are mapped below based on your grades.`
    };
  }

  const evalResult = evaluateProgrammeEligibility(matchedProg, input);

  if (evalResult.eligibilityStatus === 'ELIGIBLE') {
    const scoreNote = evalResult.studentEstimatedClusterPoints !== undefined 
      ? `Your estimated cluster score is ${evalResult.studentEstimatedClusterPoints}.` 
      : `Admission is based on your KCSE Mean Grade (${input.meanGrade}).`;

    return {
      courseName: intendedCourse,
      status: 'STRONG_MATCH',
      matchedProgramme: matchedProg,
      eligibility: evalResult,
      missingRequirements: [],
      recommendationNote: `Great news: Your KCSE academic profile meets the published minimum requirements for ${matchedProg.name}. ${scoreNote}`
    };
  } else {
    return {
      courseName: intendedCourse,
      status: 'ELIGIBLE_ALTERNATIVE_SUGGESTED',
      matchedProgramme: matchedProg,
      eligibility: evalResult,
      missingRequirements: evalResult.missingRequirements,
      recommendationNote: `Your intended course (${intendedCourse}) requires: ${evalResult.missingRequirements.join('; ')}. Don't be discouraged: We have provided high-value Diploma and TVET pathways below that bridge directly into this field!`
    };
  }
}
