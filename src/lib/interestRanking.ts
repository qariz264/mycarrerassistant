/**
 * Student Interest Ranking Engine
 * 
 * Accurately aligns preview courses and full reports with the student's explicit choices:
 * - Intended course(s) selected during assessment
 * - Student hobbies, passions, and custom interests
 * 
 * Ensures that if a student chooses Computing, ALL qualifying computing courses appear FIRST
 * in the preview (and identically for Medicine, Engineering, Business, Law, Education, Agriculture, etc.).
 */

export interface InterestRankingAssessment {
  intendedCourse?: string;
  hobbies?: string[];
  otherHobby?: string;
}

interface DomainRule {
  domain: string;
  categoryNames: string[];
  triggerKeywords: string[];
  courseKeywords: string[];
}

const DOMAIN_RULES: DomainRule[] = [
  {
    domain: 'Computing & IT',
    categoryNames: ['Computing & IT', 'KUCCPS Cluster 7: Computing, Information Technology & Software Engineering'],
    triggerKeywords: [
      'comput', 'software', 'information technology', ' it ', '(it)', 'cyber', 'data science',
      'program', 'code', 'coding', 'artificial intelligence', 'machine learning', 'tech',
      'informatics', 'network', 'web develop', 'bbit', 'systems', 'cloud', 'developer', 'algorithm'
    ],
    courseKeywords: [
      'computer science', 'software engineering', 'information technology', 'ict',
      'cybersecurity', 'data science', 'computer technology', 'applied computer',
      'business information technology', 'computer systems', 'computing', 'software',
      'informatics', 'web development', 'database'
    ],
  },
  {
    domain: 'Health & Medical',
    categoryNames: ['Health & Medical Sciences', 'KUCCPS Cluster 13: Medicine, Dental & Health Sciences', 'KUCCPS Cluster 14: Nursing & Midwifery'],
    triggerKeywords: [
      'medic', 'doctor', 'surgery', 'mbchb', 'nurs', 'pharmac', 'clinical', 'health',
      'dental', 'dentist', 'biomedical', 'laboratory science', 'pathology', 'radiograph',
      'physiotherapy', 'occupational therapy', 'hospital', 'patient care', 'first aid'
    ],
    courseKeywords: [
      'medicine', 'surgery', 'nursing', 'pharmacy', 'clinical medicine', 'dental',
      'medical laboratory', 'public health', 'radiography', 'physiotherapy',
      'biomedical', 'health systems', 'midwifery'
    ],
  },
  {
    domain: 'Engineering',
    categoryNames: ['Engineering', 'KUCCPS Cluster 5: Engineering & Technology'],
    triggerKeywords: [
      'engineer', 'electrical', 'electronic', 'mechanical', 'civil', 'mechatronic',
      'structural', 'telecommunication', 'automotive', 'petroleum', 'mining',
      'robot', 'aerospace', 'drilling', 'machines', 'mechanics'
    ],
    courseKeywords: [
      'engineering', 'electrical', 'electronic', 'mechanical', 'civil',
      'mechatronics', 'structural', 'telecommunication', 'automotive',
      'petroleum', 'mining', 'geospatial engineering'
    ],
  },
  {
    domain: 'Business & Economics',
    categoryNames: ['Business & Economics', 'KUCCPS Cluster 6: Business, Commerce, Economics & Accounting'],
    triggerKeywords: [
      'business', 'commerc', 'account', 'financ', 'econom', 'market', 'procure',
      'supply chain', 'actuarial', 'banking', 'entrepreneur', 'investment',
      'human resource', 'sacco', 'management', 'auditing'
    ],
    courseKeywords: [
      'commerce', 'accounting', 'finance', 'economics', 'business administration',
      'procurement', 'supply chain', 'actuarial science', 'marketing',
      'human resource', 'financial engineering', 'entrepreneurship'
    ],
  },
  {
    domain: 'Law & Legal',
    categoryNames: ['Law & Legal Studies', 'KUCCPS Cluster 1: Law & Legal Studies'],
    triggerKeywords: [
      'law', 'legal', 'll.b', 'llb', 'criminol', 'justice', 'judic', 'advocat', 'court'
    ],
    courseKeywords: [
      'law', 'bachelor of laws', 'criminology', 'criminal justice', 'legal studies'
    ],
  },
  {
    domain: 'Education & Teaching',
    categoryNames: ['Education & Teaching', 'KUCCPS Cluster 18: Education (Arts, Science, Special Needs)'],
    triggerKeywords: [
      'educat', 'teach', 'pedagogy', 'curriculum', 'instructor', 'tutor', 'special needs', 'ecde'
    ],
    courseKeywords: [
      'education', 'teaching', 'special needs education', 'early childhood', 'pedagogy'
    ],
  },
  {
    domain: 'Architecture & Built Environment',
    categoryNames: ['Architecture & Design', 'KUCCPS Cluster 4: Architecture, Building & Construction'],
    triggerKeywords: [
      'architect', 'quantity survey', 'construction', 'real estate', 'urban plan',
      'interior design', 'landscape', 'geoinformatics', 'surveying', 'valuation'
    ],
    courseKeywords: [
      'architecture', 'quantity surveying', 'construction management', 'real estate',
      'urban and regional planning', 'interior design', 'landscape architecture'
    ],
  },
  {
    domain: 'Agriculture & Food',
    categoryNames: ['Agriculture, Food & Environment', 'KUCCPS Cluster 12: Agriculture, Food Science & Agribusiness'],
    triggerKeywords: [
      'agricultur', 'agribusiness', 'farm', 'horticultur', 'crop', 'soil',
      'veterinar', 'animal science', 'dairy', 'food science', 'forestry'
    ],
    courseKeywords: [
      'agriculture', 'agribusiness', 'horticulture', 'animal health', 'veterinary',
      'food science', 'crop protection', 'soil science', 'agricultural'
    ],
  },
  {
    domain: 'Media & Arts',
    categoryNames: ['Media, Arts & Design', 'KUCCPS Cluster 2: Media, Journalism & Mass Communication'],
    triggerKeywords: [
      'media', 'journalis', 'mass communicat', 'film', 'photograph', 'broadcast',
      'public relation', 'fine art', 'creative writing', 'animation'
    ],
    courseKeywords: [
      'journalism', 'mass communication', 'media studies', 'film production',
      'public relations', 'broadcast', 'communication'
    ],
  },
  {
    domain: 'Pure & Applied Sciences',
    categoryNames: ['Pure & Applied Sciences', 'KUCCPS Cluster 11: Biological & Physical Sciences'],
    triggerKeywords: [
      'biochem', 'chemist', 'physic', 'biolog', 'statistics', 'geolog', 'meteorolog',
      'biotech', 'mathematics', 'actuarial'
    ],
    courseKeywords: [
      'biochemistry', 'chemistry', 'physics', 'analytical chemistry', 'industrial chemistry',
      'applied statistics', 'microbiology', 'geology', 'meteorology', 'biotechnology'
    ],
  },
];

