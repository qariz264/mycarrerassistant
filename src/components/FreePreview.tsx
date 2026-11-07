import React from 'react';
import { 
  ArrowRight, 
  FileDown
} from 'lucide-react';
import { StudentAssessment } from '../types';
import { isGradeEqualOrHigher } from '../lib/clusterCalculator';
import { INITIAL_PROGRAMMES } from '../data/kuccpsData';
import { runFullCareerAssessment } from '../lib/recommendationEngine';
import { generateCareerReportPDF } from '../lib/pdfGenerator';
import { rankProgrammesByStudentInterest } from '../lib/interestRanking';

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
  
  // Rank degree courses strictly by student's chosen career fields, intended course & passions
  // If the student chose computing (or medicine, engineering, business, etc.), courses in that field
  // they qualify for appear first!
  const rankedDegrees = rankProgrammesByStudentInterest(qualifiedDegrees, assessment);

  // Guarantee at least 2 qualified degree courses in preview when student qualifies for degrees
  const sampleDegreeMatches = rankedDegrees.slice(0, Math.max(2, Math.min(rankedDegrees.length, 3)));

  // Qualified Diploma/TVET sample (ranked with the exact same interest alignment)
  const qualifiedDiplomas = allEligible.filter((p) => p.level === 'Diploma' || p.level === 'Certificate');
  const rankedDiplomas = rankProgrammesByStudentInterest(qualifiedDiplomas, assessment);
  const sampleDiplomaMatches = rankedDiplomas.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 w-full overflow-x-hidden">
      <div className="max-w-3xl mx-auto space-y-6 w-full">
        
        {/* Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
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
              <h2 className="text-base font-bold text-slate-900">
                1. Academic Performance & Cluster Summary
              </h2>
              <span className="text-xs text-slate-500">Ref Code: <strong className="font-mono text-slate-700">{assessment.id}</strong></span>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified 7-Subject KNEC Profile
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
                  <span className="text-emerald-700 font-semibold">Meets C+ national degree threshold</span>
                ) : (
                  <span className="text-amber-700 font-semibold">Qualifies for Diploma & TVET placement</span>
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
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {fieldMatchesCount} Matching Programmes Found
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
                  <span className="text-slate-400">Target Choice:</span>
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

        {/* SECTION 2: TEASER SNIPPET OF QUALIFIED COURSES (ALIGNED TO STUDENT INTEREST) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {sampleDegreeMatches.length >= 2 
                  ? "2. Preview Sample: Qualified Degree Courses" 
                  : "2. Preview Sample: Top Qualifying Courses"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {sampleDegreeMatches.length >= 2
                  ? `Showing top qualified degree courses aligned with your academic profile and interests (${summary.potentialDegreeMatches} total qualified):`
                  : `Showing ${sampleDiplomaMatches.length} of ${totalEligibleCount || '150+'} qualifying pathways for your academic profile:`}
              </p>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Full University Cut-Offs Locked
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
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            In Your Field
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

                    <span className="self-start sm:self-auto px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Academically Qualified
                    </span>
                  </div>

                  {/* Locked University Cut-Offs Preview Box */}
                  <div className="p-3 rounded-lg bg-white border border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 mt-2">
                    <div>
                      Offered at <strong className="text-slate-900">{prog.institutionCount || '30+'} Universities</strong> across Kenya (UoN, KU, JKUAT, Moi & more)
                    </div>
                    <button 
                      onClick={onUnlock}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer self-start sm:self-auto hover:underline"
                    >
                      Unlock Cut-Off Points
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* For students with mean grade below C+ */
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong className="font-semibold">KUCCPS Admission Note:</strong> National direct degree placement requires a KCSE Mean Grade of C+ and above. Your Mean Grade of <strong>{summary.meanGrade}</strong> directly qualifies for accredited Diploma and TVET progression pathways below:
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
                    <span className="self-start sm:self-auto px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Academically Qualified
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      Offered across National Polytechnics & Technical Colleges in Kenya
                    </div>
                    <button 
                      onClick={onUnlock}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer hover:underline"
                    >
                      Unlock Campus List
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

        {/* SECTION 3: UNLOCK FULL REPORT CARD (KSH 100) */}
        <div className="relative rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="max-w-xl mx-auto text-center space-y-5">

            <div>
              <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <span>Instant Access</span>
                <span aria-hidden="true">·</span>
                <span>Official KUCCPS Standards</span>
                <span aria-hidden="true">·</span>
                <span>One-Time Fee</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                Unlock & Download Your Complete Report
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
                One-time official fee of <strong className="text-slate-900 font-bold font-mono">KSh 100</strong> via M-Pesa or Card. Instant unlock with full online analysis and official downloadable PDF report.
              </p>
            </div>

            {/* What is Unlocked Box */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-left space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-1.5 border-b border-slate-200">
                Included in Your Full Report (KSh 100):
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">·</span>
                  <span><strong>All 150+ Qualifying Courses</strong> with zero artificial caps or limits.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">·</span>
                  <span><strong>Courses in Your Field Prioritized</strong> and highlighted first.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">·</span>
                  <span><strong>Cut-Off Points Breakdown</strong> for every course across Kenyan universities.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">·</span>
                  <span><strong>Access All 514 Institutions</strong> with campus search & details modal.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">·</span>
                  <span><strong>Official KUCCPS 4-Choice Worksheet</strong> with 1-click slot assignment.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">·</span>
                  <span><strong>Downloadable & Printable Official PDF</strong> to keep and share with family.</span>
                </div>
              </div>
            </div>

            {/* Price & Primary Action Button */}
            <div className="pt-2 space-y-3">
              {assessment.paymentStatus === 'PAID' || assessment.isUnlocked ? (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-emerald-700">
                    Payment Confirmed — Full Report Unlocked
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={onUnlock}
                      className="w-full py-3.5 px-4 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>View Full Career Report</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => generateCareerReportPDF(assessment)}
                      className="w-full py-3.5 px-4 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileDown className="w-4 h-4 text-emerald-600" />
                      <span>Download PDF Report</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onUnlock}
                  disabled={isLoadingPayment}
                  className="w-full py-3.5 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="truncate sm:whitespace-normal">Unlock & Download Full Report (KSh 100)</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
                <span className="font-semibold text-emerald-700">M-Pesa Express & Paybill</span>
                <span>·</span>
                <span className="font-semibold text-slate-700">Visa & Mastercard</span>
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
