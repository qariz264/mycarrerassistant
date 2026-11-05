/**
 * KUCCPS Cluster Point & KNEC Mean Grade Calculation Engine
 * 
 * IMPORTANT:
 * As mandated by KUCCPS standards:
 * - This value is strictly labeled "Estimated Weighted Cluster Points".
 * - "Your estimated weighted cluster points are calculated using the available KCSE grades and 
 *    applicable KUCCPS methodology. The official KUCCPS weighted cluster points may differ."
 * - Weighted cluster points apply EXCLUSIVELY to Degree programmes.
 * - Diploma, Certificate, and TVET placement do NOT use cluster points.
 */

import { KCSEGrade } from '../types';
import { GRADE_POINTS } from '../data/kcseSubjects';

export interface MeanGradeCalculationResult {
  meanGrade: KCSEGrade;
  meanPoints: number; // e.g. 8.00
  totalAggregate: number; // sum of best 7 subjects (max 84)
  consideredSubjects: { subject: string; grade: KCSEGrade; points: number }[];
  isComplete: boolean;
}

/**
 * Calculates official KNEC KCSE Mean Grade using the KNEC 7-subject criteria:
 * 1. Three compulsory Group 1 subjects: English, Kiswahili, Mathematics
 * 2. Two best sciences from Group 2: Biology, Chemistry, Physics, General Science
 * 3. Two best remaining subjects from Group 3 (Humanities), Group 4/5 (Technicals/Applied/Foreign), or remaining sciences
 */
export function calculateKcseMeanGrade(
  enteredSubjects: { subject: string; grade: KCSEGrade }[]
): MeanGradeCalculationResult {
  if (!enteredSubjects || enteredSubjects.length === 0) {
    return {
      meanGrade: 'E',
      meanPoints: 1.0,
      totalAggregate: 7,
      consideredSubjects: [],
      isComplete: false,
    };
  }

  // Map to points
  const subjectMap = new Map<string, { subject: string; grade: KCSEGrade; points: number }>();
  for (const s of enteredSubjects) {
    const pts = GRADE_POINTS[s.grade] || 1;
    subjectMap.set(s.subject, { subject: s.subject, grade: s.grade, points: pts });
  }

  // 1. Group 1: English, Kiswahili, Mathematics
  const english = subjectMap.get('English');
  const kiswahili = subjectMap.get('Kiswahili');
  const math = subjectMap.get('Mathematics');

  // 2. Group 2: Sciences
  const scienceNames = ['Biology', 'Chemistry', 'Physics', 'General Science'];
  const availableSciences: { subject: string; grade: KCSEGrade; points: number }[] = [];
  for (const sci of scienceNames) {
    const found = subjectMap.get(sci);
    if (found) availableSciences.push(found);
  }
  availableSciences.sort((a, b) => b.points - a.points);
  const best2Sciences = availableSciences.slice(0, 2);

  // Mark subjects used so far
  const usedKeys = new Set<string>();
  if (english) usedKeys.add('English');
  if (kiswahili) usedKeys.add('Kiswahili');
  if (math) usedKeys.add('Mathematics');
  best2Sciences.forEach(s => usedKeys.add(s.subject));

  // 3. Remaining subjects
  const remainingSubjects: { subject: string; grade: KCSEGrade; points: number }[] = [];
  for (const [name, data] of subjectMap.entries()) {
    if (!usedKeys.has(name)) {
      remainingSubjects.push(data);
    }
  }
  remainingSubjects.sort((a, b) => b.points - a.points);

  const selectedSubjects: { subject: string; grade: KCSEGrade; points: number }[] = [];
  if (english) selectedSubjects.push(english);
  if (kiswahili) selectedSubjects.push(kiswahili);
  if (math) selectedSubjects.push(math);
  selectedSubjects.push(...best2Sciences);

  // Fill up to 7 subjects with remaining highest-scoring subjects
  while (selectedSubjects.length < 7 && remainingSubjects.length > 0) {
    const next = remainingSubjects.shift();
    if (next) selectedSubjects.push(next);
  }

  // If student took fewer than 7, fill with remaining entries if any
  if (selectedSubjects.length < 7) {
    for (const [name, data] of subjectMap.entries()) {
      if (!selectedSubjects.some(s => s.subject === name) && selectedSubjects.length < 7) {
        selectedSubjects.push(data);
      }
    }
  }

  const isComplete = selectedSubjects.length >= 7;
  const countToDivide = selectedSubjects.length >= 7 ? 7 : Math.max(1, selectedSubjects.length);
  const sumPoints = selectedSubjects.reduce((acc, curr) => acc + curr.points, 0);
  const meanPoints = Number((sumPoints / countToDivide).toFixed(2));

  // KNEC Aggregate boundaries (Total points out of 84)
  let meanGrade: KCSEGrade = 'E';
  if (sumPoints >= 81) meanGrade = 'A';
  else if (sumPoints >= 74) meanGrade = 'A-';
  else if (sumPoints >= 67) meanGrade = 'B+';
  else if (sumPoints >= 60) meanGrade = 'B';
  else if (sumPoints >= 53) meanGrade = 'B-';
  else if (sumPoints >= 46) meanGrade = 'C+';
  else if (sumPoints >= 39) meanGrade = 'C';
  else if (sumPoints >= 32) meanGrade = 'C-';
  else if (sumPoints >= 25) meanGrade = 'D+';
  else if (sumPoints >= 18) meanGrade = 'D';
  else if (sumPoints >= 11) meanGrade = 'D-';
  else meanGrade = 'E';

  return {
    meanGrade,
    meanPoints,
    totalAggregate: sumPoints,
    consideredSubjects: selectedSubjects,
    isComplete,
  };
}

