import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Heart, 
  Target, 
  Search,
  Calculator,
  CheckSquare,
  Square,
  X,
  Briefcase,
  Wrench,
  Building,
  Leaf,
  Scale,
  Camera,
  FlaskConical,
  Code,
  Loader2
} from 'lucide-react';
import { KCSEGrade } from '../types';
import { 
  KCSE_SUBJECTS, 
  VALID_GRADES, 
  POPULAR_HOBBIES, 
  POPULAR_INTENDED_COURSES, 
  GRADE_POINTS,
  CAREER_DOMAINS 
} from '../data/kcseSubjects';
import { calculateKcseMeanGrade } from '../lib/clusterCalculator';

interface SubjectEntry {
  subject: string;
  grade: KCSEGrade;
}

interface AssessmentWizardProps {
  onComplete: (data: {
    studentName: string;
    studentEmail?: string;
    studentPhone?: string;
    kcseYear: number;
    indexNumber?: string;
    subjects: SubjectEntry[];
    hobbies: string[];
    otherHobby?: string;
    intendedCourse: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({ onComplete, onCancel, isLoading }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [internalSubmitting, setInternalSubmitting] = useState<boolean>(false);
  const isSubmitting = !!isLoading || internalSubmitting;

  // Step 1: Student Information
  const [studentName, setStudentName] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [studentPhone, setStudentPhone] = useState<string>('');
  const [kcseYear, setKcseYear] = useState<number>(2025);
  const [indexNumber, setIndexNumber] = useState<string>('');

  // Step 2: Subjects & Grades
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { subject: 'English', grade: 'B' },
    { subject: 'Kiswahili', grade: 'B' },
    { subject: 'Mathematics', grade: 'B' },
    { subject: 'Biology', grade: 'B-' },
    { subject: 'Chemistry', grade: 'B-' },
    { subject: 'Physics', grade: 'C+' },
    { subject: 'History and Government', grade: 'B+' },
  ]);
  const [subjectToAdd, setSubjectToAdd] = useState<string>('');
  const [gradeToAdd, setGradeToAdd] = useState<KCSEGrade>('B');

  // Step 3: Career Fields & Interests (Multi-select)
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [interestSearch, setInterestSearch] = useState<string>('');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [otherHobby, setOtherHobby] = useState<string>('');

  // Step 4: Intended Course(s) (Allows single or multiple choices)
  const [selectedIntendedCourses, setSelectedIntendedCourses] = useState<string[]>([]);
  const [courseSearch, setCourseSearch] = useState<string>('');

  // Step validation error message
  const [stepError, setStepError] = useState<string>('');

  // Available subjects that have not yet been added
  const availableSubjectOptions = useMemo(() => {
    const enteredSet = new Set(subjects.map(s => s.subject));
    return KCSE_SUBJECTS.filter(s => !enteredSet.has(s.name));
  }, [subjects]);

  // Live calculation of mean grade for immediate student feedback
  const liveCalculation = useMemo(() => {
    return calculateKcseMeanGrade(subjects);
  }, [subjects]);

  // Subject management helpers
  const handleUpdateGrade = (index: number, newGrade: KCSEGrade) => {
    const updated = [...subjects];
    updated[index].grade = newGrade;
    setSubjects(updated);
  };

  const handleRemoveSubject = (index: number) => {
    if (subjects.length <= 1) {
      setStepError('Please maintain at least your core KCSE subjects.');
      return;
    }
    setStepError('');
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleAddSubject = () => {
    if (!subjectToAdd) return;
    setSubjects([...subjects, { subject: subjectToAdd, grade: gradeToAdd }]);
    setSubjectToAdd('');
    setGradeToAdd('B');
    setStepError('');
  };

  // Filter career interests based on domain and search
  const filteredHobbies = useMemo(() => {
    return POPULAR_HOBBIES.filter(item => {
      const matchesDomain = selectedDomain === 'ALL' || item.category === selectedDomain;
      const q = interestSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q));
      return matchesDomain && matchesSearch;
    });
  }, [selectedDomain, interestSearch]);

