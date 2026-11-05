/**
 * KCSE Subject Catalog & KNEC Grading Constants
 */

import { KCSEGrade } from '../types';

export const GRADE_POINTS: Record<KCSEGrade, number> = {
  'A': 12,
  'A-': 11,
  'B+': 10,
  'B': 9,
  'B-': 8,
  'C+': 7,
  'C': 6,
  'C-': 5,
  'D+': 4,
  'D': 3,
  'D-': 2,
  'E': 1,
};

export const VALID_GRADES: KCSEGrade[] = [
  'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'
];

export interface KCSEStandardSubject {
  code: string;
  name: string;
  group: 'Compulsory' | 'Sciences' | 'Humanities' | 'Applied/Technical' | 'Languages/Creative';
  isScience?: boolean;
}

export const KCSE_SUBJECTS: KCSEStandardSubject[] = [
  // Group 1: Compulsory
  { code: '101', name: 'English', group: 'Compulsory' },
  { code: '102', name: 'Kiswahili', group: 'Compulsory' },
  { code: '121', name: 'Mathematics', group: 'Compulsory' },

  // Group 2: Sciences
  { code: '231', name: 'Biology', group: 'Sciences', isScience: true },
  { code: '232', name: 'Physics', group: 'Sciences', isScience: true },
  { code: '233', name: 'Chemistry', group: 'Sciences', isScience: true },
  { code: '237', name: 'General Science', group: 'Sciences', isScience: true },

  // Group 3: Humanities
  { code: '311', name: 'History and Government', group: 'Humanities' },
  { code: '312', name: 'Geography', group: 'Humanities' },
  { code: '313', name: 'CRE (Christian Religious Education)', group: 'Humanities' },
  { code: '314', name: 'IRE (Islamic Religious Education)', group: 'Humanities' },
  { code: '315', name: 'HRE (Hindu Religious Education)', group: 'Humanities' },

  // Group 4: Applied & Technical
  { code: '565', name: 'Business Studies', group: 'Applied/Technical' },
  { code: '451', name: 'Computer Studies', group: 'Applied/Technical' },
  { code: '443', name: 'Agriculture', group: 'Applied/Technical' },
  { code: '441', name: 'Home Science', group: 'Applied/Technical' },
  { code: '442', name: 'Art and Design', group: 'Applied/Technical' },
  { code: '444', name: 'Woodwork', group: 'Applied/Technical' },
  { code: '445', name: 'Metalwork', group: 'Applied/Technical' },
  { code: '446', name: 'Building Construction', group: 'Applied/Technical' },
  { code: '447', name: 'Power Mechanics', group: 'Applied/Technical' },
  { code: '448', name: 'Electricity', group: 'Applied/Technical' },
  { code: '449', name: 'Drawing and Design', group: 'Applied/Technical' },
  { code: '450', name: 'Aviation Technology', group: 'Applied/Technical' },

  // Group 5: Languages & Creative
  { code: '501', name: 'French', group: 'Languages/Creative' },
  { code: '502', name: 'German', group: 'Languages/Creative' },
  { code: '503', name: 'Arabic', group: 'Languages/Creative' },
  { code: '511', name: 'Music', group: 'Languages/Creative' },
  { code: '504', name: 'Kenya Sign Language', group: 'Languages/Creative' },
];

export interface CareerInterestItem {
  name: string;
  category: string;
  description?: string;
}

export const CAREER_DOMAINS: { id: string; name: string; icon: string }[] = [
  { id: 'ALL', name: 'All Fields', icon: 'Sparkles' },
  { id: 'Tech', name: 'Technology & Computing', icon: 'Code' },
  { id: 'Health', name: 'Medicine & Health Sciences', icon: 'Heart' },
  { id: 'Engineering', name: 'Engineering & Mechanics', icon: 'Wrench' },
  { id: 'BuiltEnv', name: 'Architecture & Construction', icon: 'Building' },
  { id: 'Business', name: 'Business, Finance & Trade', icon: 'Briefcase' },
  { id: 'Agric', name: 'Agriculture, Livestock & Food', icon: 'Leaf' },
  { id: 'LawSocial', name: 'Law, Governance & Society', icon: 'Scale' },
  { id: 'MediaCreative', name: 'Media, Design & Hospitality', icon: 'Camera' },
  { id: 'Education', name: 'Education & Teaching', icon: 'GraduationCap' },
  { id: 'Sciences', name: 'Pure & Applied Sciences', icon: 'FlaskConical' },
];