/**
 * Calculates Estimated Weighted Cluster Points for a DEGREE programme or general candidate baseline
 * Formula:
 *   C = sqrt((r / 48) * (t / 84)) * 48
 * where:
 * - r: sum of student points in the 4 cluster subjects (max 48)
 * - t: student total aggregate in best 7 subjects (max 84)
 * 
 * NOTE: This is NEVER applied to Diploma or Certificate programmes.
 */
export function calculateEstimatedClusterPoints(
  studentSubjects: { subject: string; grade: KCSEGrade }[],
  clusterSubjectNames: string[] = ['Mathematics', 'Physics', 'Chemistry', 'English'],
  totalAggregateOverride?: number
): number {
  if (!studentSubjects || studentSubjects.length === 0) return 0;

  // Map student subjects with normalized identifiers and grade points
  const subList = studentSubjects.map((s, idx) => ({
    index: idx,
    name: s.subject,
    norm: s.subject.toLowerCase().replace(/[^a-z0-9]/g, ''),
    points: GRADE_POINTS[s.grade] || 1,
    grade: s.grade,
  }));

  const matchesSlot = (sub: typeof subList[0], slotDef: string): boolean => {
    const sNorm = sub.norm;
    const defLower = slotDef.toLowerCase();

    // Check category wildcards commonly used in KUCCPS cluster guidelines
    if (defLower.includes('any science') || defLower.includes('group 2') || defLower.includes('physical science')) {
      if (['biology', 'physics', 'chemistry', 'generalscience', 'computerstudies', 'agriculture'].some(k => sNorm.includes(k))) {
        return true;
      }
    }
    if (defLower.includes('any humanities') || defLower.includes('group 3')) {
      if (['history', 'geography', 'cre', 'ire', 'hre'].some(k => sNorm.includes(k))) {
        return true;
      }
    }
    if (defLower.includes('any technical') || defLower.includes('group 4') || defLower.includes('group 5') || defLower.includes('applied')) {
      if (['business', 'computer', 'agriculture', 'homescience', 'art', 'drawing', 'aviation', 'woodwork', 'metalwork', 'building', 'electricity', 'mechanics', 'french', 'german', 'arabic', 'music'].some(k => sNorm.includes(k))) {
        return true;
      }
    }
    if (defLower.includes('any 4th') || defLower.includes('any other') || defLower.includes('any subject') || defLower.includes('remaining')) {
      return true;
    }

    // Direct name or alternative options ('or', '/')
    const parts = slotDef.split(/\/|\sor\s/).map(p => p.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    for (const part of parts) {
      if (!part) continue;
      if (sNorm === part) return true;
      if (sNorm.includes(part) || part.includes(sNorm)) return true;
      if (
        (part.startsWith('cre') && sNorm.startsWith('cre')) ||
        (part.startsWith('ire') && sNorm.startsWith('ire')) ||
        (part.startsWith('history') && sNorm.startsWith('history')) ||
        (part.startsWith('business') && sNorm.startsWith('business')) ||
        (part.startsWith('computer') && sNorm.startsWith('computer')) ||
        (part.startsWith('agriculture') && sNorm.startsWith('agriculture'))
      ) {
        return true;
      }
    }
    return false;
  };

  // Find candidate student subjects for each of the 4 cluster slots
  const effectiveSlots = clusterSubjectNames.slice(0, 4);
  while (effectiveSlots.length < 4) {
    effectiveSlots.push('Any Remaining Subject');
  }

  const slotCandidates = effectiveSlots.map(slotDef => {
    return subList
      .filter(s => matchesSlot(s, slotDef))
      .sort((a, b) => b.points - a.points);
  });

  // Search for the assignment of 4 DISTINCT subjects that maximizes raw points r
  const usedSubjectIndices = new Set<number>();
  function searchMaxR(slotIdx: number): number {
    if (slotIdx === effectiveSlots.length) return 0;
    let max = -1;
    const candidates = slotCandidates[slotIdx];
    for (const c of candidates) {
      if (!usedSubjectIndices.has(c.index)) {
        usedSubjectIndices.add(c.index);
        const nextScore = searchMaxR(slotIdx + 1);
        if (nextScore >= 0) {
          max = Math.max(max, c.points + nextScore);
        }
        usedSubjectIndices.delete(c.index);
      }
    }
    // If no candidate available or none left for this slot, fallback 1 point
    if (max === -1) {
      const nextScore = searchMaxR(slotIdx + 1);
      max = 1 + (nextScore >= 0 ? nextScore : 0);
    }
    return max;
  }

  const optimalR = searchMaxR(0);
  const rPoints = Math.max(4, optimalR);

  // Compute t: total aggregate in best 7 subjects
  let t = totalAggregateOverride;
  if (!t || t <= 0) {
    const allPoints = subList.map(s => s.points).sort((a, b) => b - a);
    const best7 = allPoints.slice(0, 7);
    t = best7.reduce((acc, v) => acc + v, 0);
  }

  const r = Math.min(48, Math.max(4, rPoints));
  const tTotal = Math.min(84, Math.max(7, t));

  const ratio = (r / 48) * (tTotal / 84);
  const clusterScore = Math.sqrt(ratio) * 48;

  return Number(clusterScore.toFixed(3));
}

/**
 * Helper to compare grade requirements: is studentGrade >= requiredGrade?
 */
export function isGradeEqualOrHigher(studentGrade: KCSEGrade | undefined, requiredGrade: KCSEGrade): boolean {
  if (!studentGrade) return false;
  const studentPts = GRADE_POINTS[studentGrade] || 0;
  const requiredPts = GRADE_POINTS[requiredGrade] || 0;
  return studentPts >= requiredPts;
}
