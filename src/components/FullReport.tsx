import React, { useState, useEffect, useMemo } from 'react';
import { 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  GraduationCap, 
  Compass, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Layers,
  Award,
  Target,
  Copy,
  Check,
  FileDown,
  Loader2,
  Info,
  Phone,
  Filter,
  X,
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  ChevronLeft,
  Bookmark,
  ListChecks,
  Plus,
  Trash2,
  CheckSquare
} from 'lucide-react';
import { StudentAssessment, ProgrammeEligibilityResult, ProgrammeLevel, Institution } from '../types';
import { generateCareerReportPDF } from '../lib/pdfGenerator';
import { isGradeEqualOrHigher } from '../lib/clusterCalculator';
import { ALL_514_KENYAN_INSTITUTIONS } from '../data/kenyanInstitutions';
import { runFullCareerAssessment } from '../lib/recommendationEngine';
import { INITIAL_PROGRAMMES } from '../data/kuccpsData';
import { calculateCourseInterestScore } from '../lib/interestRanking';

export type KuccpsSlot = 'Choice 1a' | 'Choice 1b' | 'Choice 1c' | 'Choice 2' | 'Choice 3' | 'Choice 4';

export interface KuccpsStudentChoice {
  slot: KuccpsSlot;
  institutionName: string;
  institutionCode: string;
  institutionType?: string;
  county: string;
  programmeName: string;
  programmeLevel: string;
  historicalCutoff?: number;
  studentEstimatedPoints?: number;
  eligibilityText?: string;
  addedAt: string;
}

const ALL_47_KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa', 'Homa Bay',
  'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
  'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
  'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River',
  'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

interface FullReportProps {
  assessment: StudentAssessment;
  onBackToHome: () => void;
}