export const POPULAR_HOBBIES: CareerInterestItem[] = [
  // 1. Technology & Computing
  { name: 'Software Development & Coding', category: 'Tech', description: 'Building mobile apps, web applications, and backend systems' },
  { name: 'Cybersecurity & Ethical Hacking', category: 'Tech', description: 'Network protection, defense, ethical penetration testing' },
  { name: 'Artificial Intelligence & Data Science', category: 'Tech', description: 'Machine learning, big data analysis, analytics modeling' },
  { name: 'Computer Hardware & Networking', category: 'Tech', description: 'Router setup, servers, hardware maintenance, IT infrastructure' },
  { name: 'Web Design & Frontend Development', category: 'Tech', description: 'UI/UX design, responsive website development' },
  { name: 'Cloud Computing & DevOps', category: 'Tech', description: 'Cloud servers, deployment pipelines, containerization' },
  { name: 'Video Game Development', category: 'Tech', description: 'Game engines, 3D modeling, interactive physics' },
  { name: 'Mobile App Creation', category: 'Tech', description: 'Android & iOS development, app store publishing' },
  { name: 'Business Information Systems', category: 'Tech', description: 'Enterprise ERPs, database management, IT audits' },

  // 2. Medicine & Health Sciences
  { name: 'Human Medicine & Surgery', category: 'Health', description: 'Clinical patient care, diagnosis, medical surgery' },
  { name: 'Clinical Medicine & Community Health', category: 'Health', description: 'Primary health, dispensary diagnostics, outpatient surgery' },
  { name: 'Nursing & Patient Healthcare', category: 'Health', description: 'Hospital bedside care, maternal-child health, triage' },
  { name: 'Pharmacy & Drug Dispensation', category: 'Health', description: 'Pharmaceuticals, pharmacology, drug compounding' },
  { name: 'Medical Laboratory Diagnostics', category: 'Health', description: 'Blood tests, pathology, microbiology, clinical assays' },
  { name: 'Public Health & Epidemiology', category: 'Health', description: 'Disease surveillance, sanitation, community immunization' },
  { name: 'Physiotherapy & Rehabilitation', category: 'Health', description: 'Sports injury recovery, muscular rehabilitation' },
  { name: 'Nutrition, Dietetics & Wellness', category: 'Health', description: 'Therapeutic diets, clinical nutrition, wellness coaching' },
  { name: 'Dental Surgery & Oral Health', category: 'Health', description: 'Dentistry, orthodontics, teeth restoration' },
  { name: 'Radiography & Medical Imaging', category: 'Health', description: 'X-rays, MRI scans, CT scans, ultrasound imaging' },
  { name: 'Occupational Therapy', category: 'Health', description: 'Special needs support, neuro-motor adaptation' },

  // 3. Engineering & Technical Trades
  { name: 'Electrical & Power Engineering', category: 'Engineering', description: 'Power grids, electrical wiring, industrial power systems' },
  { name: 'Mechanical & Plant Engineering', category: 'Engineering', description: 'Machinery fabrication, engines, manufacturing plant operations' },
  { name: 'Civil & Structural Engineering', category: 'Engineering', description: 'Bridges, roads, dams, skyscrapers, foundation design' },
  { name: 'Mechatronics & Industrial Robotics', category: 'Engineering', description: 'Automated factory assembly, sensor integration, PLCs' },
  { name: 'Automotive Mechanics & Vehicles', category: 'Engineering', description: 'Engine overhaul, hybrid & electric cars, diagnostic scanning' },
  { name: 'Telecommunications & Fiber Networks', category: 'Engineering', description: '5G networks, satellite links, fiber optic routing' },
  { name: 'Renewable Energy & Solar Tech', category: 'Engineering', description: 'Solar PV setups, wind energy, green power systems' },
  { name: 'Agricultural & Biosystems Machinery', category: 'Engineering', description: 'Irrigation systems, tractors, post-harvest engineering' },
  { name: 'Petroleum & Drilling Engineering', category: 'Engineering', description: 'Oil well drilling, reservoir dynamics, pipeline transport' },
  { name: 'Mining & Mineral Extraction', category: 'Engineering', description: 'Geological excavation, gemstone processing, metallurgy' },
  { name: 'Welding & Metal Fabrication', category: 'Engineering', description: 'Arc welding, structural steel framing, metal fabrication' },
  { name: 'Plumbing & Water Piping Systems', category: 'Engineering', description: 'Water networks, commercial drainage, sanitary piping' },

  // 4. Architecture, Building & Design
  { name: 'Architecture & Building Design', category: 'BuiltEnv', description: 'Building blueprints, spatial aesthetics, architectural CAD' },
  { name: 'Quantity Surveying & Cost Estimation', category: 'BuiltEnv', description: 'Bills of quantities, construction contracts, tendering' },
  { name: 'Construction Project Management', category: 'BuiltEnv', description: 'Site supervision, contractor coordination, safety standards' },
  { name: 'Real Estate & Property Valuation', category: 'BuiltEnv', description: 'Commercial property management, land appraisal, asset sales' },
  { name: 'Urban & Town Regional Planning', category: 'BuiltEnv', description: 'City zoning, transportation networks, municipal layout' },
  { name: 'Interior Design & Spatial Decor', category: 'BuiltEnv', description: 'Home & office decor, acoustic design, lighting layout' },
  { name: 'Landscape Architecture & Green Parks', category: 'BuiltEnv', description: 'Public park design, ecological gardens, outdoor spaces' },
  { name: 'Surveying & Geoinformatics (GIS)', category: 'BuiltEnv', description: 'GPS land boundary marking, satellite mapping, photogrammetry' },

  // 5. Business, Accounting & Finance
  { name: 'Accounting & Professional Auditing', category: 'Business', description: 'CPA, tax filings, financial statements, internal control' },
  { name: 'Banking & Financial Investment', category: 'Business', description: 'Commercial loans, stock market securities, investment funds' },
  { name: 'Actuarial Science & Risk Analytics', category: 'Business', description: 'Pension math, insurance premium models, actuarial tables' },
  { name: 'Economics & National Policy', category: 'Business', description: 'Macroeconomic forecasting, market research, price dynamics' },
  { name: 'Business Administration & Management', category: 'Business', description: 'Corporate executive leadership, company operations' },
  { name: 'Procurement & Supply Chain Logistics', category: 'Business', description: 'E-procurement IFMIS, vendor sourcing, warehouse distribution' },
  { name: 'Human Resource Management', category: 'Business', description: 'Talent recruitment, employee welfare, labor law adherence' },
  { name: 'Marketing, Branding & Advertising', category: 'Business', description: 'Market campaigns, social ad conversion, brand building' },
  { name: 'Entrepreneurship & Startup Incubation', category: 'Business', description: 'Launching businesses, venture pitching, SME innovation' },
  { name: 'Co-operative & SACCO Management', category: 'Business', description: 'Credit unions, agricultural societies, cooperative governance' },

  // 6. Agriculture, Livestock & Food
  { name: 'Agribusiness & Farm Commerce', category: 'Agric', description: 'Commercial farm management, agricultural commodity export' },
  { name: 'Crop Production & Horticulture', category: 'Agric', description: 'Greenhouse agronomy, floriculture, high-yield vegetable crops' },
  { name: 'Animal Health & Veterinary Medicine', category: 'Agric', description: 'Livestock immunization, animal surgery, disease prevention' },
  { name: 'Dairy Farming & Livestock Production', category: 'Agric', description: 'Dairy cattle breeding, animal nutrition feed, poultry systems' },
  { name: 'Food Science & Industrial Processing', category: 'Agric', description: 'Factory beverage bottling, dairy packaging, food safety KEBS' },
  { name: 'Environmental Science & Conservation', category: 'Agric', description: 'Climate change mitigation, environmental audits, pollution control' },
  { name: 'Wildlife Management & Conservancies', category: 'Agric', description: 'National parks, eco-tourism, wildlife protection, ranger service' },
  { name: 'Fisheries & Commercial Aquaculture', category: 'Agric', description: 'Fish pond hatcheries, marine harvesting, tilapia farming' },
  { name: 'Forestry & Timber Enterprise', category: 'Agric', description: 'Afforestation, tree nursery seedlings, carbon credit projects' },

  // 7. Law, Governance & Social Sciences
  { name: 'Law (LL.B) & Legal Advocacy', category: 'LawSocial', description: 'Court litigation, constitutional law, human rights, corporate law' },
  { name: 'Criminology & Criminal Justice', category: 'LawSocial', description: 'DCI forensic investigation, crime scene profiling, cybercrime' },
  { name: 'International Relations & Diplomacy', category: 'LawSocial', description: 'Foreign ministry, embassy diplomatic missions, UN agencies' },
  { name: 'Public Administration & Devolved Governance', category: 'LawSocial', description: 'County commissioner offices, municipal management, public policy' },
  { name: 'Psychology & Mental Health Counseling', category: 'LawSocial', description: 'Therapeutic counseling, adolescent guidance, cognitive therapy' },
  { name: 'Social Work & Community Mobilization', category: 'LawSocial', description: 'NGO community projects, vulnerable child welfare, relief programs' },
  { name: 'Peace & Conflict Resolution', category: 'LawSocial', description: 'Dispute mediation, regional security, refugee coordination' },

  // 8. Media, Creative Arts & Hospitality
  { name: 'Journalism & News Broadcasting', category: 'MediaCreative', description: 'TV reporting, radio presentation, investigative journalism' },
  { name: 'Film Production & Cinematography', category: 'MediaCreative', description: 'Movie directing, camera operation, professional video editing' },
  { name: 'Graphic Design & Digital Illustration', category: 'MediaCreative', description: 'Visual branding, digital art, logo design, packaging graphics' },
  { name: 'Music Production & Sound Engineering', category: 'MediaCreative', description: 'Studio music recording, beat composition, audio mastering' },
  { name: 'Culinary Arts & Professional Chef Cooking', category: 'MediaCreative', description: 'Fine dining culinary, bakery, international gourmet menus' },
  { name: 'Hotel & Luxury Resort Management', category: 'MediaCreative', description: '5-star hotel front office, food & beverage hospitality, banqueting' },
  { name: 'Tourism Management & Safari Guiding', category: 'MediaCreative', description: 'Tour operations, game drive safari guiding, airline ticketing' },
  { name: 'Fashion Design & Garment Technology', category: 'MediaCreative', description: 'Clothing design, garment tailoring, runway collections' },
  { name: 'Photography & Commercial Studio', category: 'MediaCreative', description: 'Portrait photography, events, photo manipulation' },

  // 9. Education & Teaching
  { name: 'Secondary School Science Teaching', category: 'Education', description: 'Teaching Mathematics, Physics, Chemistry, Biology in High School' },
  { name: 'Secondary School Arts & Humanities Teaching', category: 'Education', description: 'Teaching English, Kiswahili, History, Geography, CRE' },
  { name: 'Special Needs Education (Braille / Sign Language)', category: 'Education', description: 'Teaching visual & hearing impaired learners, autism pedagogy' },
  { name: 'Early Childhood Development (ECDE)', category: 'Education', description: 'Kindergarten & pre-primary teaching, child pedagogy' },
  { name: 'Technical & TVET Instructor Training', category: 'Education', description: 'Training students in technical vocational colleges and polytechnics' },

  // 10. Pure & Applied Sciences
  { name: 'Biochemistry & Molecular Genetics', category: 'Sciences', description: 'DNA assays, biomedical research, KEMRI vaccine development' },
  { name: 'Industrial & Applied Chemistry', category: 'Sciences', description: 'Chemical manufacturing, cosmetic synthesis, plastic polymers' },
  { name: 'Analytical Chemistry & Quality Assay', category: 'Sciences', description: 'Laboratory quality testing, chromatography, KEBS analysis' },
  { name: 'Geology & Mineral Exploration', category: 'Sciences', description: 'Rock formations, groundwater drilling, KenGen geothermal wells' },
  { name: 'Meteorology & Weather Forecasting', category: 'Sciences', description: 'Kenya Met climate forecasting, aviation weather tracking' },
  { name: 'Applied Statistics & Data Modeling', category: 'Sciences', description: 'KNBS demographic surveys, actuarial statistics, sampling' },
];