/**
 * Calculates an alignment score for a course against a student's profile
 */
export function calculateCourseInterestScore<T extends {
  programmeName: string;
  category?: string;
  programmeCluster?: string;
  isFieldMatch?: boolean;
  matchScore?: number;
}>(
  course: T,
  assessment: InterestRankingAssessment
): number {
  let score = 0;

  const intendedStr = (assessment.intendedCourse || '').toLowerCase().trim();
  const hobbiesArr = (assessment.hobbies || []).map(h => h.toLowerCase().trim());
  const otherHobbyStr = (assessment.otherHobby || '').toLowerCase().trim();
  const allUserText = `${intendedStr} ${hobbiesArr.join(' ')} ${otherHobbyStr}`.toLowerCase();

  const courseName = (course.programmeName || '').toLowerCase();
  const courseCat = (course.category || '').toLowerCase();
  const courseCluster = (course.programmeCluster || '').toLowerCase();

  // 1. DIRECT INTENDED COURSE MATCHING
  const isUndecided = !intendedStr || intendedStr.includes("i don't know") || intendedStr === 'undecided';

  if (!isUndecided) {
    // If user intended exact course name substring match
    if (courseName.includes(intendedStr) || intendedStr.includes(courseName)) {
      score += 600;
    }

    // Split multiple intended choices (e.g. "Computer Science, Software Engineering")
    const individualChoices = intendedStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    for (const choice of individualChoices) {
      if (courseName.includes(choice) || choice.includes(courseName)) {
        score += 500;
      }
      
      // Token match
      const tokens = choice.split(/\s+/).filter(t => t.length > 2 && !['and', 'for', 'the', 'with'].includes(t));
      let matchedTokens = 0;
      for (const tok of tokens) {
        if (courseName.includes(tok)) matchedTokens++;
      }
      if (matchedTokens > 0) {
        score += (matchedTokens / tokens.length) * 350;
      }
    }
  }

  // 2. DOMAIN & CATEGORY HARMONY MATCHING
  for (const rule of DOMAIN_RULES) {
    // Check if user's text triggered this domain
    const isDomainTriggered = rule.triggerKeywords.some(kw => allUserText.includes(kw));

    if (isDomainTriggered) {
      // Check if course belongs to this domain
      const isCourseInDomainCat = rule.categoryNames.some(cn => 
        courseCat.includes(cn.toLowerCase()) || 
        courseCluster.includes(cn.toLowerCase())
      );

      if (isCourseInDomainCat) {
        score += 250;
      }

      // Check course keywords
      for (const ckw of rule.courseKeywords) {
        if (courseName.includes(ckw)) {
          score += 150;
          break; // Avoid infinite stacking within same rule
        }
      }
    }
  }

  // 3. HOBBY / FIELD MATCH
  if (course.isFieldMatch) {
    score += 80;
  }

  // 4. Base recommendation engine match score
  if (typeof course.matchScore === 'number') {
    score += Math.min(50, course.matchScore * 0.2);
  }

  return score;
}

/**
 * Sorts any list of programmes by student interest, guaranteeing that chosen fields
 * (like Computing, Medicine, Engineering, etc.) occupy top ranks.
 */
export function rankProgrammesByStudentInterest<T extends {
  programmeName: string;
  category?: string;
  programmeCluster?: string;
  isFieldMatch?: boolean;
  matchScore?: number;
}>(
  programmes: T[],
  assessment: InterestRankingAssessment
): T[] {
  if (!programmes || programmes.length <= 1) return programmes || [];

  return [...programmes].sort((a, b) => {
    const scoreA = calculateCourseInterestScore(a, assessment);
    const scoreB = calculateCourseInterestScore(b, assessment);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    // Stable tie-breaker: isFieldMatch, then matchScore
    if (a.isFieldMatch && !b.isFieldMatch) return -1;
    if (!a.isFieldMatch && b.isFieldMatch) return 1;
    return (b.matchScore || 0) - (a.matchScore || 0);
  });
}
