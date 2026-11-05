import React, { useState } from 'react';
import { 
  Compass, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Building2, 
  BookOpen, 
  Award, 
  HelpCircle, 
  Lock, 
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface LandingPageProps {
  onStartAssessment: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAssessment }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Subtle National Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-emerald-600 to-sky-600" />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-white border-b border-slate-200">
        {/* Soft geometric background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Unboxed subtle kicker */}
          <div className="text-xs uppercase tracking-widest text-sky-700 font-semibold mb-4">
            Kenya's Automated KCSE Career & KUCCPS Placement Assistant
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto mb-6 text-balance">
            Your KCSE. Your Interests.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600">
              Your Next Step.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed text-balance">
            Turn your KCSE results into a clearer path for your future. Discover university, TVET, diploma, and certificate options aligned with your performance, hobbies, and career goals.
          </p>

          {/* Central Product Promise Callout */}
          <div className="text-sm font-medium text-slate-600 mb-8 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>No manual calculations. No endless searching.</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onStartAssessment}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Career Assessment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 text-base font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>How It Works</span>
            </a>
          </div>

          {/* Trust Signals */}
          <div className="pt-6 border-t border-slate-200 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span>Official KUCCPS Placement Standards</span>
            <span aria-hidden="true">·</span>
            <span>Degree, Diploma & TVET Pathways</span>
            <span aria-hidden="true">·</span>
            <span>Instant Automated Analysis</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3-STEP FLOW) */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-sky-700 font-semibold mb-2">
              Simple 3-Step Process
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              From KCSE Grades to a Clear Career Strategy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="text-3xl font-bold text-sky-600 mb-4 font-mono tabular-nums">01</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Enter Your Results</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Select your KCSE examination year and enter your subjects, grades, hobbies, and intended career or select "I don't know yet".
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                Supports all valid KNEC subjects A through E
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="text-3xl font-bold text-teal-600 mb-4 font-mono tabular-nums">02</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Automated Analysis</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Our system calculates your Estimated Weighted Cluster Points and checks requirements across all 514 verified Kenyan tertiary institutions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                Instant automated qualification check
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-4 font-mono tabular-nums">03</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Your Full Report</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Review your matched university and TVET programmes, institution cut-offs, alternative career bridges, and download your report completely free.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                100% Free · Instant access & downloadable PDF
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE ANALYZE */}
      <section id="what-we-analyze" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-sky-700 font-semibold mb-2">
              Comprehensive Evaluation
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              What We Analyze For Every Student
            </p>
            <p className="text-sm text-slate-600 mt-3">
              We never recommend courses based solely on general grades. We evaluate cluster subject harmony and real student passions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">KCSE Performance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                KNEC 7-subject mean grade calculation and aggregate score calculation.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">Cluster Points</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Estimated Weighted Cluster Points based on official 4-subject cluster combinations.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">Subject Prerequisites</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict verification against required subject minimums (e.g. Math C+, Bio B).
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">Institution Options</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access to all 514 verified Kenyan universities, TVCs, TTCs, and National Polytechnics.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">Hobbies & Interests</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Signals converted from coding, machines, healthcare, design, or business into course matches.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">Intended Course Fit</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Objective evaluation of your dream course with honest reasons if any requirement is missing.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">TVET & Diploma Bridges</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stepping-stone diplomas that allow university credit transfer if degree minimums were missed.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">Downloadable PDF Report</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Official structured document to share with parents, sponsors, or high school teachers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-widest text-sky-700 font-semibold mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Common Questions About Placement
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How are the Estimated Weighted Cluster Points calculated?",
                a: "We implement the standard KUCCPS weighted cluster points methodology: C = sqrt((r / 48) * (t / 84)) * 48, where 'r' is your raw points in the 4 cluster subjects for the course and 't' is your aggregate performance in your best 7 subjects. Your official KUCCPS weighted cluster points may differ depending on the final KNEC national cohort performance index."
              },
              {
                q: "Is the full career guidance report free to access?",
                a: "Yes. Career Assistant KE currently provides 100% free, immediate access to your complete personalized evaluation, institution cut-offs, TVET alternative pathways, and downloadable PDF report."
              },
              {
                q: "What programmes and institutions are covered?",
                a: "We evaluate 150+ degree, diploma, certificate, and artisan programmes across all 514 accredited Kenyan tertiary placement institutions including 42 public universities, 38 private universities, 33 national polytechnics, 350 TVCs, and 35 TTCs with no artificial limits."
              },
              {
                q: "What if my grades do not match my dream course?",
                a: "We never simply reject you. The system highlights the exact missing prerequisite (for example, scoring C instead of C+ in Mathematics) and presents direct stepping-stone Diploma and TVET pathways that offer credit transfer and industry progression."
              },
              {
                q: "Does Career Assistant KE guarantee university admission?",
                a: "No. KUCCPS is the sole authorized government placement body in Kenya. Career Assistant KE is an independent advisory tool designed to help you make informed choices before submitting your official application on the KUCCPS portal."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-semibold text-slate-900 hover:text-sky-700 transition-colors focus:outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFICIAL KUCCPS DISCLAIMER CALLOUT */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Important Notice & Placement Disclaimer:</strong>
              Career Assistant KE is an independent career guidance platform and is not KUCCPS. Programme requirements and cut-off information are based on available published information and may change between admission cycles. Estimated cluster points may differ from official KUCCPS calculations. Students should always confirm current requirements with KUCCPS and the relevant institutions before making final placement submissions.
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="py-16 bg-gradient-to-b from-white to-slate-100 text-center border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Ready to Discover Your Next Step?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Enter your KCSE grades once and let Career Assistant KE map your best university, diploma, and TVET options in seconds.
          </p>
          <button
            onClick={onStartAssessment}
            className="px-8 py-3.5 text-base font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-md shadow-sky-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start Assessment Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-slate-800">Career Assistant KE</span>
            <span aria-hidden="true">·</span>
            <span>Empowering Kenyan KCSE Graduates</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-emerald-700 font-medium">Need assistance with applying any school? Text/call <a href="tel:0117334197" className="underline font-bold text-slate-900 hover:text-emerald-700">0117334197</a></span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>&copy; {new Date().getFullYear()} Career Assistant KE.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