export const POPULAR_INTENDED_COURSES = [
  'Computer Science',
  'Software Engineering',
  'Information Technology (IT)',
  'Cybersecurity',
  'Data Science & Analytics',
  'Applied Computer Technology',
  'Business Information Technology (BBIT)',
  'Medicine & Surgery (MBChB)',
  'Bachelor of Dental Surgery (BDS)',
  'Pharmacy',
  'Clinical Medicine & Community Health',
  'Nursing & Midwifery',
  'Medical Laboratory Science',
  'Public Health',
  'Physiotherapy',
  'Food, Nutrition & Dietetics',
  'Medical Radiography & Imaging',
  'Occupational Therapy',
  'Electrical & Electronics Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Mechatronic Engineering',
  'Biomedical Engineering',
  'Marine Engineering',
  'Mining & Mineral Processing Engineering',
  'Petroleum Engineering',
  'Agricultural & Biosystems Engineering',
  'Telecommunication Engineering',
  'Architecture',
  'Landscape Architecture',
  'Quantity Surveying',
  'Construction Management',
  'Real Estate & Property Valuation',
  'Urban & Regional Planning',
  'Interior Design',
  'Law (LL.B)',
  'Criminology & Criminal Justice',
  'International Relations & Diplomacy',
  'Public Administration & Governance',
  'Psychology',
  'Commerce (B.Com)',
  'Accounting & Finance',
  'Actuarial Science',
  'Financial Engineering',
  'Economics & Statistics',
  'Procurement & Supply Chain Management',
  'Business Administration (BBA)',
  'Agribusiness Management',
  'Food Science & Technology',
  'Animal Science & Production',
  'Horticulture',
  'Environmental Science',
  'Wildlife Enterprise & Management',
  'Fisheries & Aquaculture',
  'Forestry',
  'Biochemistry & Molecular Biology',
  'Industrial Chemistry',
  'Analytical Chemistry',
  'Meteorology',
  'Geology',
  'Education (Science)',
  'Education (Arts)',
  'Special Needs Education',
  'Early Childhood Development Education',
  'Journalism & Mass Communication',
  'Hospitality Management',
  'Tourism Management',
  'Film Production & Animation',
  'Diploma in Clinical Medicine & Surgery',
  'Diploma in Community Health Nursing (KRCHN)',
  'Diploma in Pharmacy',
  'Diploma in Medical Laboratory Technology',
  'Diploma in Civil Engineering',
  'Diploma in Electrical & Electronics Engineering',
  'Diploma in Mechanical Engineering',
  'Diploma in Architectural Technology',
  'Diploma in Quantity Surveying',
  'Diploma in Information Communication Technology (DICT)',
  'Diploma in Supply Chain Management',
  'Diploma in Food and Beverage (Culinary Arts)',
  'I don\'t know yet'
];
