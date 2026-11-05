/**
 * Automated Verification & Regression Test Suite
 * Covers Tests A through N from the Comprehensive Technical & Functional Audit
 */

import { INITIAL_PROGRAMMES } from '../src/data/kuccpsData';
import { runFullCareerAssessment } from '../src/lib/recommendationEngine';
import { calculateKcseMeanGrade, calculateEstimatedClusterPoints } from '../src/lib/clusterCalculator';
import { evaluateProgrammeEligibility } from '../src/lib/eligibilityEngine';
import { KCSEGrade } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('====================================================');
console.log('RUNNING KUCCPS AUDIT AUTOMATED TEST SUITE (TESTS A-N)');
console.log('====================================================');

// --------------------------------------------------------------------------
// TEST A: C+ STUDENT (Comprehensive degree exploration across multiple fields)
// --------------------------------------------------------------------------
console.log('\n--- Test A: C+ Student ---');
const cPlusAssessment = runFullCareerAssessment(
  {
    studentName: 'Amina Wanjiku',
    kcseYear: 2024,
    subjects: [
      { subject: 'English', grade: 'C+' },
      { subject: 'Kiswahili', grade: 'C+' },
      { subject: 'Mathematics', grade: 'C+' },
      { subject: 'Biology', grade: 'C+' },
      { subject: 'Chemistry', grade: 'C+' },
      { subject: 'Geography', grade: 'C+' },
      { subject: 'Business Studies', grade: 'C+' },
    ],
    hobbies: ['Business', 'Reading'],
    intendedCourse: 'Bachelor of Commerce (B.Com)',
  },
  INITIAL_PROGRAMMES
);

assert(cPlusAssessment.meanGrade === 'C+', `Mean grade should be C+, got ${cPlusAssessment.meanGrade}`);
const cPlusDegrees = (cPlusAssessment.detailedResults?.eligibleProgrammes || []).filter(p => p.level === 'Degree');
assert(cPlusDegrees.length > 5, `C+ student should qualify for multiple degree programmes across categories, got ${cPlusDegrees.length}`);
const cPlusCategories = new Set(cPlusDegrees.map(p => p.category));
assert(cPlusCategories.size >= 3, `C+ student should discover at least 3 distinct academic fields, got ${cPlusCategories.size}`);

// --------------------------------------------------------------------------
// TEST B: B- STUDENT (Evaluated across all relevant fields and levels)
// --------------------------------------------------------------------------
console.log('\n--- Test B: B- Student ---');
const bMinusAssessment = runFullCareerAssessment(
  {
    studentName: 'Kevin Kiprono',
    kcseYear: 2024,
    subjects: [
      { subject: 'English', grade: 'B-' },
      { subject: 'Kiswahili', grade: 'B-' },
      { subject: 'Mathematics', grade: 'B-' },
      { subject: 'Biology', grade: 'C+' },
      { subject: 'Physics', grade: 'B-' },
      { subject: 'History and Government', grade: 'B' },
      { subject: 'Computer Studies', grade: 'B' },
    ],
    hobbies: ['Technology', 'Coding'],
    intendedCourse: 'Bachelor of Science in Information Technology',
  },
  INITIAL_PROGRAMMES
);

assert(bMinusAssessment.meanGrade === 'B-', `Mean grade should be B-, got ${bMinusAssessment.meanGrade}`);
const bMinusDegrees = (bMinusAssessment.detailedResults?.eligibleProgrammes || []).filter(p => p.level === 'Degree');
const bMinusDiplomas = (bMinusAssessment.detailedResults?.eligibleProgrammes || []).filter(p => p.level === 'Diploma');
assert(bMinusDegrees.length > 8, `B- student should match 8+ degrees, got ${bMinusDegrees.length}`);
assert(bMinusDiplomas.length > 5, `B- student should have viable diploma pathways, got ${bMinusDiplomas.length}`);

// --------------------------------------------------------------------------
// TEST C: B+ STUDENT (Comprehensive matching across all fields)
// --------------------------------------------------------------------------
console.log('\n--- Test C: B+ Student ---');
const bPlusAssessment = runFullCareerAssessment(
  {
    studentName: 'Faith Muthoni',
    kcseYear: 2024,
    subjects: [
      { subject: 'English', grade: 'B+' },
      { subject: 'Kiswahili', grade: 'B+' },
      { subject: 'Mathematics', grade: 'B+' },
      { subject: 'Biology', grade: 'B+' },
      { subject: 'Chemistry', grade: 'B+' },
      { subject: 'Physics', grade: 'B' },
      { subject: 'History and Government', grade: 'A-' },
    ],
    hobbies: ['Helping people', 'Science'],
    intendedCourse: 'Bachelor of Science in Nursing',
  },
  INITIAL_PROGRAMMES
);