  // Interest toggle
  const handleToggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter(h => h !== hobby));
    } else {
      setSelectedHobbies([...selectedHobbies, hobby]);
    }
  };

  const handleSelectAllVisibleHobbies = () => {
    const visibleNames = filteredHobbies.map(h => h.name);
    const combined = Array.from(new Set([...selectedHobbies, ...visibleNames]));
    setSelectedHobbies(combined);
  };

  const handleClearAllHobbies = () => {
    setSelectedHobbies([]);
  };

  // Filter popular courses based on search
  const filteredCourses = useMemo(() => {
    if (!courseSearch) return POPULAR_INTENDED_COURSES;
    return POPULAR_INTENDED_COURSES.filter(c => 
      c.toLowerCase().includes(courseSearch.toLowerCase())
    );
  }, [courseSearch]);

  // Toggle intended course (supports multi-selection or undecided)
  const handleToggleIntendedCourse = (course: string) => {
    if (course === "I don't know yet") {
      if (selectedIntendedCourses.includes("I don't know yet")) {
        setSelectedIntendedCourses([]);
      } else {
        setSelectedIntendedCourses(["I don't know yet"]);
      }
      return;
    }

    let updated = selectedIntendedCourses.filter(c => c !== "I don't know yet");
    if (updated.includes(course)) {
      updated = updated.filter(c => c !== course);
    } else {
      updated.push(course);
    }

    setSelectedIntendedCourses(updated);
  };

  const handleRemoveIntendedCourse = (course: string) => {
    const updated = selectedIntendedCourses.filter(c => c !== course);
    setSelectedIntendedCourses(updated);
  };

  // Formatted intended course string for downstream models
  const formattedIntendedCourse = useMemo(() => {
    if (selectedIntendedCourses.includes("I don't know yet") || selectedIntendedCourses.length === 0) {
      return "I don't know yet";
    }
    return selectedIntendedCourses.join(', ');
  }, [selectedIntendedCourses]);

  // Navigation handlers
  const handleNextStep = () => {
    setStepError('');

    // Step 1 validation
    if (currentStep === 1) {
      if (!studentName.trim()) {
        setStepError('Please enter candidate name or initials.');
        return;
      }
      if (studentEmail && !studentEmail.includes('@')) {
        setStepError('Please enter a valid email address, or leave it blank.');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Step 2 validation
    if (currentStep === 2) {
      if (subjects.length < 5) {
        setStepError('Please enter at least 5 subjects to calculate eligibility.');
        return;
      }
      const hasMath = subjects.some(s => s.subject === 'Mathematics');
      const hasLang = subjects.some(s => s.subject === 'English' || s.subject === 'Kiswahili');
      if (!hasMath || !hasLang) {
        setStepError('Please include Mathematics and at least one official language (English or Kiswahili).');
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Step 3 validation
    if (currentStep === 3) {
      if (selectedHobbies.length === 0 && !otherHobby.trim()) {
        setStepError('Please choose at least one career field / interest or enter your personal interest.');
        return;
      }
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Step 4 validation
    if (currentStep === 4) {
      if (selectedIntendedCourses.length === 0) {
        setStepError('Please select at least one course or choose "I don\'t know yet".');
        return;
      }
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Step 5: Final Submission
    if (currentStep === 5) {
      if (isSubmitting) return;
      setInternalSubmitting(true);
      onComplete({
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim() || undefined,
        studentPhone: studentPhone.trim() || undefined,
        kcseYear,
        indexNumber: indexNumber.trim() || undefined,
        subjects,
        hobbies: selectedHobbies,
        otherHobby: otherHobby.trim() || undefined,
        intendedCourse: formattedIntendedCourse,
      });
    }
  };

  const handlePreviousStep = () => {
    setStepError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 text-slate-900 w-full overflow-x-hidden">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Top Progress Track */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-2 sm:mb-3">
            <span className="text-slate-900 font-semibold shrink-0">Step {currentStep} of 5</span>
            <span className="text-slate-600 font-medium truncate ml-2 text-right">
              {currentStep === 1 && 'Basic Information'}
              {currentStep === 2 && 'KCSE Subjects & Grades'}
              {currentStep === 3 && 'Hobbies & Interests'}
              {currentStep === 4 && 'Intended Career'}
              {currentStep === 5 && 'Review & Analyze'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div 
                key={step}
                className={`h-1.5 rounded-full transition-colors ${
                  step < currentStep 
                    ? 'bg-emerald-600' 
                    : step === currentStep 
                      ? 'bg-sky-600' 
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Callout */}
        {stepError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{stepError}</span>
          </div>
        )}

        {/* Wizard Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Student & KCSE Details</h2>
                <p className="text-xs text-slate-500">
                  Enter your details to generate your personalized career profile.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name or Initials *
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Brian Otieno"
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      KCSE Examination Year *
                    </label>
                    <select
                      value={kcseYear}
                      onChange={(e) => setKcseYear(parseInt(e.target.value, 10))}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                      <option value={2023}>2023</option>
                      <option value={2022}>2022</option>
                      <option value={2021}>2021</option>
                      <option value={2020}>2020</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      KCSE Index Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={indexNumber}
                      onChange={(e) => setIndexNumber(e.target.value)}
                      placeholder="e.g. 12345678001"
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-slate-400 font-normal">(For report receipt)</span>
                    </label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="e.g. brian@example.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Subjects & Grades */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Enter KCSE Subjects & Grades</h2>
                  <p className="text-xs text-slate-500">
                    Only enter subjects you took. We calculate your mean grade automatically.
                  </p>
                </div>

                {/* Live Mean Grade Metric */}
                <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-right shrink-0">
                  <div className="text-[11px] text-slate-500 font-medium">Estimated Mean Grade</div>
                  <div className="text-lg font-bold text-sky-600 flex items-center justify-end gap-1.5 font-mono">
                    <span>{liveCalculation.meanGrade}</span>
                    <span className="text-xs text-slate-500 font-normal font-mono">({liveCalculation.totalAggregate}/84 pts)</span>
                  </div>
                </div>
              </div>

              {/* Subject Table */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {subjects.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                  >
                    <span className="font-medium text-slate-800">{item.subject}</span>
                    <div className="flex items-center gap-3">
                      <select
                        value={item.grade}
                        onChange={(e) => handleUpdateGrade(idx, e.target.value as KCSEGrade)}
                        className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-sky-700 focus:outline-none cursor-pointer"
                      >
                        {VALID_GRADES.map(g => (
                          <option key={g} value={g}>{g} ({GRADE_POINTS[g]} pts)</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Remove subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Subject Row */}
              {availableSubjectOptions.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:flex-1">
                    <select
                      value={subjectToAdd}
                      onChange={(e) => setSubjectToAdd(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Add Another KCSE Subject --</option>
                      {availableSubjectOptions.map(s => (
                        <option key={s.code} value={s.name}>
                          {s.name} ({s.group})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-auto flex items-center gap-2">
                    <select
                      value={gradeToAdd}
                      onChange={(e) => setGradeToAdd(e.target.value as KCSEGrade)}
                      className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-sky-700 font-semibold focus:outline-none cursor-pointer"
                    >
                      {VALID_GRADES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddSubject}
                      disabled={!subjectToAdd}
                      className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Subject</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Career Fields & Interests */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">Your Career Fields & Study Interests</h2>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                    <span>{selectedHobbies.length} Fields Selected</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select all topics and industries you genuinely enjoy. We will display courses in your chosen field <strong>first</strong>, followed by all other courses you qualify for.
                </p>
              </div>

              {/* Search & Domain Filter Toolbar */}
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={interestSearch}
                    onChange={(e) => setInterestSearch(e.target.value)}
                    placeholder="Search e.g. software, medicine, civil engineering, accounting, farming, teaching..."
                    className="w-full pl-9 pr-8 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  {interestSearch && (
                    <button
                      type="button"
                      onClick={() => setInterestSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Domain Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
                  {CAREER_DOMAINS.map(dom => {
                    const isActive = selectedDomain === dom.id;
                    const countInDom = dom.id === 'ALL' 
                      ? POPULAR_HOBBIES.length 
                      : POPULAR_HOBBIES.filter(h => h.category === dom.id).length;
                    return (
                      <button
                        key={dom.id}
                        type="button"
                        onClick={() => setSelectedDomain(dom.id)}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-sky-600 text-white font-semibold shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>{dom.name}</span>
                        <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-sky-700 text-sky-100' : 'bg-slate-100 text-slate-500'}`}>
                          {countInDom}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Selection Actions */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Showing {filteredHobbies.length} fields</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllVisibleHobbies}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      Select All Visible
                    </button>
                    {selectedHobbies.length > 0 && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <button
                          type="button"
                          onClick={handleClearAllHobbies}
                          className="text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          Clear All ({selectedHobbies.length})
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Rich Career Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {filteredHobbies.map((item) => {
                  const isSelected = selectedHobbies.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleToggleHobby(item.name)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected 
                          ? 'bg-sky-50/70 border-sky-400 ring-1 ring-sky-300 text-slate-900 shadow-2xs' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-sky-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Other Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Other Specialized Passions or Technical Interests <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={otherHobby}
                  onChange={(e) => setOtherHobby(e.target.value)}
                  placeholder="e.g. Drone piloting, beadwork, baking, mobile app design, robotic sensors"
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Intended Course / Career Tracks */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">Intended Course(s) & Study Targets</h2>
                  <span className="text-xs text-slate-500">
                    Select one or more target courses
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Select your primary dream course(s) or choose "I don't know yet" for open exploration. You can choose multiple options.
                </p>
              </div>

              {/* Selected Courses Chips */}
              {selectedIntendedCourses.length > 0 && !selectedIntendedCourses.includes("I don't know yet") && (
                <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">
                    Your Target Course Selections ({selectedIntendedCourses.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIntendedCourses.map((c) => (
                      <span 
                        key={c}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-sky-300 text-sky-900 shadow-2xs"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIntendedCourse(c)}
                          className="hover:text-rose-600 text-slate-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Search or Select Programmes
                </label>
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search e.g. Computer Science, Medicine, Civil Engineering, Nursing, Commerce..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  {courseSearch && (
                    <button
                      type="button"
                      onClick={() => setCourseSearch('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Popular Course Selection Buttons (Multi-Select) */}
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {filteredCourses.map((c) => {
                    const isSelected = selectedIntendedCourses.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleToggleIntendedCourse(c)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between border cursor-pointer ${
                          isSelected 
                            ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold ring-1 ring-sky-300' 
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span>{c}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-sky-600 bg-sky-100/70 px-2 py-0.5 rounded">
                            Target Choice
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Undecided Button Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleIntendedCourse("I don't know yet");
                    setCourseSearch('');
                  }}
                  className={`w-full py-3 px-4 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    selectedIntendedCourses.includes("I don't know yet")
                      ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-300' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  I don't know yet — Recommend purely from my KCSE grades & interests
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Review Your Assessment Input</h2>
                <p className="text-xs text-slate-500">
                  Confirm your entered results before our automated engine computes your options.
                </p>
              </div>

              <div className="space-y-4">
                {/* Academic Profile Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</span>
                    <span className="text-xs font-mono font-semibold text-sky-700">KCSE {kcseYear}</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mb-1">{studentName}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-3">
                    <span>Estimated Mean Grade: <strong className="text-sky-700 font-mono">{liveCalculation.meanGrade}</strong></span>
                    <span>·</span>
                    <span>Total Aggregate: <strong className="text-sky-700 font-mono">{liveCalculation.totalAggregate}/84 pts</strong></span>
                  </div>
                </div>

                {/* Intended Course */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Targeted Study Fields / Dream Courses ({selectedIntendedCourses.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIntendedCourses.map(c => (
                      <span key={c} className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selected Career Fields & Interests */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Selected Career Fields & Interests ({selectedHobbies.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs text-slate-700">
                    {selectedHobbies.map(h => (
                      <span key={h} className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-800 font-medium">
                        {h}
                      </span>
                    ))}
                    {otherHobby && (
                      <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 italic">
                        {otherHobby}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNextStep}
              className={`px-5 sm:px-6 py-2.5 text-xs font-semibold text-white rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer ${
                isSubmitting 
                  ? 'bg-sky-400 cursor-not-allowed opacity-90' 
                  : 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700'
              }`}
            >
              {currentStep === 5 && isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
                  <span>Analyzing Career Options...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === 5 ? 'Analyze Career Options' : 'Next Step'}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
