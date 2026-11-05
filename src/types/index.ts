/**
 * Career Assistant KE - Data Models & Types
 * 
 * Strict separation between:
 * 1. Student Academic Performance (Mean Grade, Aggregate /84, studentEstimatedClusterPoints)
 * 2. Programme Requirements (programmeCluster, programmeMinimumMeanGrade, programmeSubjectRequirements)
 * 3. Institution Historical Cut-Offs (institutionHistoricalCutoff, admissionYear)
 * 4. Eligibility Results (Academic Eligibility vs Personal Fit)
 */

export type KCSEGrade = 
  | 'A' 
  | 'A-' 
  | 'B+' 
  | 'B' 
  | 'B-' 
  | 'C+' 
  | 'C' 
  | 'C-' 
  | 'D+' 
  | 'D' 
  | 'D-' 
  | 'E';

export interface SubjectGrade {
  subject: string;
  grade: KCSEGrade;
  points: number; // 12 down to 1
}

export type ProgrammeLevel = 'Degree' | 'Diploma' | 'Certificate' | 'Artisan' | 'TVET';

export type InstitutionType = 
  | 'Public University' 
  | 'Private University' 
  | 'National Polytechnic' 
  | 'Technical College' 
  | 'Teacher Training College' 
  | 'Medical College';

export interface Institution {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: InstitutionType;
  county: string;
  town: string;
}

export interface ProgrammeSubjectRequirement {
  subject: string;
  minGrade: KCSEGrade;
  alternativeSubjects?: string[]; // e.g. Physics or Chemistry
}

export interface InstitutionOffering {
  institutionId: string;
  institutionCode: string;
  institutionName: string;
  county: string;
  type: InstitutionType;
  historicalCutoffs?: Record<string, number>; // Only for Degree programmes (e.g. 2023/2024, 2024/2025)
}

export interface Programme {
  id: string;
  code: string;
  name: string;
  level: ProgrammeLevel;
  category: string; // e.g. "Computing & IT", "Engineering", "Health Sciences", "Business"
  clusterNumber?: number; // 1 to 20 for Degree programmes only
  clusterGroupName?: string; // e.g. "KUCCPS Cluster 7: Computing, Information Technology & Software Engineering"
  minimumMeanGrade: KCSEGrade; // Programme minimum mean grade (e.g. C+ for Degree, C- for Diploma, D for Certificate, E for Artisan)
  clusterSubjects?: string[]; // 4 cluster subjects used ONLY for Degree weighted cluster calculations
  subjectRequirements: ProgrammeSubjectRequirement[];
  historicalCutoffs?: Record<string, number>; // Actual published KUCCPS cycles (2023/2024, 2024/2025) for Degrees only
  institutions: InstitutionOffering[];
  active: boolean;
  notes?: string;
}

export interface SubjectCheckResult {
  subject: string;
  requiredGrade: KCSEGrade;
  studentGrade?: KCSEGrade;
  passed: boolean;
  note: string;
}

export type FitLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface InstitutionCutoffEvaluation {
  institutionId: string;
  institutionCode: string;
  institutionName: string;
  county: string;
  type: InstitutionType;
  cutoffPoints?: number;
  admissionYear?: string;
  diff?: number; // studentCluster - cutoffPoints
  status: 'QUALIFIES_ABOVE' | 'WITHIN_RANGE' | 'BELOW_CUTOFF' | 'NO_HISTORICAL_DATA' | 'NOT_APPLICABLE_TVET';
  statusText: string;
}

export interface ProgrammeEligibilityResult {
  programmeId: string;
  programmeCode: string;
  programmeName: string;
  level: ProgrammeLevel;
  category: string;

  // 1. PROGRAMME DATA (Belongs to Programme)
  programmeCluster: string; // "KUCCPS Cluster 7: Computing & IT" or "TVET / Diploma (No Cluster Points)"
  programmeClusterNumber?: number;
  programmeMinimumMeanGrade: KCSEGrade;
  programmeSubjectRequirements: ProgrammeSubjectRequirement[];
  programmeHistoricalCutoffs?: Record<string, number>; // Only for Degree programmes (e.g. 2023/2024, 2024/2025)

  // 2. STUDENT SCORE DATA (Belongs to Student)
  studentSubjectGrades: SubjectGrade[];
  studentEstimatedClusterPoints?: number; // Only for Degree programmes! Undefined for TVET/Diploma/Certificate