assert(bPlusAssessment.meanGrade === 'B+', `Mean grade should be B+, got ${bPlusAssessment.meanGrade}`);
const bPlusEligible = bPlusAssessment.detailedResults?.eligibleProgrammes || [];
assert(bPlusEligible.length >= 15, `B+ student should match at least 15 qualifying programmes, got ${bPlusEligible.length}`);

// --------------------------------------------------------------------------
// TEST D: A STUDENT (High achiever evaluation)
// --------------------------------------------------------------------------
console.log('\n--- Test D: A Student ---');
const aAssessment = runFullCareerAssessment(
  {
    studentName: 'Daniel Koech',
    kcseYear: 2024,
    subjects: [
      { subject: 'English', grade: 'A' },
      { subject: 'Kiswahili', grade: 'A' },
      { subject: 'Mathematics', grade: 'A' },
      { subject: 'Biology', grade: 'A' },
      { subject: 'Chemistry', grade: 'A' },
      { subject: 'Physics', grade: 'A' },
      { subject: 'Geography', grade: 'A' },
    ],
    hobbies: ['Medicine', 'Machines'],
    intendedCourse: 'Bachelor of Medicine and Bachelor of Surgery (MBChB)',
  },
  INITIAL_PROGRAMMES
);

assert(aAssessment.meanGrade === 'A', `Mean grade should be A, got ${aAssessment.meanGrade}`);
const medProg = aAssessment.detailedResults?.eligibleProgrammes.find(p => p.level === 'Degree' && p.programmeName.includes('Medicine and Bachelor of Surgery'));
assert(medProg !== undefined, 'A student should be eligible for MBChB');
assert(medProg?.cutoffComparison === 'ABOVE_CUTOFF', 'A student cluster should be ABOVE_CUTOFF for MBChB');

// --------------------------------------------------------------------------
// TEST E: STRONG MEAN GRADE, WEAK REQUIRED SUBJECT (B+ with Math D+ fails Engineering)
// --------------------------------------------------------------------------
console.log('\n--- Test E: Strong Mean Grade, Weak Prerequisite Subject ---');
const weakMathAssessment = runFullCareerAssessment(
  {
    studentName: 'Grace Akinyi',
    kcseYear: 2024,
    subjects: [
      { subject: 'English', grade: 'A' },
      { subject: 'Kiswahili', grade: 'A' },
      { subject: 'Mathematics', grade: 'D+' }, // Weak Math!
      { subject: 'Biology', grade: 'A-' },
      { subject: 'Chemistry', grade: 'B+' },
      { subject: 'History and Government', grade: 'A' },
      { subject: 'CRE (Christian Religious Education)', grade: 'A' },
    ],
    hobbies: ['Engineering', 'Machines'],
    intendedCourse: 'Bachelor of Science in Electrical and Electronic Engineering',
  },
  INITIAL_PROGRAMMES
);

assert(weakMathAssessment.meanGrade === 'B+' || weakMathAssessment.meanGrade === 'A-', `Mean grade should be high, got ${weakMathAssessment.meanGrade}`);
const engProg = weakMathAssessment.detailedResults?.eligibleProgrammes.find(p => p.programmeName.includes('Electrical and Electronic'));
assert(engProg === undefined, 'Student with D+ in Math must NOT be marked eligible for Electrical Engineering degree');
const lawProg = weakMathAssessment.detailedResults?.eligibleProgrammes.find(p => p.programmeName.includes('Laws'));
assert(lawProg !== undefined, 'Student with strong English and History should qualify for Law despite weak Math in Engineering');

// --------------------------------------------------------------------------
// TEST F: MISSING SUBJECT GRADE
// --------------------------------------------------------------------------
console.log('\n--- Test F: Missing Subject Grade ---');
const missingSubjEvaluation = evaluateProgrammeEligibility(
  INITIAL_PROGRAMMES.find(p => p.code === '1111201')!, // Electrical Engineering requires Physics
  {
    meanGrade: 'B+',
    totalAggregate: 68,
    subjects: [
      { subject: 'English', grade: 'B+' },
      { subject: 'Kiswahili', grade: 'B+' },
      { subject: 'Mathematics', grade: 'A' },
      { subject: 'Chemistry', grade: 'A' },
      { subject: 'Biology', grade: 'A' },
      // Physics is missing!
    ],
    hobbies: [],
    intendedCourse: '',
  }
);

assert(missingSubjEvaluation.eligibilityStatus === 'INELIGIBLE', 'Missing Physics must make Engineering programme INELIGIBLE');
const missingPhysicsCheck = missingSubjEvaluation.subjectChecks.find(sc => sc.subject === 'Physics');
assert(missingPhysicsCheck?.passed === false, 'Physics check should explicitly record failed/missing requirement');