export const FullReport: React.FC<FullReportProps> = ({ assessment, onBackToHome }) => {
  const isDegreeEligible = isGradeEqualOrHigher(assessment.meanGrade, 'C+');

  // Discovery Tabs & Filtering State (default to All Qualifying or Degree, prioritizing student's field)
  const [activeTab, setActiveTab] = useState<
    'FIELD_ONLY' | 'ALL_QUALIFYING' | 'DEGREE' | 'DIPLOMA' | 'TVET' | 'COMPETITIVE' | 'ASPIRATIONAL' | 'TOP_RECOMMENDED' | 'OTHER_ONLY' | 'UNMET'
  >(isDegreeEligible ? 'DEGREE' : 'ALL_QUALIFYING');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'FIT' | 'NAME' | 'CLUSTER' | 'GRADE'>('FIT');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number | 'ALL'>(25); // Fast initial render with instant pagination

  // Selected programme for detailed requirements modal
  const [selectedProgramme, setSelectedProgramme] = useState<ProgrammeEligibilityResult | null>(null);

  // Selected institution for interactive campus details & qualifying courses modal
  const [selectedInstitutionModal, setSelectedInstitutionModal] = useState<Institution | null>(null);
  const [campusSearchQuery, setCampusSearchQuery] = useState<string>('');

  // Expanded programme card ID for university cut-off breakdown
  const [expandedProgId, setExpandedProgId] = useState<string | null>(null);

  // Section 5: 514 Institutions & Offerings state
  const [instViewMode, setInstViewMode] = useState<'OFFERINGS' | 'DIRECTORY'>('OFFERINGS');
  const [instTypeFilter, setInstTypeFilter] = useState<string>('ALL');
  const [countyFilter, setCountyFilter] = useState<string>('ALL');
  const [institutionSearch, setInstitutionSearch] = useState<string>('');
  const [instPageSize, setInstPageSize] = useState<number | 'ALL'>(25);
  const [instCurrentPage, setInstCurrentPage] = useState<number>(1);

  // KUCCPS Student Choice state
  const [isChoicesModalOpen, setIsChoicesModalOpen] = useState<boolean>(false);
  const [choicesCopied, setChoicesCopied] = useState<boolean>(false);
  const [assigningItem, setAssigningItem] = useState<{
    institutionName: string;
    institutionCode: string;
    institutionType?: string;
    county: string;
    programmeName: string;
    programmeLevel: string;
    historicalCutoff?: number;
    studentEstimatedPoints?: number;
    eligibilityText?: string;
  } | null>(null);

  // Saved choices persisted per student assessment ID
  const [savedChoices, setSavedChoices] = useState<KuccpsStudentChoice[]>(() => {
    try {
      const stored = localStorage.getItem(`cake_choices_${assessment.id}`);
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return [];
  });

  const handleSaveChoiceSlot = (slot: KuccpsSlot) => {
    if (!assigningItem) return;
    const newChoice: KuccpsStudentChoice = {
      slot,
      institutionName: assigningItem.institutionName,
      institutionCode: assigningItem.institutionCode,
      institutionType: assigningItem.institutionType,
      county: assigningItem.county,
      programmeName: assigningItem.programmeName,
      programmeLevel: assigningItem.programmeLevel,
      historicalCutoff: assigningItem.historicalCutoff,
      studentEstimatedPoints: assigningItem.studentEstimatedPoints,
      eligibilityText: assigningItem.eligibilityText,
      addedAt: new Date().toISOString(),
    };

    setSavedChoices(prev => {
      const filtered = prev.filter(c => c.slot !== slot);
      const updated = [...filtered, newChoice].sort((a, b) => a.slot.localeCompare(b.slot));
      try {
        localStorage.setItem(`cake_choices_${assessment.id}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    setAssigningItem(null);
  };

  const handleRemoveChoice = (slot: KuccpsSlot) => {
    setSavedChoices(prev => {
      const updated = prev.filter(c => c.slot !== slot);
      try {
        localStorage.setItem(`cake_choices_${assessment.id}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleClearAllChoices = () => {
    setSavedChoices([]);
    try {
      localStorage.removeItem(`cake_choices_${assessment.id}`);
    } catch (_) {}
  };

  const handleCopyKuccpsChoices = () => {
    if (savedChoices.length === 0) return;
    const lines = savedChoices.map(c => 
      `${c.slot}: [Code: ${c.institutionCode}] ${c.institutionName} (${c.county}) — ${c.programmeName} (${c.programmeLevel})`
    );
    const text = `KUCCPS Official Application Choices for ${assessment.studentName}:\n\n` + lines.join('\n') + `\n\nGenerated by Career Assistant KE (Ref: ${assessment.id})`;
    navigator.clipboard.writeText(text);
    setChoicesCopied(true);
    setTimeout(() => setChoicesCopied(false), 2000);
  };
  
  // UI Actions
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [aiGuidance, setAiGuidance] = useState<string>(
    assessment.detailedResults?.aiCounselorGuidance || ''
  );
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  let results = assessment.detailedResults;
  if ((!results || !results.eligibleProgrammes) && assessment.subjects && assessment.subjects.length > 0) {
    try {
      const calc = runFullCareerAssessment(
        {
          studentName: assessment.studentName || 'Form Four Graduate',
          studentEmail: assessment.studentEmail,
          studentPhone: assessment.studentPhone,
          kcseYear: assessment.kcseYear || 2025,
          indexNumber: assessment.indexNumber,
          subjects: assessment.subjects,
          hobbies: assessment.hobbies || [],
          otherHobby: assessment.otherHobby,
          intendedCourse: assessment.intendedCourse || "I don't know yet",
        },
        INITIAL_PROGRAMMES
      );
      results = calc.detailedResults;
    } catch (e) {
      console.warn('Fallback career assessment calculation error:', e);
    }
  }

  // Open any of the 514 institutions interactively
  const handleOpenInstitutionModal = (instIdentifier: string | Institution) => {
    if (!instIdentifier) return;
    if (typeof instIdentifier === 'object') {
      setSelectedInstitutionModal(instIdentifier);
      setCampusSearchQuery('');
      return;
    }
    const clean = instIdentifier.toLowerCase().trim();
    const found = ALL_514_KENYAN_INSTITUTIONS.find(i => 
      i.name.toLowerCase() === clean || 
      i.shortName.toLowerCase() === clean || 
      i.code === clean ||
      i.name.toLowerCase().includes(clean) ||
      clean.includes(i.name.toLowerCase())
    );
    if (found) {
      setSelectedInstitutionModal(found);
    } else {
      setSelectedInstitutionModal({
        id: `inst-${Date.now()}`,
        code: 'KUCCPS',
        name: instIdentifier,
        shortName: instIdentifier.split(' ').map(w => w[0]).join('').slice(0, 6) || 'INST',
        type: 'Technical College',
        county: 'Kenya',
        town: 'Kenya'
      });
    }
    setCampusSearchQuery('');
  };

  // Compute all qualifying courses for a specific institution
  const getInstitutionQualifyingCourses = (inst: Institution) => {
    if (!results) return [];
    const list: {
      programmeName: string;
      level: string;
      category: string;
      programmeCode: string;
      cutoffPoints?: number;
      studentScore?: number;
      statusText: string;
      isFieldMatch?: boolean;
      qualifies: boolean;
    }[] = [];

    const instNameLower = inst.name.toLowerCase();
    const instShortLower = inst.shortName ? inst.shortName.toLowerCase() : '';
    const allElig = results.eligibleProgrammes || [];

    allElig.forEach(prog => {
      const match = (prog.institutionsBreakdown || []).find(b => 
        b.institutionName.toLowerCase() === instNameLower ||
        b.institutionName.toLowerCase().includes(instNameLower) ||
        instNameLower.includes(b.institutionName.toLowerCase()) ||
        (b.institutionCode && b.institutionCode === inst.code) ||
        (instShortLower.length > 2 && b.institutionName.toLowerCase().includes(instShortLower))
      );

      if (match) {
        list.push({
          programmeName: prog.programmeName,
          level: prog.level,
          category: prog.category,
          programmeCode: prog.programmeCode,
          cutoffPoints: match.cutoffPoints,
          studentScore: prog.studentEstimatedClusterPoints,
          statusText: match.statusText,
          isFieldMatch: prog.isFieldMatch,
          qualifies: match.status === 'QUALIFIES_ABOVE' || match.status === 'WITHIN_RANGE'
        });
      }
    });

    (results.institutionOfferings || []).forEach(off => {
      if (
        off.institutionName.toLowerCase() === instNameLower ||
        off.institutionName.toLowerCase().includes(instNameLower) ||
        instNameLower.includes(off.institutionName.toLowerCase())
      ) {
        if (!list.some(item => item.programmeName.toLowerCase() === off.programmeName.toLowerCase())) {
          list.push({
            programmeName: off.programmeName,
            level: off.level,
            category: 'Accredited Offering',
            programmeCode: 'KUCCPS',
            cutoffPoints: off.historicalCutoff,
            studentScore: off.studentScore,
            statusText: off.cutoffStatusText,
            isFieldMatch: false,
            qualifies: off.cutoffStatusText.includes('Above Cut-Off') || off.cutoffStatusText.includes('High Placement Chance') || off.cutoffStatusText.includes('Competitive')
          });
        }
      }
    });

    return list;
  };

  // Load AI Career Counselor Guidance if not yet present
  useEffect(() => {
    if (!aiGuidance && assessment.paymentStatus === 'PAID') {
      setIsLoadingAi(true);
      fetch(`/api/assessments/${assessment.id}/ai-explain`, { method: 'POST' })
        .then(res => {
          const ct = res.headers.get('content-type') || '';
          if (res.ok && ct.includes('application/json')) {
            return res.json();
          }
          return null;
        })
        .then(data => {
          if (data && data.guidance) {
            setAiGuidance(data.guidance);
          }
        })
        .catch(err => console.warn('AI guidance check:', err))
        .finally(() => setIsLoadingAi(false));
    }
  }, [assessment.id, assessment.paymentStatus, aiGuidance]);

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 flex items-center justify-center text-slate-800">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Assessment Found</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Your career report requires KCSE grade data to calculate KUCCPS cluster points and course eligibility.
          </p>
          <button
            onClick={onBackToHome}
            className="w-full py-3 px-4 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Start KCSE Career Assessment
          </button>
        </div>
      </div>
    );
  }

  // Base datasets
  const allEligible = results.eligibleProgrammes || [];
  const fieldMatchesList = results.fieldMatchProgrammes || allEligible.filter(p => p.isFieldMatch);
  const otherEligibleList = results.otherEligibleProgrammes || allEligible.filter(p => !p.isFieldMatch);
  const allEvaluations = results.allEvaluations || allEligible;
  const topRecommendations = results.topRecommendations || allEligible.slice(0, 8);
  const competitiveList = results.competitiveProgrammes || allEligible.filter(p => p.level !== 'Degree' || p.cutoffComparison === 'ABOVE_CUTOFF' || p.cutoffComparison === 'WITHIN_RANGE');
  const aspirationalList = results.aspirationalProgrammes || allEligible.filter(p => p.level === 'Degree' && p.cutoffComparison === 'BELOW_CUTOFF');
  const unmetList = allEvaluations.filter(e => e.eligibilityStatus === 'INELIGIBLE');

  // Available categories
  const categories = Array.from(new Set(allEvaluations.map(p => p.category))).sort();

  // Filter programmes based on active tab (memoized for instantaneous tab switching)
  const sourceList = useMemo<ProgrammeEligibilityResult[]>(() => {
    if (activeTab === 'FIELD_ONLY') return fieldMatchesList;
    if (activeTab === 'ALL_QUALIFYING') return allEligible;
    if (activeTab === 'DEGREE') return allEligible.filter(p => p.level === 'Degree');
    if (activeTab === 'DIPLOMA') return allEligible.filter(p => p.level === 'Diploma');
    if (activeTab === 'TVET') return allEligible.filter(p => p.level === 'Certificate' || p.level === 'Artisan' || p.level === 'TVET');
    if (activeTab === 'COMPETITIVE') return competitiveList;
    if (activeTab === 'ASPIRATIONAL') return aspirationalList;
    if (activeTab === 'TOP_RECOMMENDED') return topRecommendations;
    if (activeTab === 'OTHER_ONLY') return otherEligibleList;
    if (activeTab === 'UNMET') return unmetList;
    return allEligible;
  }, [activeTab, fieldMatchesList, allEligible, competitiveList, aspirationalList, topRecommendations, otherEligibleList, unmetList]);

  // Filter by category and search query (memoized)
  const filteredProgrammes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sourceList.filter(prog => {
      const matchesCategory = selectedCategory === 'ALL' || prog.category === selectedCategory;
      const matchesSearch = !q || 
        prog.programmeName.toLowerCase().includes(q) ||
        prog.programmeCode.toLowerCase().includes(q) ||
        prog.category.toLowerCase().includes(q) ||
        (prog.programmeCluster && prog.programmeCluster.toLowerCase().includes(q)) ||
        (prog.matchedFieldNames && prog.matchedFieldNames.some(f => f.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [sourceList, selectedCategory, searchQuery]);

  // Sort: When sorting by 'FIT', strictly prioritize student's chosen career fields & passions
  // e.g. if computing is selected, computing programmes appear first!
  const sortedProgrammes = useMemo(() => {
    return [...filteredProgrammes].sort((a, b) => {
      if (sortBy === 'FIT') {
        const interestA = calculateCourseInterestScore(a, assessment);
        const interestB = calculateCourseInterestScore(b, assessment);
        if (interestB !== interestA) {
          return interestB - interestA;
        }
        if (a.isFieldMatch && !b.isFieldMatch) return -1;
        if (!a.isFieldMatch && b.isFieldMatch) return 1;
        return b.matchScore - a.matchScore;
      }
      if (sortBy === 'NAME') return a.programmeName.localeCompare(b.programmeName);
      if (sortBy === 'CLUSTER') {
        const scoreA = a.studentEstimatedClusterPoints || 0;
        const scoreB = b.studentEstimatedClusterPoints || 0;
        return scoreB - scoreA;
      }
      return 0;
    });
  }, [filteredProgrammes, sortBy, assessment]);

  // Pagination & Display limit (allows viewing 25, 50, 100, or ALL without freezing the UI)
  const totalPages = pageSize === 'ALL' ? 1 : (Math.ceil(sortedProgrammes.length / pageSize) || 1);
  const paginatedProgrammes = pageSize === 'ALL'
    ? sortedProgrammes
    : sortedProgrammes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when tab or filters change
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // 514 Directory & Offerings Filtering
  const filteredOfferings = (results.institutionOfferings || []).filter(item => {
    const matchesCounty = countyFilter === 'ALL' || item.county.toLowerCase() === countyFilter.toLowerCase();
    const matchesType = instTypeFilter === 'ALL' || item.type === instTypeFilter;
    const q = institutionSearch.toLowerCase().trim();
    const matchesSearch = !q || 
      item.institutionName.toLowerCase().includes(q) ||
      item.programmeName.toLowerCase().includes(q) ||
      item.county.toLowerCase().includes(q);
    return matchesCounty && matchesType && matchesSearch;
  });

  const filteredDirectoryInstitutions = ALL_514_KENYAN_INSTITUTIONS.filter(inst => {
    const matchesCounty = countyFilter === 'ALL' || inst.county.toLowerCase() === countyFilter.toLowerCase();
    const matchesType = instTypeFilter === 'ALL' || inst.type === instTypeFilter;
    const q = institutionSearch.toLowerCase().trim();
    const matchesSearch = !q || 
      inst.name.toLowerCase().includes(q) ||
      inst.shortName.toLowerCase().includes(q) ||
      inst.code.includes(q) ||
      inst.town.toLowerCase().includes(q) ||
      inst.county.toLowerCase().includes(q);
    return matchesCounty && matchesType && matchesSearch;
  });

  const activeInstitutionsCount = instViewMode === 'OFFERINGS' ? filteredOfferings.length : filteredDirectoryInstitutions.length;
  const instTotalPages = instPageSize === 'ALL' ? 1 : (Math.ceil(activeInstitutionsCount / instPageSize) || 1);

  const paginatedOfferings = instPageSize === 'ALL'
    ? filteredOfferings
    : filteredOfferings.slice((instCurrentPage - 1) * instPageSize, instCurrentPage * instPageSize);

  const paginatedDirectory = instPageSize === 'ALL'
    ? filteredDirectoryInstitutions
    : filteredDirectoryInstitutions.slice((instCurrentPage - 1) * instPageSize, instCurrentPage * instPageSize);

  // 1. Direct PDF Download using jsPDF
  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      generateCareerReportPDF(assessment);
    } catch (err) {
      console.error('PDF generation error, downloading styled document:', err);
      handleDownloadHTML();
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 600);
    }
  };

  // 2. Direct standalone HTML Document Download / Print
  const handleDownloadHTML = () => {
    const dateStr = new Date(assessment.createdAt).toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const recommendationsHtml = allEligible.map(p => {
      const isDegree = p.level === 'Degree';
      const scoreBadge = isDegree && p.studentEstimatedClusterPoints !== undefined
        ? `<div style="font-size: 13px; color: #0284c7; font-weight: bold;">Your Est. Cluster: ${p.studentEstimatedClusterPoints.toFixed(3)} · ${p.cutoffStatusText}</div>`
        : `<div style="font-size: 13px; color: #059669; font-weight: bold;">Min Mean Grade: ${p.programmeMinimumMeanGrade} (Eligible) · Placement based on KCSE Mean Grade</div>`;

      return `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #fafafa;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">
            ${p.programmeCode} · ${p.level} · ${p.category}
          </div>
          <div style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 4px 0;">
            ${p.programmeName}
          </div>
          <div style="font-size: 13px; color: #334155; margin-bottom: 8px;">
            ${p.recommendedReason}
          </div>
          ${scoreBadge}
        </div>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Career Assistant KE - Report for ${assessment.studentName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #ffffff; padding: 32px; max-width: 800px; margin: 0 auto; line-height: 1.5; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .ref { font-size: 11px; font-family: monospace; color: #475569; text-align: right; }
          .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
          .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 12px; }
          .metric-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
          .metric-val { font-size: 20px; font-weight: bold; color: #0284c7; }
          .section-title { font-size: 15px; font-weight: 700; text-transform: uppercase; color: #0f172a; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
          .disclaimer { font-size: 11px; color: #64748b; background: #f1f5f9; padding: 12px; border-radius: 6px; margin-top: 32px; }
          .support-footer { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 14px; border-radius: 8px; margin-top: 24px; text-align: center; color: #065f46; font-weight: 600; font-size: 14px; }
          @media print { body { padding: 0; } button { display: none; } }
        </style>
      </head>
      <body>
        <div style="text-align: right; margin-bottom: 16px;">
          <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            Print Document
          </button>
        </div>
        <div class="header">
          <div>
            <div class="title">Career Assistant KE</div>
            <div class="subtitle">Official Personalized KUCCPS Career Report</div>
          </div>
          <div class="ref">
            <div>Ref: <strong>${assessment.id}</strong></div>
            <div>KCSE Year: <strong>${assessment.kcseYear}</strong></div>
            <div>Date: ${dateStr}</div>
          </div>
        </div>

        <div class="card">
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">Candidate: ${assessment.studentName}</div>
          <div style="font-size: 12px; color: #64748b;">KNEC 7-Subject Criteria Verified Profile</div>
          <div class="metric-grid">
            <div class="metric-box">
              <div style="font-size: 11px; color: #64748b;">Mean Grade</div>
              <div class="metric-val">${assessment.meanGrade}</div>
              <div style="font-size: 11px; color: #64748b;">${assessment.totalAggregate}/84 pts</div>
            </div>
            <div class="metric-box">
              <div style="font-size: 11px; color: #64748b;">Est. Cluster Points</div>
              <div class="metric-val">${assessment.studentEstimatedClusterPoints.toFixed(3)}</div>
              <div style="font-size: 10px; color: #64748b;">Degree Weighted Formula</div>
            </div>
            <div class="metric-box">
              <div style="font-size: 11px; color: #64748b;">Degree Matches</div>
              <div class="metric-val">${allEligible.filter(p => p.level === 'Degree').length}</div>
              <div style="font-size: 11px; color: #64748b;">Academically Eligible</div>
            </div>
            <div class="metric-box">
              <div style="font-size: 11px; color: #64748b;">Total Qualifying</div>
              <div class="metric-val" style="color: #059669;">${allEligible.length}</div>
              <div style="font-size: 11px; color: #64748b;">Programmes Evaluated</div>
            </div>
          </div>
        </div>

        <div class="section-title">All Confirmed Qualifying Programmes (${allEligible.length})</div>
        <div>
          ${recommendationsHtml}
        </div>

        <div class="disclaimer">
          <strong>Important Information & Placement Disclaimer:</strong><br />
          Career Assistant KE is an independent career guidance platform and is not KUCCPS. Programme requirements and historical cut-offs reflect published data for the 2024/2025 placement cycle. Final admission decisions are determined solely by KUCCPS based on national applicant performance and institutional capacities.
        </div>

        <div class="support-footer">
          If you'll need any assistance with applying any school text/call <a href="tel:0117334197" style="color: #065f46; text-decoration: underline;">0117334197</a>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (assessment.studentName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Career_Assistant_KE_Report_${cleanName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `*Career Assistant KE - Career Report*\nCandidate: ${assessment.studentName} (KCSE ${assessment.kcseYear})\nMean Grade: ${assessment.meanGrade} (${assessment.totalAggregate}/84 pts)\nEstimated Cluster Points: ${assessment.studentEstimatedClusterPoints.toFixed(3)}\nQualifying Degree Courses: ${allEligible.filter(p => p.level === 'Degree').length}\nTotal Qualifying Options: ${allEligible.length}\nTop Matches: ${topRecommendations.slice(0, 4).map(p => p.programmeName).join(', ')}\nRef: ${assessment.id}\n\nAssistance with applying any school text/call 0117334197`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs no-print">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsChoicesModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors shadow-xs"
              title="View and manage your official KUCCPS Choices (Choice 1a, 1b, 1c, 2, 3, 4)"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-100" />
              <span>My KUCCPS Choices ({savedChoices.length}/6)</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              title="Copy WhatsApp Summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Share WhatsApp'}</span>
            </button>

            <button
              onClick={handleDownloadHTML}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              title="Download standalone HTML document"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>HTML Report</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50"
              title="Download official PDF report file"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Official Report Branding Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs print-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-sky-600 mb-1">
                <Compass className="w-5 h-5" />
                <span className="text-sm font-bold tracking-wider uppercase">Career Assistant KE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Your Comprehensive Career Report
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Grounded in Official KUCCPS Placement Standards & Kenya Certificate of Secondary Education (KCSE)
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 font-mono">
              <div>Ref: <span className="text-sky-600 font-semibold">{assessment.id}</span></div>
              <div>Issued: {new Date(assessment.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <div className="text-emerald-600 font-semibold mt-1">✓ Complete Career Report Unlocked</div>
            </div>
          </div>

          {/* Student Profile Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Candidate</div>
              <div className="text-sm font-bold text-slate-900 truncate">{assessment.studentName}</div>
              <div className="text-[11px] text-slate-400 font-mono">KCSE {assessment.kcseYear}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">KCSE Mean Grade</div>
              <div className="text-xl font-bold text-slate-900 font-mono">{assessment.meanGrade}</div>
              <div className="text-[11px] text-slate-400 font-mono">{assessment.totalAggregate}/84 Aggregate</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Est. Cluster Points</div>
              <div className="text-xl font-bold text-sky-600 font-mono tabular-nums">
                {assessment.studentEstimatedClusterPoints.toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-400">Degrees Only (Max 48.0)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Degrees Qualifying</div>
              <div className="text-xl font-bold text-emerald-600 font-mono">
                {allEligible.filter(p => p.level === 'Degree').length}
              </div>
              <div className="text-[10px] text-slate-400">All Prereqs Met</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Total Qualifying</div>
              <div className="text-xl font-bold text-teal-600 font-mono">
                {allEligible.length}
              </div>
              <div className="text-[10px] text-slate-400">Across All Fields</div>
            </div>
          </div>
        </div>

        {/* SECTION 1: INTENDED COURSE ANALYSIS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs print-card">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-600" />
            <span>Intended Course Analysis</span>
          </h2>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Target Course</span>
                <div className="text-lg font-bold text-slate-900">
                  {results.intendedCourseAnalysis.courseName}
                </div>
              </div>

              <div>
                {results.intendedCourseAnalysis.status === 'STRONG_MATCH' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Meets Published Minimum Requirements
                  </span>
                ) : results.intendedCourseAnalysis.status === 'ELIGIBLE_ALTERNATIVE_SUGGESTED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Prerequisites Missing · Alternative Recommended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
                    Open Exploration
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {results.intendedCourseAnalysis.recommendationNote}
            </p>

            {results.intendedCourseAnalysis.missingRequirements.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1.5">
                  Missing Prerequisites:
                </span>
                <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                  {results.intendedCourseAnalysis.missingRequirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: AI CAREER COUNSELOR GUIDANCE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs print-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>Personalized Counselor Guidance</span>
            </h2>
            <span className="text-[11px] text-slate-500">KUCCPS Strategic Advisory</span>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            {isLoadingAi ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Synthesizing personalized academic mentorship summary...
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                {aiGuidance}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: COMPREHENSIVE COURSE DISCOVERY (NO ARTIFICIAL LIMIT) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs print-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-5 h-5 text-sky-600" />
                <span>Comprehensive Course Discovery ({sortedProgrammes.length} Available)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Explore every programme in the database evaluated against your KCSE results. No arbitrary limits.
              </p>
            </div>

            {/* Quick Count Indicators */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-mono font-semibold">
                {allEligible.filter(p => p.level === 'Degree').length} Degrees
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
                {allEligible.filter(p => p.level === 'Diploma').length} Diplomas
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-mono font-semibold">
                {allEligible.filter(p => p.level === 'Certificate' || p.level === 'Artisan').length} TVET Certs
              </span>
            </div>
          </div>

          {/* C+ University Direct Qualification Banner */}
          {isDegreeEligible && (
            <div className="no-print mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-slate-50 border border-sky-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Direct KUCCPS Degree Placement Qualified</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Mean Grade: {assessment.meanGrade} ({assessment.totalAggregate}/84 pts)
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                      You Qualify for {allEligible.filter(p => p.level === 'Degree').length} University Degree Programmes!
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                      A KCSE Mean Grade of C+ and above meets the official national threshold for direct university degree placement. Every degree matching your prerequisites and weighted cluster points is listed below with no artificial caps.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleTabChange('DEGREE');
                      setPageSize('ALL');
                      setSelectedCategory('ALL');
                    }}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View All {allEligible.filter(p => p.level === 'Degree').length} Degrees (No Limits)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Discovery Tabs */}
          <div className="no-print flex flex-wrap gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-xl mb-4 text-xs font-semibold">
            {fieldMatchesList.length > 0 && (
              <button
                onClick={() => handleTabChange('FIELD_ONLY')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'FIELD_ONLY' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>In Your Field</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'FIELD_ONLY' ? 'bg-emerald-700 text-white' : 'bg-emerald-200/80 text-emerald-800'}`}>
                  {fieldMatchesList.length}
                </span>
              </button>
            )}

            <button
              onClick={() => handleTabChange('ALL_QUALIFYING')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'ALL_QUALIFYING' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Qualifying</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'ALL_QUALIFYING' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'}`}>{allEligible.length}</span>
            </button>

            <button
              onClick={() => handleTabChange('DEGREE')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'DEGREE' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Degree Programmes</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'DEGREE' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {allEligible.filter(p => p.level === 'Degree').length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('DIPLOMA')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'DIPLOMA' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Diploma Programmes</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'DIPLOMA' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {allEligible.filter(p => p.level === 'Diploma').length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('TVET')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'TVET' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Certificate & Artisan</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'TVET' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {allEligible.filter(p => p.level === 'Certificate' || p.level === 'Artisan' || p.level === 'TVET').length}
              </span>
            </button>

            {otherEligibleList.length > 0 && (
              <button
                onClick={() => handleTabChange('OTHER_ONLY')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'OTHER_ONLY' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Other Qualified Fields</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'OTHER_ONLY' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}>{otherEligibleList.length}</span>
              </button>
            )}

            <button
              onClick={() => handleTabChange('COMPETITIVE')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'COMPETITIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Competitive Options</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'COMPETITIVE' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>{competitiveList.length}</span>
            </button>

            <button
              onClick={() => handleTabChange('ASPIRATIONAL')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'ASPIRATIONAL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Aspirational Options</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'ASPIRATIONAL' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>{aspirationalList.length}</span>
            </button>

            <button
              onClick={() => handleTabChange('TOP_RECOMMENDED')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'TOP_RECOMMENDED' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Personalized Matches</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'TOP_RECOMMENDED' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'}`}>{topRecommendations.length}</span>
            </button>

            <button
              onClick={() => handleTabChange('UNMET')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'UNMET' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Prerequisites Review</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'UNMET' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}>{unmetList.length}</span>
            </button>
          </div>

          {/* Category Filter Chips for Fast Browsing */}
          <div className="no-print flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-thin">
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Fields ({sourceList.length})
            </button>
            {categories.map(cat => {
              const count = sourceList.filter(p => p.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Search, Filter & Display Limit Toolbar */}
          <div className="no-print bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by course name or code..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Discovery Fields ({categories.length})</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Sorting Dropdown */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  <option value="FIT">Sort by: Best Personal Match</option>
                  <option value="CLUSTER">Sort by: Highest Cluster Points</option>
                  <option value="NAME">Sort by: Programme Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* View Limits Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-200 text-xs text-slate-500">
              <div>
                Showing <strong className="text-slate-900">{sortedProgrammes.length === 0 ? 0 : paginatedProgrammes.length}</strong> of{' '}
                <strong className="text-sky-600 font-bold">{sortedProgrammes.length}</strong> qualifying programmes
                {pageSize === 'ALL' && (
                  <span className="text-emerald-700 font-semibold ml-2">✓ All Choices Displayed Without Limits</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span className="text-slate-500 text-[11px]">Show Per Page:</span>
                {[25, 50, 100].map(sz => (
                  <button
                    key={sz}
                    onClick={() => {
                      setPageSize(sz);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      pageSize === sz
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setPageSize('ALL');
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    pageSize === 'ALL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  All ({sortedProgrammes.length})
                </button>
              </div>
            </div>
          </div>

          {/* Programme Cards List */}
          <div className="space-y-4">
            {paginatedProgrammes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No programmes match your current filters. Try changing the category filter or searching with different terms.
              </div>
            ) : (() => {
              const firstOtherIdx = paginatedProgrammes.findIndex(
                (p, idx) => !p.isFieldMatch && idx > 0 && paginatedProgrammes[idx - 1]?.isFieldMatch
              );
              const anyFieldMatches = paginatedProgrammes.some(p => p.isFieldMatch);

              return paginatedProgrammes.map((prog, pIdx) => {
                const isDegree = prog.level === 'Degree';
                const cutoff = prog.programmeHistoricalCutoffs?.['2024/2025'];
                const isEligible = prog.eligibilityStatus === 'ELIGIBLE';

                return (
                  <React.Fragment key={prog.programmeId}>
                    {/* Highlight Section Header for Field Matches */}
                    {pIdx === 0 && prog.isFieldMatch && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 mb-2 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              Targeted Choices: Programmes in Your Chosen Fields & Interests
                            </h4>
                            <p className="text-xs text-slate-600">
                              Displayed first based on your passions: <strong className="text-emerald-800">{(assessment.hobbies || []).slice(0, 4).join(', ') || assessment.intendedCourse || 'Selected Career Disciplines'}</strong>
                            </p>
                          </div>
                          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {paginatedProgrammes.filter(p => p.isFieldMatch).length} In Your Field
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Section Header Divider for Other Eligible Programmes */}
                    {pIdx === firstOtherIdx && (
                      <div className="pt-6 pb-2 border-t-2 border-slate-200 mt-6 mb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              Other Approved Programmes You Qualify For Across Kenya
                            </h4>
                            <p className="text-xs text-slate-600">
                              All additional accredited degrees and diplomas where your KCSE mean grade and subject requirements meet official criteria.
                            </p>
                          </div>
                          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
                            {paginatedProgrammes.filter(p => !p.isFieldMatch).length} Other Courses
                          </span>
                        </div>
                      </div>
                    )}

                    <div
                      className={`p-5 rounded-xl border transition-all ${
                        isEligible 
                          ? prog.isFieldMatch
                            ? 'bg-white border-emerald-300 hover:border-emerald-400 shadow-xs ring-1 ring-emerald-100'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs' 
                          : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      {/* Prominent Field Match Badge */}
                      {prog.isFieldMatch && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>In Your Field: {prog.fieldMatchReason || 'Direct Match for Your Selected Interests'}</span>
                          </span>
                          {prog.matchedFieldNames && prog.matchedFieldNames.map((fn, fIdx) => (
                            <span key={fIdx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white text-emerald-800 border border-emerald-200">
                              {fn}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div>
                          {/* Distinct Level & Cluster tags */}
                          <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5">
                            <span className="font-mono text-sky-600 font-bold">{prog.programmeCode}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isDegree 
                                ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                                : prog.level === 'Diploma'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {prog.level}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-slate-500">{prog.category}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-slate-500">{prog.programmeCluster}</span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors">
                            {prog.programmeName}
                          </h3>
                        </div>

                        {/* Explicit Score Box: Degree Cluster vs TVET Mean Grade */}
                        <div className="text-left sm:text-right shrink-0 bg-slate-50 border border-slate-200 p-2.5 rounded-lg min-w-[190px]">
                          {isDegree && prog.studentEstimatedClusterPoints !== undefined ? (
                            <>
                              <div className="text-[11px] text-slate-500 font-medium">Your Estimated Cluster</div>
                              <div className="text-lg font-bold text-sky-600 font-mono tabular-nums">
                                {prog.studentEstimatedClusterPoints.toFixed(3)} pts
                              </div>
                              {prog.minInstitutionCutoff !== undefined && prog.maxInstitutionCutoff !== undefined && (
                                <div className="text-[10px] text-slate-600 mt-0.5">
                                  Cut-offs: <span className="font-mono text-slate-900 font-semibold">{prog.minInstitutionCutoff.toFixed(1)} – {prog.maxInstitutionCutoff.toFixed(1)}</span> pts
                                </div>
                              )}
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                (Varies across {prog.institutionCount} universities)
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-[11px] text-slate-500 font-medium">Programme Entry Basis</div>
                              <div className="text-sm font-bold text-emerald-700">
                                Min Mean Grade: {prog.programmeMinimumMeanGrade}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                No cluster points for {prog.level}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {prog.recommendedReason}
                      </p>

                      {/* University Qualification Context Highlights */}
                      {isDegree && (
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-500">
                            Offered at <strong className="text-slate-900">{prog.institutionCount} Universities</strong>:
                          </span>
                          {prog.qualifyingInstitutionsCount !== undefined && prog.qualifyingInstitutionsCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>You qualify at {prog.qualifyingInstitutionsCount} of {prog.institutionCount} universities</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Competitive margin below historical cut-offs</span>
                            </span>
                          )}
                          {prog.minInstitutionCutoff !== undefined && prog.maxInstitutionCutoff !== undefined && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                              Cut-Off Range: {prog.minInstitutionCutoff.toFixed(1)} – {prog.maxInstitutionCutoff.toFixed(1)} pts
                            </span>
                          )}
                        </div>
                      )}

                      {/* Breakdown of requirements and interactive university cutoffs toggle */}
                      <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs text-slate-500 items-center">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Min Mean Grade</span>
                          <strong className="text-slate-900 font-mono">{prog.programmeMinimumMeanGrade}</strong>
                          <span className="text-slate-500 text-[11px]"> (You: {assessment.meanGrade})</span>
                        </div>

                        <div className="sm:col-span-2">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Required Subjects</span>
                          <div className="text-slate-700 text-[11px] truncate">
                            {prog.programmeSubjectRequirements.length > 0 
                              ? prog.programmeSubjectRequirements.map(r => `${r.subject} (${r.minGrade})`).join(', ')
                              : 'Open prerequisite'}
                          </div>
                        </div>

                        <div className="sm:text-right flex items-center justify-end gap-3">
                          <button
                            onClick={() => setExpandedProgId(expandedProgId === prog.programmeId ? null : prog.programmeId)}
                            className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{expandedProgId === prog.programmeId ? 'Hide Universities' : `University Cut-Offs (${prog.institutionCount})`}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedProgId === prog.programmeId ? 'rotate-180' : ''}`} />
                          </button>
                          <button
                            onClick={() => setSelectedProgramme(prog)}
                            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                          >
                            <span>Full Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Institution Breakdown Table */}
                      {expandedProgId === prog.programmeId && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                              <Building2 className="w-4 h-4 text-sky-600" />
                              <span>University Cut-Off Comparison for this Course</span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {isDegree ? 'Different universities have different cluster cut-offs for this course' : 'Admissions based on KCSE Mean Grade'}
                            </span>
                          </div>

                          {isDegree && (
                            <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-900 flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                              <span>
                                <strong>KUCCPS Insight:</strong> In Kenya, cut-off points for the same degree (e.g. {prog.programmeName}) vary from university to university based on capacity and applicant demand. A student may not meet the cut-off at University of Nairobi or JKUAT, but qualify comfortably at Dedan Kimathi, Masinde Muliro, or Kisii University!
                              </span>
                            </div>
                          )}

                          <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                                  <th className="py-2 px-3">University</th>
                                  <th className="py-2 px-3">County</th>
                                  <th className="py-2 px-3">2024 Cut-Off</th>
                                  {isDegree && <th className="py-2 px-3">Your Score</th>}
                                  <th className="py-2 px-3">Status & Margin</th>
                                  <th className="py-2 px-3 text-right">KUCCPS Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {(prog.institutionsBreakdown || []).map((inst, iIdx) => {
                                  const qualifies = inst.status === 'QUALIFIES_ABOVE';
                                  const withinRange = inst.status === 'WITHIN_RANGE';
                                  return (
                                    <tr key={iIdx} className="hover:bg-slate-50 transition-colors">
                                      <td className="py-2 px-3">
                                        <button
                                          onClick={() => handleOpenInstitutionModal(inst.institutionName)}
                                          className="font-semibold text-slate-900 hover:text-sky-600 text-left transition-colors flex items-center gap-1 group cursor-pointer"
                                        >
                                          <span>{inst.institutionName}</span>
                                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 opacity-60 group-hover:opacity-100" />
                                        </button>
                                        <span className="block text-[10px] text-slate-500 font-normal">{inst.type}</span>
                                      </td>
                                      <td className="py-2 px-3 text-slate-600">{inst.county}</td>
                                      <td className="py-2 px-3 font-mono font-semibold text-sky-700">
                                        {inst.cutoffPoints ? `${inst.cutoffPoints} pts` : 'Mean Grade'}
                                      </td>
                                      {isDegree && (
                                        <td className="py-2 px-3 font-mono text-slate-900">
                                          {prog.studentEstimatedClusterPoints?.toFixed(3)}
                                        </td>
                                      )}
                                      <td className="py-2 px-3">
                                        {qualifies ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <Check className="w-3 h-3 text-emerald-600" />
                                            <span>{inst.statusText}</span>
                                          </span>
                                        ) : withinRange ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                                            <span>{inst.statusText}</span>
                                          </span>
                                        ) : inst.status === 'BELOW_CUTOFF' ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                            <span>{inst.statusText}</span>
                                          </span>
                                        ) : (
                                          <span className="text-[11px] text-slate-600">{inst.statusText}</span>
                                        )}
                                      </td>
                                      <td className="py-2 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            onClick={() => handleOpenInstitutionModal(inst.institutionName)}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                                            title="View campus profile and all courses you qualify for here"
                                          >
                                            <Building2 className="w-3 h-3 text-sky-600" />
                                            <span className="hidden sm:inline">Campus Info</span>
                                          </button>
                                          <button
                                            onClick={() => setAssigningItem({
                                              institutionName: inst.institutionName,
                                              institutionCode: inst.institutionCode,
                                              institutionType: inst.type,
                                              county: inst.county,
                                              programmeName: prog.programmeName,
                                              programmeLevel: prog.level,
                                              historicalCutoff: inst.cutoffPoints,
                                              studentEstimatedPoints: prog.studentEstimatedClusterPoints,
                                              eligibilityText: inst.statusText,
                                            })}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold transition-colors shadow-xs cursor-pointer"
                                            title="Assign to Choice 1a, 1b, 1c, 2, 3, or 4"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Add Choice</span>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              });
            })()}
          </div>

          {/* End of List or Pagination Controls */}
          {pageSize === 'ALL' && sortedProgrammes.length > 10 ? (
            <div className="no-print mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All <strong className="text-slate-900">{sortedProgrammes.length}</strong> qualifying programmes displayed without limits.</span>
            </div>
          ) : typeof pageSize === 'number' && totalPages > 1 ? (
            <div className="no-print mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedProgrammes.length)} of {sortedProgrammes.length} programmes
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded-md font-medium font-mono text-xs ${
                      currentPage === p 
                        ? 'bg-sky-600 text-white font-bold' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* SECTION 4: ALTERNATIVE PATHWAYS & TVET BRIDGES */}
        {results.alternativePathways && results.alternativePathways.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs print-card">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>Alternative Pathways & Stepping Stones</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Official Kenyan TVET progression routes enabling direct qualification for National Polytechnic diplomas and university credit transfer.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.alternativePathways.map((alt, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {alt.level}
                    </span>
                    <span className="text-xs text-slate-500">{alt.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{alt.programmeName}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{alt.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: MASTER REGISTRY OF ALL 514 VERIFIED KENYAN INSTITUTIONS & CHOICES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs print-card space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                  National Tertiary Registry
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  514 Verified Kenyan Institutions
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-700 bg-slate-100 border border-slate-200">
                  47 of 47 Counties
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                <span>Verified Kenyan Institutions & Placement Choices</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                All 514 approved Kenyan tertiary institutions are verified placement choices for your KUCCPS application. Browse by county, filter by institution category, view historical cut-offs, and assemble your official choices below.
              </p>
            </div>

            <div className="no-print shrink-0 flex items-center gap-2">
              <button
                onClick={() => setIsChoicesModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-emerald-100" />
                <span>My KUCCPS Choices ({savedChoices.length}/6)</span>
              </button>
            </div>
          </div>

          {/* Quick Institutional Category Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-base font-bold text-sky-600 font-mono">42</div>
              <div className="text-[11px] text-slate-500">Public Universities</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-base font-bold text-blue-600 font-mono">38</div>
              <div className="text-[11px] text-slate-500">Private Universities</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-base font-bold text-emerald-600 font-mono">33</div>
              <div className="text-[11px] text-slate-500">National Polys</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-base font-bold text-teal-600 font-mono">350</div>
              <div className="text-[11px] text-slate-500">TVCs & Tech Colleges</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-base font-bold text-amber-600 font-mono">35</div>
              <div className="text-[11px] text-slate-500">Teacher Colleges</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-base font-bold text-rose-600 font-mono">16</div>
              <div className="text-[11px] text-slate-500">Medical / Specialized</div>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="no-print flex flex-wrap gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setInstViewMode('OFFERINGS');
                setInstCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                instViewMode === 'OFFERINGS' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Qualified Course Offerings ({filteredOfferings.length})</span>
            </button>
            <button
              onClick={() => {
                setInstViewMode('DIRECTORY');
                setInstCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                instViewMode === 'DIRECTORY' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Complete Directory of All 514 Institutions ({filteredDirectoryInstitutions.length})</span>
            </button>
          </div>

          {/* Institution Type Filter Chips */}
          <div className="no-print flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin text-xs">
            {[
              { id: 'ALL', label: 'All 514 Institutions' },
              { id: 'Public University', label: 'Public Universities (42)' },
              { id: 'Private University', label: 'Private Universities (38)' },
              { id: 'National Polytechnic', label: 'National Polytechnics (33)' },
              { id: 'Technical College', label: 'Technical Colleges / TVCs (350)' },
              { id: 'Teacher Training College', label: 'Teacher Training Colleges (35)' },
              { id: 'Medical College', label: 'Medical Colleges / KMTC (16)' },
            ].map(typeItem => (
              <button
                key={typeItem.id}
                onClick={() => {
                  setInstTypeFilter(typeItem.id);
                  setInstCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  instTypeFilter === typeItem.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {typeItem.label}
              </button>
            ))}
          </div>

          {/* Search, County Filter & Page Size Toolbar */}
          <div className="no-print bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Institution Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={institutionSearch}
                  onChange={(e) => {
                    setInstitutionSearch(e.target.value);
                    setInstCurrentPage(1);
                  }}
                  placeholder="Search 514 institutions by name, town, code..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
                {institutionSearch && (
                  <button 
                    onClick={() => setInstitutionSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* County Filter (All 47 Counties) */}
              <div>
                <select
                  value={countyFilter}
                  onChange={(e) => {
                    setCountyFilter(e.target.value);
                    setInstCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All 47 Kenyan Counties (514 Total)</option>
                  {ALL_47_KENYAN_COUNTIES.map(c => {
                    const countInCounty = ALL_514_KENYAN_INSTITUTIONS.filter(i => i.county.toLowerCase() === c.toLowerCase()).length;
                    return (
                      <option key={c} value={c}>
                        {c} County ({countInCounty} institutions)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Active Results Summary */}
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500">
                <span>Displaying:</span>
                <span className="font-bold text-slate-900 font-mono">{activeInstitutionsCount}</span>
                <span>institutions</span>
              </div>
            </div>

            {/* Pagination Size Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
              <div>
                Showing <strong className="text-slate-900">{instPageSize === 'ALL' ? activeInstitutionsCount : Math.min(activeInstitutionsCount, paginatedOfferings.length || paginatedDirectory.length)}</strong> of <strong className="text-sky-600 font-bold">{activeInstitutionsCount}</strong> available choices
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span className="text-slate-500 text-[11px]">Show Per Page:</span>
                {[25, 50, 100].map(sz => (
                  <button
                    key={sz}
                    onClick={() => {
                      setInstPageSize(sz);
                      setInstCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      instPageSize === sz
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setInstPageSize('ALL');
                    setInstCurrentPage(1);
                  }}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    instPageSize === 'ALL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  All ({activeInstitutionsCount})
                </button>
              </div>
            </div>
          </div>

          {/* Render Mode 1: Qualified Course Offerings Table */}
          {instViewMode === 'OFFERINGS' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 uppercase text-[10px] tracking-wider bg-slate-100">
                    <th className="py-2.5 px-3">Programme</th>
                    <th className="py-2.5 px-3">Institution & Code</th>
                    <th className="py-2.5 px-3">County</th>
                    <th className="py-2.5 px-3">Cut-Off / Entry Basis</th>
                    <th className="py-2.5 px-3">Your Qualification Status</th>
                    <th className="py-2.5 px-3 text-right">KUCCPS Choice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedOfferings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                        No course offerings match your county or search filter. Switch to the "Complete Directory of All 514 Institutions" tab above to see all accredited institutions.
                      </td>
                    </tr>
                  ) : (
                    paginatedOfferings.map((inst, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-[200px] truncate">
                          {inst.programmeName}
                          <span className="block text-[10px] text-slate-500 font-normal">{inst.level}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <button
                            onClick={() => handleOpenInstitutionModal(inst.institutionName)}
                            className="font-semibold text-slate-900 hover:text-sky-600 text-left transition-colors flex items-center gap-1 group cursor-pointer"
                          >
                            <span>{inst.institutionName}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 opacity-60 group-hover:opacity-100" />
                          </button>
                          <span className="block text-[10px] text-slate-500">{inst.type}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{inst.county}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">
                          {inst.historicalCutoff ? `${inst.historicalCutoff} pts` : 'Mean Grade Admission'}
                        </td>
                        <td className="py-2.5 px-3">
                          {inst.cutoffStatusText.includes('Above Cut-Off') || inst.cutoffStatusText.includes('High Placement Chance') ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{inst.cutoffStatusText}</span>
                            </span>
                          ) : inst.cutoffStatusText.includes('Competitive') ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>{inst.cutoffStatusText}</span>
                            </span>
                          ) : inst.cutoffStatusText.includes('Below Cut-Off') ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              <span>{inst.cutoffStatusText}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-600">{inst.cutoffStatusText}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenInstitutionModal(inst.institutionName)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                              title="View this campus details and all other courses you qualify for here"
                            >
                              <Building2 className="w-3 h-3 text-sky-600" />
                              <span className="hidden sm:inline">Campus Offerings</span>
                            </button>
                            <button
                              onClick={() => setAssigningItem({
                                institutionName: inst.institutionName,
                                institutionCode: ALL_514_KENYAN_INSTITUTIONS.find(i => i.name.toLowerCase() === inst.institutionName.toLowerCase())?.code || '101',
                                institutionType: inst.type,
                                county: inst.county,
                                programmeName: inst.programmeName,
                                programmeLevel: inst.level,
                                historicalCutoff: inst.historicalCutoff,
                                studentEstimatedPoints: inst.studentScore,
                                eligibilityText: inst.cutoffStatusText,
                              })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors shadow-xs cursor-pointer"
                              title="Add this institution and course to your KUCCPS 4 choices"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Select Choice</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Render Mode 2: Master Directory of All 514 Verified Kenyan Institutions */}
          {instViewMode === 'DIRECTORY' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 uppercase text-[10px] tracking-wider bg-slate-100">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Institution Name</th>
                    <th className="py-2.5 px-3">Category / Type</th>
                    <th className="py-2.5 px-3">County</th>
                    <th className="py-2.5 px-3">Town / Sub-County</th>
                    <th className="py-2.5 px-3 text-right">KUCCPS Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedDirectory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                        No verified institutions found matching your current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedDirectory.map((inst) => {
                      const isAssigned = savedChoices.some(c => c.institutionName.toLowerCase() === inst.name.toLowerCase());
                      return (
                        <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-sky-600">{inst.code}</td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleOpenInstitutionModal(inst)}
                              className="font-semibold text-slate-900 hover:text-sky-600 text-left transition-colors flex items-center gap-1 group cursor-pointer"
                            >
                              <span>{inst.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 opacity-60 group-hover:opacity-100" />
                            </button>
                            <span className="text-[10px] text-slate-500">{inst.shortName}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inst.type === 'Public University' 
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : inst.type === 'Private University'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : inst.type === 'National Polytechnic'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : inst.type === 'Teacher Training College'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : inst.type === 'Medical College'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                            }`}>
                              {inst.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{inst.county}</td>
                          <td className="py-2.5 px-3 text-slate-500">{inst.town}</td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenInstitutionModal(inst)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                                title="View campus details and all qualifying courses at this institution"
                              >
                                <Building2 className="w-3 h-3 text-sky-600" />
                                <span className="hidden sm:inline">Campus Offerings</span>
                              </button>
                              <button
                                onClick={() => setAssigningItem({
                                  institutionName: inst.name,
                                  institutionCode: inst.code,
                                  institutionType: inst.type,
                                  county: inst.county,
                                  programmeName: isDegreeEligible ? 'Undergraduate Degree Choice' : 'Diploma / Certificate Choice',
                                  programmeLevel: isDegreeEligible ? 'Degree' : 'Diploma',
                                  eligibilityText: `Verified placement institution in ${inst.county}`,
                                })}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-colors shadow-xs cursor-pointer ${
                                  isAssigned 
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                                }`}
                                title="Add this institution to your KUCCPS 4 choices"
                              >
                                {isAssigned ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>In Choices</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Select Choice</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 5 Pagination Navigation */}
          {instPageSize !== 'ALL' && instTotalPages > 1 && (
            <div className="no-print pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200">
              <div>
                Showing {(instCurrentPage - 1) * instPageSize + 1} to {Math.min(instCurrentPage * instPageSize, activeInstitutionsCount)} of {activeInstitutionsCount} institutions
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setInstCurrentPage(p => Math.max(1, p - 1))}
                  disabled={instCurrentPage === 1}
                  className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: Math.min(8, instTotalPages) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setInstCurrentPage(p)}
                    className={`w-7 h-7 rounded-md font-medium font-mono text-xs ${
                      instCurrentPage === p 
                        ? 'bg-sky-600 text-white font-bold' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setInstCurrentPage(p => Math.min(instTotalPages, p + 1))}
                  disabled={instCurrentPage === instTotalPages}
                  className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: MANDATORY PLACEMENT DISCLAIMER */}
        <div className="p-5 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
            <div className="font-semibold text-slate-900">Official Placement & Advisory Disclaimer:</div>
            <p>
              Career Assistant KE is an independent career guidance service and is not affiliated with KUCCPS or the Ministry of Education.
              Estimated weighted cluster points are calculated using available KCSE grades and applicable KUCCPS formula.
              Official KUCCPS weighted cluster points may differ upon national processing.
              Admission to TVET, Diploma, and Certificate courses is governed by KCSE Mean Grade and subject prerequisites, not cluster points.
              Cut-off points shown reflect published data for the 2024/2025 placement cycle.
            </p>
          </div>
        </div>

        {/* SECTION 7: REPORT FOOTER & APPLICATION ASSISTANCE HELPLINE */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-emerald-100 text-emerald-600 mb-1">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Need Help With School Applications?
          </h3>
          <p className="text-sm font-bold text-emerald-700 max-w-xl mx-auto">
            If you'll need any assistance with applying any school text/call 0117334197
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="tel:0117334197"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 0117334197</span>
            </a>
            <a
              href="https://wa.me/254117334197?text=Hello%20Career%20Assistant%20KE,%20I%20need%20assistance%20with%20applying%20for%20courses."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-700 text-xs font-bold transition-colors shadow-xs"
            >
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

      </div>

      {/* DETAILED REQUIREMENTS & INSTITUTIONS MODAL */}
      {selectedProgramme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className="font-mono text-sky-600 font-bold">{selectedProgramme.programmeCode}</span>
                  <span className="text-slate-300">·</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    {selectedProgramme.level}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">{selectedProgramme.category}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedProgramme.programmeName}</h3>
              </div>
              <button
                onClick={() => setSelectedProgramme(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Academic Eligibility Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                1. Academic Prerequisite Verification
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block mb-1">Minimum KCSE Mean Grade</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 font-mono">{selectedProgramme.programmeMinimumMeanGrade}</span>
                    <span className="text-slate-500 text-xs">(Your Grade: {assessment.meanGrade})</span>
                    {selectedProgramme.meetsMeanGrade ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 ml-auto" />
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block mb-1">Status</span>
                  <div className="text-sm font-bold text-slate-900">
                    {selectedProgramme.eligibilityStatus === 'ELIGIBLE' ? (
                      <span className="text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Academically Eligible
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" /> Prerequisites Not Met
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-semibold text-slate-700 mb-2">Subject Requirements Breakdown:</div>
                {selectedProgramme.subjectChecks.length === 0 ? (
                  <div className="text-xs text-slate-500">No subject-specific prerequisites mandated for this programme.</div>
                ) : (
                  <div className="space-y-1.5">
                    {selectedProgramme.subjectChecks.map((sc, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-200 last:border-0">
                        <span className="text-slate-700 font-medium">{sc.subject}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">Required: <strong className="text-slate-900">{sc.requiredGrade}</strong></span>
                          <span className="text-slate-500">You: <strong className="text-slate-900">{sc.studentGrade || 'Not taken'}</strong></span>
                          {sc.passed ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Passed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Below Min
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cluster Calculation Info (Degrees only) */}
            {selectedProgramme.level === 'Degree' && (
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  2. Weighted Cluster Calculation
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cluster Group:</span>
                    <span className="text-slate-900 font-medium">{selectedProgramme.programmeCluster}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Your Estimated Weighted Score:</span>
                    <span className="text-sky-600 font-bold font-mono text-sm">
                      {selectedProgramme.studentEstimatedClusterPoints?.toFixed(3)} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Published 2024/2025 Cut-Off:</span>
                    <span className="text-slate-900 font-bold font-mono">
                      {selectedProgramme.programmeHistoricalCutoffs?.['2024/2025'] || 'Pending release'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                    {selectedProgramme.cutoffStatusText}
                  </div>
                </div>
              </div>
            )}

            {/* University Cut-Off Comparison Table (Different universities have different cluster points) */}
            {selectedProgramme.institutionsBreakdown && selectedProgramme.institutionsBreakdown.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    <span>3. Offering Institutions & Specific Cut-Offs ({selectedProgramme.institutionCount})</span>
                  </h4>
                  {selectedProgramme.level === 'Degree' && selectedProgramme.minInstitutionCutoff !== undefined && (
                    <span className="text-[11px] font-mono text-sky-700 font-semibold">
                      Range: {selectedProgramme.minInstitutionCutoff.toFixed(1)} – {selectedProgramme.maxInstitutionCutoff?.toFixed(1)} pts
                    </span>
                  )}
                </div>

                {selectedProgramme.level === 'Degree' && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Important KUCCPS Rule:</strong> Each university establishes its own cluster cut-off for {selectedProgramme.programmeName} based on applicant competition. You may be below the cut-off for high-demand universities while qualifying comfortably at others.
                  </p>
                )}

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-3">Institution</th>
                        <th className="py-2.5 px-3">County</th>
                        <th className="py-2.5 px-3">2024 Cut-Off</th>
                        {selectedProgramme.level === 'Degree' && <th className="py-2.5 px-3">Your Score</th>}
                        <th className="py-2.5 px-3">Your Placement Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedProgramme.institutionsBreakdown.map((inst, idx) => {
                        const qualifies = inst.status === 'QUALIFIES_ABOVE';
                        const withinRange = inst.status === 'WITHIN_RANGE';
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-900 block">{inst.institutionName}</span>
                              <span className="text-[10px] text-slate-500">{inst.type}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{inst.county}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">
                              {inst.cutoffPoints ? `${inst.cutoffPoints} pts` : 'Mean Grade Basis'}
                            </td>
                            {selectedProgramme.level === 'Degree' && (
                              <td className="py-2.5 px-3 font-mono text-slate-900">
                                {selectedProgramme.studentEstimatedClusterPoints?.toFixed(3)} pts
                              </td>
                            )}
                            <td className="py-2.5 px-3">
                              {qualifies ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>{inst.statusText}</span>
                                </span>
                              ) : withinRange ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>{inst.statusText}</span>
                                </span>
                              ) : inst.status === 'BELOW_CUTOFF' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  <span>{inst.statusText}</span>
                                </span>
                              ) : (
                                <span className="text-slate-600">{inst.statusText}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedProgramme(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHOICE ASSIGNMENT MODAL */}
      {assigningItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 inline-block mb-1">
                  KUCCPS Choice Assignment
                </span>
                <h3 className="text-base font-bold text-slate-900">Select Application Slot</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Assign this verified institution/programme to one of your official KUCCPS slots.
                </p>
              </div>
              <button
                onClick={() => setAssigningItem(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected item details summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-semibold text-slate-900">{assigningItem.institutionName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">KUCCPS Code / County:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sky-600 font-bold">{assigningItem.institutionCode}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-700">{assigningItem.county} County</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selected Programme:</span>
                <span className="font-medium text-emerald-700">{assigningItem.programmeName}</span>
              </div>
              {assigningItem.historicalCutoff !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">2024 Cut-Off Points:</span>
                  <span className="font-mono font-semibold text-sky-700">{assigningItem.historicalCutoff} pts</span>
                </div>
              )}
            </div>

            {/* Slots selection */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">Choose KUCCPS Slot:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['Choice 1a', 'Choice 1b', 'Choice 1c', 'Choice 2', 'Choice 3', 'Choice 4'] as KuccpsSlot[]).map(slot => {
                  const existing = savedChoices.find(c => c.slot === slot);
                  const isChoice1 = slot.startsWith('Choice 1');
                  return (
                    <button
                      key={slot}
                      onClick={() => handleSaveChoiceSlot(slot)}
                      className={`p-3 rounded-xl text-left border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                        existing 
                          ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400' 
                          : 'bg-slate-50 border-slate-200 hover:border-sky-500 hover:bg-sky-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-slate-900 font-mono">{slot}</span>
                        {isChoice1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                            1st Choice Option
                          </span>
                        )}
                        {!isChoice1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Direct Choice
                          </span>
                        )}
                      </div>
                      {existing ? (
                        <div className="mt-1 pt-1 border-t border-amber-200/80 text-[11px] text-amber-900 truncate">
                          <span className="text-slate-500">Occupied: </span>
                          <span className="font-semibold">{existing.institutionName}</span>
                          <span className="block text-[10px] text-slate-600 truncate">{existing.programmeName}</span>
                          <span className="text-[10px] text-amber-700 mt-0.5 block font-medium">Click to replace</span>
                        </div>
                      ) : (
                        <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                          <Plus className="w-3 h-3 text-sky-600" />
                          <span>Assign to this slot</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setAssigningItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MY KUCCPS APPLICATION CHOICES WORKSHEET MODAL */}
      {isChoicesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bookmark className="w-5 h-5 text-sky-600" />
                  <h3 className="text-lg font-bold text-slate-900">My KUCCPS Application Choices Worksheet</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    {savedChoices.length} / 6 Slots Filled
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Plan and organize your 4 official KUCCPS choices from the 514 verified Kenyan institutions before entering the official student portal.
                </p>
              </div>
              <button
                onClick={() => setIsChoicesModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-600">
                Candidate: <strong className="text-slate-900">{assessment.studentName}</strong> (KCSE Mean Grade: <strong className="text-sky-700">{assessment.meanGrade}</strong>)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyKuccpsChoices}
                  disabled={savedChoices.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  {choicesCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{choicesCopied ? 'Codes Copied!' : 'Copy Portal Codes'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
                {savedChoices.length > 0 && (
                  <button
                    onClick={handleClearAllChoices}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* KUCCPS Application Rules Explainer */}
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">How official KUCCPS 4-Choice Placement Works:</strong>
                <p className="text-slate-600 mt-0.5">
                  KUCCPS mandates four choices. Choice 1 provides <strong>three options (1a, 1b, 1c)</strong> which are typically the same programme (or related discipline) pursued at three different universities/colleges with varying cut-off points. Choices 2, 3, and 4 are single choices, each progressively acting as a safety buffer.
                </p>
              </div>
            </div>

            {/* Slots List */}
            <div className="space-y-3">
              {(['Choice 1a', 'Choice 1b', 'Choice 1c', 'Choice 2', 'Choice 3', 'Choice 4'] as KuccpsSlot[]).map(slot => {
                const choice = savedChoices.find(c => c.slot === slot);
                const isChoice1 = slot.startsWith('Choice 1');
                return (
                  <div 
                    key={slot}
                    className={`p-4 rounded-xl border transition-all ${
                      choice 
                        ? 'bg-white border-slate-200 shadow-xs' 
                        : 'bg-slate-50/60 border-dashed border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-sm px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-sky-700">
                          {slot}
                        </span>
                        {isChoice1 ? (
                          <span className="text-[11px] text-slate-500">1st Choice Alternative</span>
                        ) : (
                          <span className="text-[11px] text-slate-500">Secondary / Safety Choice</span>
                        )}
                      </div>

                      {choice ? (
                        <button
                          onClick={() => handleRemoveChoice(slot)}
                          className="self-end sm:self-auto inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Unfilled slot</span>
                      )}
                    </div>

                    {choice ? (
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{choice.institutionName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold text-[10px]">
                              Code: {choice.institutionCode}
                            </span>
                            <span className="text-slate-600 text-xs">{choice.county} County</span>
                            {choice.institutionType && (
                              <span className="text-slate-500 text-[10px]">· {choice.institutionType}</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-emerald-700 font-semibold">{choice.programmeName}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-2">
                            <span>Level: {choice.programmeLevel}</span>
                            {choice.historicalCutoff !== undefined && (
                              <>
                                <span>·</span>
                                <span>Cut-Off: <strong className="text-slate-900 font-mono">{choice.historicalCutoff} pts</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-slate-400">
                        Select any offering from Section 4 or browse any of the 514 institutions in Section 5 and click "Select Choice" to assign to this slot.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Official KUCCPS Student Portal: <a href="https://students.kuccps.net" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-medium">students.kuccps.net</a>
              </span>
              <button
                onClick={() => setIsChoicesModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Worksheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE INSTITUTION & CAMPUS OFFERINGS MODAL */}
      {selectedInstitutionModal && (() => {
        const campusCourses = getInstitutionQualifyingCourses(selectedInstitutionModal);
        const filteredCampusCourses = campusCourses.filter(c => {
          const q = campusSearchQuery.toLowerCase().trim();
          return !q || c.programmeName.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.level.toLowerCase().includes(q);
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5">
                    <span className="font-mono text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      KUCCPS Code: {selectedInstitutionModal.code}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {selectedInstitutionModal.type}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-medium">
                      {selectedInstitutionModal.county} County ({selectedInstitutionModal.town})
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedInstitutionModal.name}
                  </h3>
                  {selectedInstitutionModal.shortName && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Known as: <strong className="text-slate-700">{selectedInstitutionModal.shortName}</strong>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedInstitutionModal(null)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Candidate Context at this campus */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Candidate</span>
                  <span className="text-sm font-bold text-slate-900">{assessment.studentName}</span>
                  <span className="text-[10px] text-slate-500 block">Mean Grade: {assessment.meanGrade} ({assessment.totalAggregate}/84 pts)</span>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-[11px] text-sky-700 block">Weighted Cluster Points</span>
                  <span className="text-base font-bold text-sky-900 font-mono">
                    {assessment.studentEstimatedClusterPoints.toFixed(3)} pts
                  </span>
                  <span className="text-[10px] text-sky-600 block">Degree Placement Threshold</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 block">Qualifying Courses Here</span>
                  <span className="text-base font-bold text-emerald-900">
                    {campusCourses.length} Programmes
                  </span>
                  <span className="text-[10px] text-emerald-600 block">Academically Eligible</span>
                </div>
              </div>

              {/* Campus Qualifying Courses Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs uppercase font-bold text-slate-700 tracking-wider">
                    Courses You Qualify For at {selectedInstitutionModal.name}
                  </h4>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={campusSearchQuery}
                      onChange={(e) => setCampusSearchQuery(e.target.value)}
                      placeholder="Search courses at this campus..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {filteredCampusCourses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    {campusCourses.length === 0 ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-slate-800">
                          {selectedInstitutionModal.type} located in {selectedInstitutionModal.county} County ({selectedInstitutionModal.town}).
                        </p>
                        <p className="text-slate-600 max-w-md mx-auto text-xs">
                          This verified institution participates in KUCCPS admissions. You can select this institution for any of your 4 official KUCCPS choices!
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setAssigningItem({
                                institutionName: selectedInstitutionModal.name,
                                institutionCode: selectedInstitutionModal.code,
                                institutionType: selectedInstitutionModal.type,
                                county: selectedInstitutionModal.county,
                                programmeName: isDegreeEligible ? 'Undergraduate Degree Choice' : 'Diploma / Certificate Choice',
                                programmeLevel: isDegreeEligible ? 'Degree' : 'Diploma',
                                eligibilityText: `Accredited ${selectedInstitutionModal.type} in ${selectedInstitutionModal.county}`,
                              });
                              setSelectedInstitutionModal(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Select this Institution for KUCCPS Choices</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>No courses match your search "{campusSearchQuery}".</p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-700 uppercase text-[10px] tracking-wider bg-slate-100">
                          <th className="py-2.5 px-3">Programme</th>
                          <th className="py-2.5 px-3">Level</th>
                          <th className="py-2.5 px-3">Cut-Off</th>
                          <th className="py-2.5 px-3">Qualification Status</th>
                          <th className="py-2.5 px-3 text-right">KUCCPS Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredCampusCourses.map((c, cIdx) => (
                          <tr key={cIdx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900">{c.programmeName}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500">{c.category}</span>
                                {c.isFieldMatch && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    In Your Field
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.level === 'Degree' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {c.level}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">
                              {c.cutoffPoints ? `${c.cutoffPoints} pts` : 'Mean Grade'}
                            </td>
                            <td className="py-2.5 px-3">
                              {c.qualifies ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>{c.statusText}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  <span>{c.statusText}</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => {
                                  setAssigningItem({
                                    institutionName: selectedInstitutionModal.name,
                                    institutionCode: selectedInstitutionModal.code,
                                    institutionType: selectedInstitutionModal.type,
                                    county: selectedInstitutionModal.county,
                                    programmeName: c.programmeName,
                                    programmeLevel: c.level,
                                    historicalCutoff: c.cutoffPoints,
                                    studentEstimatedPoints: c.studentScore,
                                    eligibilityText: c.statusText,
                                  });
                                  setSelectedInstitutionModal(null);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold transition-colors shadow-xs cursor-pointer"
                                title="Add to your KUCCPS 4 choices"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Choice</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Official KUCCPS Code: <strong className="text-slate-900 font-mono">{selectedInstitutionModal.code}</strong></span>
                <button
                  onClick={() => setSelectedInstitutionModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