  // 3. INSTITUTION DATA (Belongs to specific Institution + Programme + Admission Year)
  institutionHistoricalCutoff?: {
    institutionName: string;
    county: string;
    admissionYear: string;
    cutoffPoints: number;
    source: string;
  };
  institutionCount: number;
  institutionsBreakdown?: InstitutionCutoffEvaluation[];
  qualifyingInstitutionsCount?: number;
  minInstitutionCutoff?: number;
  maxInstitutionCutoff?: number;

  // 4. ELIGIBILITY EVALUATION
  eligibilityStatus: 'ELIGIBLE' | 'INELIGIBLE';
  meetsMeanGrade: boolean;
  studentMeanGrade: KCSEGrade;
  subjectChecks: SubjectCheckResult[];
  allSubjectRequirementsMet: boolean;

  // 5. CUT-OFF COMPARISON (Degrees only)
  cutoffComparison: 'ABOVE_CUTOFF' | 'WITHIN_RANGE' | 'BELOW_CUTOFF' | 'HISTORICAL_CUTOFF_UNAVAILABLE' | 'NOT_APPLICABLE_TVET';
  cutoffStatusText: string;

  // 6. FIT DIMENSIONS
  interestMatch: FitLevel;
  careerMatch: FitLevel;
  matchScore: number;
  matchedInterestKeywords: string[];

  // 7. RATIONALE
  recommendedReason: string;
  missingRequirements: string[];

  // 8. TARGETED FIELD MATCH
  isFieldMatch?: boolean;
  matchedFieldNames?: string[];
  fieldMatchReason?: string;
}

export interface IntendedCourseAnalysis {
  courseName: string;
  status: 'STRONG_MATCH' | 'ELIGIBLE_ALTERNATIVE_SUGGESTED' | 'UNDECIDED';
  matchedProgramme?: Programme;
  eligibility?: ProgrammeEligibilityResult;
  missingRequirements: string[];
  recommendationNote: string;
}

export type PaymentStatus = 
  | 'UNPAID' 
  | 'PAYMENT_PENDING' 
  | 'PAID' 
  | 'PAYMENT_FAILED' 
  | 'PAYMENT_CANCELLED';

export interface StudentAssessment {
  id: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  kcseYear: number;
  indexNumber?: string;
  subjects: { subject: string; grade: KCSEGrade; points: number }[];
  hobbies: string[];
  otherHobby?: string;
  intendedCourse: string;
  
  // Student's Academic Profile (Belongs to Student)
  meanGrade: KCSEGrade;
  meanPoints: number;
  totalAggregate: number; // e.g. 56 out of 84 max
  gradePointsDisplay: string; // e.g. "56/84 pts"
  studentEstimatedClusterPoints: number; // General estimated weighted cluster points (max 48.000)
  
  paymentStatus: PaymentStatus;
  isUnlocked?: boolean;
  paymentReference?: string;
  paidAmount?: number;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Preliminary summary available before payment
  previewSummary: {
    meanGrade: KCSEGrade;
    gradePointsDisplay: string;
    studentEstimatedClusterPoints: number;
    potentialDegreeMatches: number;
    potentialDiplomaMatches: number;
    potentialTvetMatches: number;
    totalEligibleInstitutions: number;
    totalEvaluatedProgrammes?: number;
    intendedCoursePreview: string;
    intendedCourseMeetsMinimums: boolean;
  };
  
  // Detailed results unlocked after payment
  detailedResults?: {
    totalEvaluatedCount?: number;
    intendedCourseAnalysis: IntendedCourseAnalysis;
    eligibleProgrammes: ProgrammeEligibilityResult[];
    fieldMatchProgrammes?: ProgrammeEligibilityResult[];
    otherEligibleProgrammes?: ProgrammeEligibilityResult[];
    allEvaluations?: ProgrammeEligibilityResult[];
    competitiveProgrammes?: ProgrammeEligibilityResult[];
    aspirationalProgrammes?: ProgrammeEligibilityResult[];
    topRecommendations: ProgrammeEligibilityResult[];
    alternativePathways: {
      category: string;
      level: ProgrammeLevel;
      programmeName: string;
      reason: string;
    }[];
    institutionOfferings: {
      programmeName: string;
      level: ProgrammeLevel;
      institutionName: string;
      county: string;
      type: InstitutionType;
      admissionYear?: string;
      historicalCutoff?: number; // Only for Degrees
      studentScore?: number; // Only for Degrees
      cutoffStatusText: string;
    }[];
    aiCounselorGuidance?: string;
  };
}
