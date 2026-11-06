import React from 'react';
import { 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  ShieldCheck,
  Sparkles,
  GraduationCap,
  FileDown,
  Layers,
  BookOpen,
  Check,
  CreditCard,
  Smartphone,
  Phone
} from 'lucide-react';
import { StudentAssessment } from '../types';
import { isGradeEqualOrHigher } from '../lib/clusterCalculator';
import { INITIAL_PROGRAMMES } from '../data/kuccpsData';
import { runFullCareerAssessment } from '../lib/recommendationEngine';

interface FreePreviewProps {
  assessment: StudentAssessment;
  onUnlock: () => void;
  isLoadingPayment?: boolean;
}

export const FreePreview: React.FC<FreePreviewProps> = ({ 
  assessment, 
  onUnlock,
  isLoadingPayment 
}) => {
  const summary = assessment.previewSummary;
  const isDegreeEligible = isGradeEqualOrHigher(assessment.meanGrade, 'C+');

  // Ensure detailed evaluation results are populated
  let results = assessment.detailedResults;
  if (!results || !results.eligibleProgrammes || results.eligibleProgrammes.length === 0) {
    try {
      const computed = runFullCareerAssessment(
        {
          studentName: assessment.studentName,
          studentEmail: assessment.studentEmail,
          studentPhone: assessment.studentPhone,
          kcseYear: assessment.kcseYear,
          indexNumber: assessment.indexNumber,
          subjects: assessment.subjects,
          hobbies: assessment.hobbies || [],
          otherHobby: assessment.otherHobby,
          intendedCourse: assessment.intendedCourse || "I don't know yet",
        },
        INITIAL_PROGRAMMES
      );
      results = computed.detailedResults;
    } catch (_) {}
  }

  const allEligible = results?.eligibleProgrammes || [];
  const fieldMatches = results?.fieldMatchProgrammes || [];
  const totalEligibleCount = allEligible.length;
  const fieldMatchesCount = fieldMatches.length;

  // 1. Qualified Degree Courses: filter all Degree level programmes
  const qualifiedDegrees = allEligible.filter((p) => p.level === 'Degree');
  
  // Prioritize degree courses in student's chosen career fields first
  const fieldMatchDegrees = fieldMatches.filter((p) => p.level === 'Degree');
  const otherEligibleDegrees = qualifiedDegrees.filter(
    (d) => !fieldMatchDegrees.some((fd) => fd.programmeId === d.programmeId)
  );
  const prioritizedDegrees = [...fieldMatchDegrees, ...otherEligibleDegrees];

  // Guarantee at least 2 qualified degree courses in preview when student qualifies for degrees
  const sampleDegreeMatches = prioritizedDegrees.slice(0, Math.max(2, Math.min(prioritizedDegrees.length, 3)));

  // Qualified Diploma/TVET sample (for students progressing through diploma pathways)
  const qualifiedDiplomas = allEligible.filter((p) => p.level === 'Diploma' || p.level === 'Certificate');
  const sampleDiplomaMatches = qualifiedDiplomas.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 w-full overflow-x-hidden">
      <div className="max-w-3xl mx-auto space-y-6 w-full">
        
        {/* Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Preliminary Assessment Snippet</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your KUCCPS Career Analysis Is Ready
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Preliminary academic eligibility processed for <strong className="text-slate-900">{assessment.studentName}</strong> (KCSE {assessment.kcseYear}) using official KNEC & KUCCPS placement criteria.
          </p>
        </div>

        {/* SECTION 1: PRELIMINARY ACADEMIC OVERVIEW SNIPPET */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>1. Academic Performance & Cluster Summary</span>
              </h2>
              <span className="text-xs text-slate-500">Ref Code: <strong className="font-mono text-slate-700">{assessment.id}</strong></span>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified 7-Subject KNEC Profile</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Mean Grade & Points */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium mb-1">KCSE Mean Grade & Aggregate</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">{summary.meanGrade}</span>
                <span className="text-sm font-bold text-slate-600">({assessment.totalAggregate}/84 pts)</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {isDegreeEligible ? (
                  <span className="text-emerald-700 font-semibold">✓ Meets C+ national degree threshold</span>
                ) : (
                  <span className="text-amber-700 font-semibold">✓ Qualifies for Diploma & TVET placement</span>
                )}
              </div>
            </div>

            {/* Estimated Cluster Points */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium mb-1">Estimated Weighted Cluster Points</div>
              <div className="text-3xl font-extrabold text-sky-600 font-mono tabular-nums">
                {summary.studentEstimatedClusterPoints.toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                Calculated using official KUCCPS 4-subject formula against raw aggregate.
              </div>
            </div>

            {/* Chosen Career Interests Snippet */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">Selected Career Fields & Passions</span>
                {fieldMatchesCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    🎯 {fieldMatchesCount} Matching Programmes Found
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(assessment.hobbies || []).length > 0 ? (
                  (assessment.hobbies || []).map((h, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-300 text-slate-800 shadow-2xs">
                      {h}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">General placement evaluation</span>
                )}
              </div>
              {assessment.intendedCourse && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="text-slate-400">Target Course:</span>
                  <strong className="text-slate-900">{assessment.intendedCourse}</strong>
                </div>
              )}
            </div>

            {/* Qualifying Programme Scope Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
              <div className="text-xs text-slate-500 font-medium mb-2">Academic Placement Horizon</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <div className="text-xl font-bold text-sky-600 font-mono">{summary.potentialDegreeMatches}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Degrees</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <div className="text-xl font-bold text-emerald-600 font-mono">{summary.potentialDiplomaMatches}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Diplomas</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <div className="text-xl font-bold text-amber-600 font-mono">{summary.potentialTvetMatches}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Certificates</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <div className="text-xl font-bold text-slate-900 font-mono">{summary.totalEligibleInstitutions}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Campuses (514)</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: TEASER SNIPPET OF QUALIFIED COURSES (AT LEAST 2 QUALIFIED DEGREE COURSES) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {sampleDegreeMatches.length >= 2 
                    ? "2. Preview Sample: Qualified Degree Courses" 
                    : "2. Preview Sample: Top Qualifying Courses"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {sampleDegreeMatches.length >= 2
                  ? `Listing ${sampleDegreeMatches.length} of ${summary.potentialDegreeMatches} qualified degree courses you meet KNEC & KUCCPS requirements for:`
                  : `Showing ${sampleDiplomaMatches.length} of ${totalEligibleCount || '150+'} qualifying pathways for your academic profile:`}
              </p>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Full University Cut-Offs Locked</span>
            </span>
          </div>

          {/* Qualified Degree Courses Preview (Guaranteed at least 2 when degree qualified) */}
          {sampleDegreeMatches.length > 0 ? (
            <div className="space-y-3">
              {sampleDegreeMatches.map((prog, idx) => (
                <div 
                  key={prog.programmeId || idx} 
                  className="p-4 rounded-xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50/70 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs mb-1">
                        <span className="font-mono text-sky-700 font-bold bg-white px-2 py-0.5 rounded border border-sky-200">
                          {prog.programmeCode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-600 text-white shadow-2xs">
                          {prog.level}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white text-slate-700 border border-slate-200">
                          {prog.category}
                        </span>
                        {prog.isFieldMatch && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            🎯 In Your Field
                          </span>
                        )}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                        {prog.programmeName}
                      </div>
                      {prog.programmeCluster && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {prog.programmeCluster}
                        </div>
                      )}
                    </div>

                    <span className="self-start sm:self-auto px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Academically Qualified</span>
                    </span>
                  </div>

                  {/* Locked University Cut-Offs Preview Box */}
                  <div className="p-3 rounded-lg bg-white border border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 mt-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>
                        Offered at <strong className="text-slate-900">{prog.institutionCount || '30+'} Universities</strong> across Kenya (UoN, KU, JKUAT, Moi & more)
                      </span>
                    </div>
                    <button 
                      onClick={onUnlock}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer self-start sm:self-auto hover:underline"
                    >
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>Unlock Cut-Off Points</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* For students with mean grade below C+ */
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong>KUCCPS Degree Admission Note:</strong> National direct degree placement requires a KCSE Mean Grade of C+ and above. Your Mean Grade of <strong>{summary.meanGrade}</strong> directly qualifies for accredited Diploma and TVET progression pathways below:
              </div>
              {sampleDiplomaMatches.map((prog, idx) => (
                <div 
                  key={prog.programmeId || idx} 
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="font-mono text-sky-600 font-bold">{prog.programmeCode}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                          {prog.level}
                        </span>
                        <span className="text-slate-500">{prog.category}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{prog.programmeName}</div>
                    </div>
                    <span className="self-start sm:self-auto px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Academically Qualified</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>Offered across National Polytechnics & Technical Colleges in Kenya</span>
                    </div>
                    <button 
                      onClick={onUnlock}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>Unlock Campus List</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-900 text-center font-medium">
            + Over <strong className="font-bold">{Math.max(0, totalEligibleCount - (sampleDegreeMatches.length || sampleDiplomaMatches.length))} additional qualifying choices</strong> in Computing, Medicine, Engineering, Business, Law, Education, Agriculture & TVET waiting for you in the full report.
          </div>
        </div>

        {/* SECTION 3: PAYSTACK PAYOUT / UNLOCK FULL REPORT CARD (KSH 100) */}
        <div className="relative rounded-2xl bg-gradient-to-b from-sky-50 via-white to-emerald-50/30 border-2 border-sky-400 p-6 sm:p-8 shadow-lg overflow-hidden">
          
          <div className="max-w-xl mx-auto text-center space-y-4">
            
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-sky-600 text-white shadow-md mb-1">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Instant Access · One-Time Fee
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Unlock & Download Your Complete Report
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                One-time fee of <strong className="text-slate-900 font-bold font-mono">KSh 100</strong> (M-Pesa or Card). Instant activation with full official PDF report download.
              </p>
            </div>

            {/* What is Unlocked Box */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-left space-y-2.5 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1.5 border-b border-slate-200">
                What You Get With Full Report (KSh 100):
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>All 150+ Qualifying Courses</strong> with zero artificial caps or limits.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Courses in Your Field Prioritized</strong> and highlighted first.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cut-Off Points Breakdown</strong> for every course across Kenyan universities.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Access All 514 Institutions</strong> with campus search & details modal.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Official KUCCPS 4-Choice Worksheet</strong> with 1-click slot assignment.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Downloadable & Printable Official PDF</strong> to keep and share with family.</span>
                </div>
              </div>
            </div>

            {/* Price & Primary Action Button */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={onUnlock}
                disabled={isLoadingPayment}
                className="w-full py-3.5 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="truncate sm:whitespace-normal">Unlock & Download Full Report (KSh 100)</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>M-Pesa Express & Paybill</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Visa & Mastercard</span>
                </span>
                <span>·</span>
                <span className="text-slate-600 font-medium">Instant PDF Download</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Support Helpline */}
        <div className="text-center text-xs text-slate-500 space-y-1 pt-2">
          <p>Your estimated weighted cluster points are calculated using available KCSE grades and applicable KUCCPS methodology.</p>
          <p className="text-emerald-700 font-bold">
            If you'll need any assistance with applying any school text/call <a href="tel:0117334197" className="underline text-slate-900 hover:text-emerald-700">0117334197</a>
          </p>
        </div>

      </div>
    </div>
  );
};