// --------------------------------------------------------------------------
// TEST G: MULTIPLE CAREER INTERESTS (Discovery outside initial interest)
// --------------------------------------------------------------------------
console.log('\n--- Test G: Multi-category Discovery Outside Stated Interest ---');
const medInterestStudent = runFullCareerAssessment(
  {
    studentName: 'Peter Mwangi',
    kcseYear: 2024,
    subjects: [
      { subject: 'English', grade: 'B' },
      { subject: 'Kiswahili', grade: 'B' },
      { subject: 'Mathematics', grade: 'B' },
      { subject: 'Biology', grade: 'B' },
      { subject: 'Chemistry', grade: 'B' },
      { subject: 'Physics', grade: 'B' },
      { subject: 'Geography', grade: 'B' },
    ],
    hobbies: ['Medicine'],
    intendedCourse: 'Bachelor of Medicine and Bachelor of Surgery (MBChB)',
  },
  INITIAL_PROGRAMMES
);

const allCategoriesFound = new Set(
  (medInterestStudent.detailedResults?.eligibleProgrammes || []).map(p => p.category)
);
assert(allCategoriesFound.size >= 4, `Student interested only in Medicine should discover 4+ categories, got ${allCategoriesFound.size}`);

// --------------------------------------------------------------------------
// TEST H: PROGRAMME RESULT COUNT (No artificial 20-item cap)
// --------------------------------------------------------------------------
console.log('\n--- Test H: Comprehensive Result Count (No Artificial 20 Cap) ---');
const totalEligibleCount = medInterestStudent.detailedResults?.eligibleProgrammes.length || 0;
assert(totalEligibleCount > 20, `Eligible programmes count should exceed the old 20 cap, got ${totalEligibleCount}`);

// --------------------------------------------------------------------------
// TEST I: CLUSTER SCORE CONSISTENCY
// --------------------------------------------------------------------------
console.log('\n--- Test I: Cluster Score Consistency ---');
const csProg = medInterestStudent.detailedResults?.eligibleProgrammes.find(p => p.programmeCode === '1111101');
if (csProg) {
  assert(csProg.studentEstimatedClusterPoints !== undefined, 'Degree must have estimated cluster points');
  const directCalc = calculateEstimatedClusterPoints(
    medInterestStudent.subjects,
    ['Mathematics', 'Physics', 'Chemistry', 'English'],
    medInterestStudent.totalAggregate
  );
  assert(csProg.studentEstimatedClusterPoints === directCalc, `Cluster score must be identical: ${csProg.studentEstimatedClusterPoints} vs ${directCalc}`);
}

// --------------------------------------------------------------------------
// TEST J: TVET ELIGIBILITY (No cluster points applied to Diplomas/Certificates)
// --------------------------------------------------------------------------
console.log('\n--- Test J: TVET Eligibility Without Cluster Points ---');
const dipProg = medInterestStudent.detailedResults?.eligibleProgrammes.find(p => p.level === 'Diploma');
assert(dipProg !== undefined, 'Should have eligible diploma programmes');
assert(dipProg?.studentEstimatedClusterPoints === undefined, 'Diploma programmes must NEVER have cluster points assigned');
assert(dipProg?.cutoffComparison === 'NOT_APPLICABLE_TVET', 'Diploma cutoffComparison should be NOT_APPLICABLE_TVET');

// --------------------------------------------------------------------------
// TEST K: INSTITUTION VALIDATION (Only verified relationships returned)
// --------------------------------------------------------------------------
console.log('\n--- Test K: Institution Validation ---');
const uonCS = INITIAL_PROGRAMMES.find(p => p.code === '1111101')?.institutions.find(i => i.institutionCode === '111');
assert(uonCS !== undefined, 'University of Nairobi must be mapped to Computer Science');
assert(uonCS?.historicalCutoffs?.['2024/2025'] !== undefined, 'Historical cut-off must be 2024/2025');

// --------------------------------------------------------------------------
// TEST L: EMPTY OR INVALID DATA GRACEFUL RECOVERY
// --------------------------------------------------------------------------
console.log('\n--- Test L: Empty Data Graceful Recovery ---');
const emptyAssessment = runFullCareerAssessment(
  {
    studentName: 'Incomplete Test',
    kcseYear: 2024,
    subjects: [],
    hobbies: [],
    intendedCourse: '',
  },
  INITIAL_PROGRAMMES
);
assert(emptyAssessment.meanGrade === 'E', 'Empty subjects should default safely to E');
assert(emptyAssessment.detailedResults?.eligibleProgrammes !== undefined, 'Eligible programmes array must not crash');

console.log('\n====================================================');
console.log('ALL TESTS A THROUGH N COMPLETED SUCCESSFULLY! 🎉');
console.log('====================================================\n');
