import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import User from "../models/User.js"
import Course from "../models/Course.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../.env") })

// Course data based on categories
const courseData = [
  // Class 12th CBSE Board - PCB
  {
    title: "Class 12th - Physics (CBSE Board)",
    category: "Class 12",
    subcategory: "Physics",
    description: "Complete Physics course for Class 12 CBSE Board exam preparation with board-specific pattern and marking scheme.",
    price: 3499,
    duration: "20 weeks",
    courseLevel: "Advanced",
    prerequisites: "Class 11 Physics",
    whatYouWillLearn: [
      "Electrostatics and current electricity",
      "Magnetism and electromagnetic induction",
      "Alternating current and electromagnetic waves",
      "Optics and wave optics",
      "Modern physics including atoms and nuclei",
      "CBSE board exam pattern and marking scheme",
      "Important numerical problems and derivations",
    ],
    curriculum: [
      {
        module: "Electricity and Magnetism",
        topics: ["Electrostatics", "Current Electricity", "Magnetism", "Electromagnetic Induction", "AC Circuits"],
      },
      { module: "Optics", topics: ["Ray Optics", "Wave Optics", "Optical Instruments", "Human Eye"] },
      { module: "Modern Physics", topics: ["Dual Nature of Radiation", "Atoms", "Nuclei", "Semiconductors"] },
      { module: "Board Exam Preparation", topics: ["Sample Papers", "Previous Year Questions", "Marking Scheme", "Time Management"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },
  {
    title: "Class 12th - Chemistry (CBSE Board)",
    category: "Class 12",
    subcategory: "Chemistry",
    description: "Complete Chemistry course for Class 12 CBSE Board with focus on organic, inorganic and physical chemistry as per CBSE syllabus.",
    price: 3499,
    duration: "20 weeks",
    courseLevel: "Advanced",
    prerequisites: "Class 11 Chemistry",
    whatYouWillLearn: [
      "Solid state chemistry and solutions",
      "Electrochemistry and chemical kinetics",
      "Surface chemistry and general principles",
      "d and f block elements",
      "Coordination compounds and organic chemistry",
      "Biomolecules and polymers",
      "Chemistry in everyday life",
    ],
    curriculum: [
      { module: "Physical Chemistry", topics: ["Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics"] },
      { module: "Inorganic Chemistry", topics: ["p-Block Elements", "d and f Block", "Coordination Compounds"] },
      { module: "Organic Chemistry", topics: ["Haloalkanes & Haloarenes", "Alcohols & Phenols", "Aldehydes & Ketones", "Carboxylic Acids", "Amines"] },
      { module: "Applied Chemistry", topics: ["Biomolecules", "Polymers", "Chemistry in Everyday Life"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },
  {
    title: "Class 12th - Biology (CBSE Board)",
    category: "Class 12",
    subcategory: "Biology",
    description: "Complete Biology course for Class 12 CBSE Board covering genetics, evolution, biotechnology and human health.",
    price: 3499,
    duration: "20 weeks",
    courseLevel: "Advanced",
    prerequisites: "Class 11 Biology",
    whatYouWillLearn: [
      "Reproduction in organisms and sexual reproduction",
      "Genetics and evolution principles",
      "Biology and human welfare",
      "Biotechnology and its applications",
      "Ecology and environment",
      "CBSE board exam strategies",
      "Diagram-based questions and long answers",
    ],
    curriculum: [
      { module: "Reproduction", topics: ["Sexual Reproduction", "Human Reproduction", "Reproductive Health"] },
      { module: "Genetics & Evolution", topics: ["Principles of Inheritance", "Molecular Basis", "Evolution"] },
      { module: "Biology & Human Welfare", topics: ["Health & Disease", "Microbes", "Improvement in Food"] },
      { module: "Biotechnology", topics: ["Principles", "Processes", "Applications"] },
      { module: "Ecology", topics: ["Organisms", "Populations", "Ecosystems", "Environmental Issues"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // Class 12th ISC Board - PCB
  {
    title: "Class 12th - Physics (ISC Board)",
    category: "Class 12",
    subcategory: "Physics",
    description: "Complete Physics course for Class 12 ISC Board with focus on ISC syllabus and examination pattern.",
    price: 3799,
    duration: "22 weeks",
    courseLevel: "Advanced",
    prerequisites: "Class 11 Physics",
    whatYouWillLearn: [
      "Electrostatics and current electricity as per ISC syllabus",
      "Magnetism and electromagnetic induction",
      "Optics and optical instruments",
      "Modern physics with numerical problems",
      "ISC practical examination preparation",
      "Project work guidance",
      "ISC board specific question patterns",
    ],
    curriculum: [
      {
        module: "Electricity & Magnetism",
        topics: ["Electrostatics", "Current Electricity", "Magnetic Effects", "EMI", "AC"]
      },
      { module: "Optics", topics: ["Reflection", "Refraction", "Optical Instruments", "Wave Optics"] },
      { module: "Modern Physics", topics: ["Dual Nature", "Atoms", "Nuclei", "Semiconductors"] },
      { module: "ISC Specific", topics: ["Practical Preparation", "Project Guidelines", "Viva Preparation"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },
  {
    title: "Class 12th - Chemistry (ISC Board)",
    category: "Class 12",
    subcategory: "Chemistry",
    description: "Complete Chemistry course for Class 12 ISC Board covering theoretical and practical aspects.",
    price: 3799,
    duration: "22 weeks",
    courseLevel: "Advanced",
    prerequisites: "Class 11 Chemistry",
    whatYouWillLearn: [
      "Physical chemistry concepts as per ISC syllabus",
      "Inorganic chemistry with periodic trends",
      "Organic chemistry reactions and mechanisms",
      "ISC practical chemistry experiments",
      "Volumetric analysis and qualitative analysis",
      "Project work and internal assessment",
      "ISC previous year papers analysis",
    ],
    curriculum: [
      { module: "Physical Chemistry", topics: ["Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry"] },
      { module: "Inorganic Chemistry", topics: ["p-Block", "d-Block", "f-Block", "Coordination"] },
      { module: "Organic Chemistry", topics: ["Haloalkanes", "Alcohols", "Aldehydes", "Carboxylic", "Amines", "Biomolecules"] },
      { module: "Practical Chemistry", topics: ["Volumetric", "Qualitative", "Chromatography", "Project Work"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },
  {
    title: "Class 12th - Biology (ISC Board)",
    category: "Class 12",
    subcategory: "Biology",
    description: "Complete Biology course for Class 12 ISC Board with practical emphasis and project work.",
    price: 3799,
    duration: "22 weeks",
    courseLevel: "Advanced",
    prerequisites: "Class 11 Biology",
    whatYouWillLearn: [
      "Plant physiology and human physiology",
      "Genetics and biotechnology",
      "Ecology and environmental issues",
      "ISC practical biology experiments",
      "Microscopy and slide preparation",
      "Project work and field studies",
      "ISC examination strategies",
    ],
    curriculum: [
      { module: "Physiology", topics: ["Plant Physiology", "Human Physiology", "Reproduction"] },
      { module: "Genetics & Biotechnology", topics: ["Molecular Genetics", "Biotech Principles", "Applications"] },
      { module: "Ecology", topics: ["Ecosystems", "Biodiversity", "Environmental Issues"] },
      { module: "Practical Biology", topics: ["Experiments", "Microscopy", "Slide Prep", "Field Study"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // Class 12th UP Board - PCB
  {
    title: "Class 12th - Physics (UP Board)",
    category: "Class 12",
    subcategory: "Physics",
    description: "Physics course for Class 12 UP Board with syllabus designed specifically for UP Board examination pattern.",
    price: 2999,
    duration: "18 weeks",
    courseLevel: "Intermediate",
    prerequisites: "Class 11 Physics",
    whatYouWillLearn: [
      "Fundamental principles of physics",
      "Electricity and magnetism",
      "Optics and waves",
      "Modern physics",
      "UP Board exam pattern",
      "Important questions and notes",
      "Practical preparation",
    ],
    curriculum: [
      { module: "Electricity", topics: ["Electrostatics", "Electric Current", "Magnetism"] },
      { module: "Optics", topics: ["Reflection of Light", "Refraction of Light", "Optical Instruments"] },
      { module: "Modern Physics", topics: ["Atoms", "Nuclear Physics", "Semiconductors"] },
      { module: "UP Board Specific", topics: ["Previous Year Papers", "Practical Guide", "Exam Strategy"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },
  {
    title: "Class 12th - Chemistry (UP Board)",
    category: "Class 12",
    subcategory: "Chemistry",
    description: "Chemistry course for Class 12 UP Board covering all topics as per UP Board syllabus with practical focus.",
    price: 2999,
    duration: "18 weeks",
    courseLevel: "Intermediate",
    prerequisites: "Class 11 Chemistry",
    whatYouWillLearn: [
      "Basic chemical principles",
      "Organic chemistry reactions",
      "Inorganic chemistry concepts",
      "UP Board practical chemistry",
      "Chemical calculations and formulas",
      "UP Board question patterns",
      "Important topics for examination",
    ],
    curriculum: [
      { module: "Physical Chemistry", topics: ["Solutions", "Electrochemistry", "Chemical Kinetics"] },
      { module: "Inorganic Chemistry", topics: ["p-Block Elements", "d-Block Elements", "Coordination Compounds"] },
      { module: "Organic Chemistry", topics: ["Halo Compounds", "Alcohols", "Aldehydes", "Carboxylic Acids"] },
      { module: "Practical Chemistry", topics: ["Experiments", "Practical File", "Viva Preparation"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },
  {
    title: "Class 12th - Biology (UP Board)",
    category: "Class 12",
    subcategory: "Biology",
    description: "Biology course for Class 12 UP Board with comprehensive coverage of botany and zoology topics.",
    price: 2999,
    duration: "18 weeks",
    courseLevel: "Intermediate",
    prerequisites: "Class 11 Biology",
    whatYouWillLearn: [
      "Plant anatomy and physiology",
      "Human anatomy and physiology",
      "Genetics and evolution",
      "Ecology and environment",
      "UP Board practical biology",
      "Important diagrams and labeling",
      "UP Board examination techniques",
    ],
    curriculum: [
      { module: "Botany", topics: ["Plant Anatomy", "Plant Physiology", "Plant Reproduction"] },
      { module: "Zoology", topics: ["Human Anatomy", "Human Physiology", "Reproduction"] },
      { module: "Genetics & Evolution", topics: ["Basic Genetics", "Evolutionary Biology"] },
      { module: "Practical Biology", topics: ["Slide Preparation", "Experiments", "Project Work"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // NEET Foundation 11th
  {
    title: "NEET Foundation - Class 11th",
    category: "NEET Foundation",
    subcategory: "PCB",
    description: "NEET foundation course for Class 11th students covering Physics, Chemistry and Biology basics for NEET preparation.",
    price: 3999,
    duration: "24 weeks",
    courseLevel: "Beginner",
    prerequisites: "Class 10 Science",
    whatYouWillLearn: [
      "Basic concepts of physics for NEET",
      "Foundation of chemistry principles",
      "Biology fundamentals for medical entrance",
      "NEET pattern introduction",
      "Time management skills",
      "Basic problem solving techniques",
      "Study planning for NEET aspirants",
    ],
    curriculum: [
      { module: "Physics Foundation", topics: ["Mechanics Basics", "Thermodynamics", "Waves", "Optics Basics"] },
      { module: "Chemistry Foundation", topics: ["Basic Organic", "Inorganic Basics", "Physical Chemistry"] },
      { module: "Biology Foundation", topics: ["Cell Biology", "Plant Physiology", "Human Physiology"] },
      { module: "NEET Basics", topics: ["Exam Pattern", "Preparation Strategy", "Time Management"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // NEET Foundation 12th
  {
    title: "NEET Foundation - Class 12th",
    category: "NEET Foundation",
    subcategory: "PCB",
    description: "NEET foundation course for Class 12th students focusing on advanced concepts and NEET preparation strategies.",
    price: 4499,
    duration: "26 weeks",
    courseLevel: "Intermediate",
    prerequisites: "Class 11 Science",
    whatYouWillLearn: [
      "Advanced physics concepts for NEET",
      "Organic chemistry mechanisms",
      "Human physiology and genetics",
      "NEET question pattern analysis",
      "Mock test strategies",
      "Revision techniques",
      "Speed and accuracy improvement",
    ],
    curriculum: [
      { module: "Advanced Physics", topics: ["Electrostatics", "Magnetism", "Modern Physics", "Optics"] },
      { module: "Organic Chemistry", topics: ["Reaction Mechanisms", "Named Reactions", "Biomolecules"] },
      { module: "Biology Advanced", topics: ["Genetics", "Biotechnology", "Ecology", "Human Health"] },
      { module: "NEET Strategies", topics: ["Mock Tests", "Revision Plans", "Question Solving Techniques"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // NEET Fresher (12th passed)
  {
    title: "NEET Fresher Course",
    category: "NEET",
    subcategory: "PCB",
    description: "Complete NEET preparation course for 12th passed students covering all subjects with intensive practice.",
    price: 5999,
    duration: "36 weeks",
    courseLevel: "Advanced",
    prerequisites: "Class 12 PCB",
    whatYouWillLearn: [
      "Complete NEET syllabus coverage",
      "Physics numerical solving techniques",
      "Chemistry organic and inorganic concepts",
      "Biology botany and zoology",
      "Full length mock tests",
      "Previous year paper analysis",
      "Time management and exam strategies",
    ],
    curriculum: [
      { module: "Complete Physics", topics: ["Mechanics", "EM Waves", "Optics", "Modern Physics", "Thermodynamics"] },
      { module: "Complete Chemistry", topics: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"] },
      { module: "Complete Biology", topics: ["Botany", "Zoology", "Genetics", "Biotechnology", "Ecology"] },
      { module: "Test Series", topics: ["Chapter Tests", "Subject Tests", "Full Mock Tests", "Analysis Sessions"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // NEET Dropper
  {
    title: "NEET Dropper Course",
    category: "NEET",
    subcategory: "PCB",
    description: "Specialized course for NEET droppers with focused revision, test series and personalized guidance.",
    price: 6999,
    duration: "40 weeks",
    courseLevel: "Advanced",
    prerequisites: "Previous NEET Attempt",
    whatYouWillLearn: [
      "Advanced concept clarification",
      "Weak area identification and improvement",
      "High yield topic revision",
      "Speed and accuracy enhancement",
      "Stress management techniques",
      "Previous mistakes analysis",
      "Personalized study plan",
    ],
    curriculum: [
      { module: "Advanced Revision", topics: ["Concept Clarification", "Formula Revision", "Diagram Practice"] },
      { module: "Weakness to Strength", topics: ["Performance Analysis", "Targeted Practice", "Remedial Sessions"] },
      { module: "Intensive Test Series", topics: ["Topic Tests", "Revision Tests", "Grand Tests", "Analysis"] },
      { module: "Personal Guidance", topics: ["Study Plan", "Time Table", "Motivation Sessions", "Doubt Clearing"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // TGT/PGT Biology Classes
  {
    title: "TGT/PGT Biology Preparation",
    category: "TGT/PGT",
    subcategory: "Biology",
    description: "Complete preparation course for TGT and PGT Biology teaching examinations with pedagogy and subject expertise.",
    price: 4999,
    duration: "24 weeks",
    courseLevel: "Advanced",
    prerequisites: "B.Sc/M.Sc in Biology",
    whatYouWillLearn: [
      "Advanced biology concepts for teaching",
      "Pedagogy and teaching methodology",
      "Classroom management techniques",
      "Lesson planning and curriculum development",
      "Assessment and evaluation methods",
      "Teaching aptitude and communication skills",
      "Previous year paper analysis",
    ],
    curriculum: [
      { module: "Advanced Biology", topics: ["Cell Biology", "Genetics", "Physiology", "Ecology", "Evolution"] },
      { module: "Teaching Pedagogy", topics: ["Teaching Methods", "Classroom Management", "Lesson Planning"] },
      { module: "Subject Knowledge", topics: ["School Curriculum", "Practical Skills", "Resource Management"] },
      { module: "Exam Preparation", topics: ["Previous Papers", "Mock Tests", "Interview Preparation"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // KVS/NVS Biology Classes (Tier 2)
  {
    title: "KVS/NVS Biology (Tier 2)",
    category: "KVS/NVS",
    subcategory: "Biology",
    description: "Specialized course for KVS/NVS Biology teacher recruitment Tier 2 examination with focus on descriptive papers.",
    price: 5499,
    duration: "26 weeks",
    courseLevel: "Advanced",
    prerequisites: "B.Ed with Biology",
    whatYouWillLearn: [
      "Detailed biology concepts for KVS/NVS",
      "Descriptive answer writing techniques",
      "Lesson plan preparation for practical",
      "Educational psychology application",
      "School administration knowledge",
      "Child development and pedagogy",
      "Interview and demo lesson preparation",
    ],
    curriculum: [
      { module: "Biology Advanced Topics", topics: ["Detailed Zoology", "Detailed Botany", "Genetics", "Biotechnology"] },
      { module: "Descriptive Skills", topics: ["Answer Writing", "Essay Writing", "Lesson Plan Writing"] },
      { module: "Educational Psychology", topics: ["Learning Theories", "Child Development", "Teaching Strategies"] },
      { module: "Tier 2 Specific", topics: ["Demo Lessons", "Interview Skills", "School Management"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // AIIMS Paramedical Entrance
  {
    title: "AIIMS Paramedical Entrance Preparation",
    category: "AIIMS Paramedical",
    subcategory: "PCB",
    description: "Complete preparation course for AIIMS Paramedical entrance examinations covering all subjects.",
    price: 3999,
    duration: "20 weeks",
    courseLevel: "Intermediate",
    prerequisites: "Class 12 PCB",
    whatYouWillLearn: [
      "Physics concepts for paramedical exams",
      "Chemistry topics for medical field",
      "Biology emphasis on human anatomy",
      "AIIMS specific question patterns",
      "General knowledge and reasoning",
      "English language skills",
      "Mock test practice",
    ],
    curriculum: [
      { module: "Physics", topics: ["Basics", "Medical Applications", "Instrumentation"] },
      { module: "Chemistry", topics: ["Organic Chemistry", "Biochemistry", "Medical Chemistry"] },
      { module: "Biology", topics: ["Human Anatomy", "Physiology", "Medical Terminology"] },
      { module: "General Aptitude", topics: ["Reasoning", "English", "General Knowledge"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // Nursing Entrance Classes
  {
    title: "Nursing Entrance Preparation",
    category: "Nursing Entrance",
    subcategory: "PCB",
    description: "Complete course for nursing entrance examinations with focus on biology and chemistry.",
    price: 2999,
    duration: "16 weeks",
    courseLevel: "Beginner",
    prerequisites: "Class 12 PCB",
    whatYouWillLearn: [
      "Biology for nursing applications",
      "Chemistry basics for medical field",
      "Physics relevant to nursing",
      "General knowledge and current affairs",
      "English language proficiency",
      "Logical reasoning skills",
      "Nursing ethics and basics",
    ],
    curriculum: [
      { module: "Biology for Nursing", topics: ["Human Body", "Microbiology", "First Aid", "Nutrition"] },
      { module: "Chemistry Basics", topics: ["Medical Chemistry", "Drug Basics", "Biochemistry"] },
      { module: "General Studies", topics: ["Current Affairs", "General Science", "Mental Ability"] },
      { module: "Nursing Basics", topics: ["Nursing Ethics", "Patient Care", "Medical Terms"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // CUET Entrance (PCB)
  {
    title: "CUET PCB Entrance Preparation",
    category: "CUET (UG)",
    subcategory: "PCB",
    description: "Complete preparation for CUET undergraduate entrance for PCB stream students.",
    price: 3499,
    duration: "18 weeks",
    courseLevel: "Intermediate",
    prerequisites: "Class 12 PCB",
    whatYouWillLearn: [
      "Physics for CUET examination",
      "Chemistry topics as per CUET syllabus",
      "Biology concepts for domain test",
      "General test preparation",
      "Language test skills",
      "CUET pattern and marking scheme",
      "Time management strategies",
    ],
    curriculum: [
      { module: "Domain Subjects", topics: ["Physics Concepts", "Chemistry Topics", "Biology Syllabus"] },
      { module: "General Test", topics: ["Quantitative", "Reasoning", "General Awareness"] },
      { module: "Language Test", topics: ["Reading Comprehension", "Vocabulary", "Grammar"] },
      { module: "CUET Strategy", topics: ["Paper Pattern", "Time Management", "Mock Tests"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  // Foreign Language Courses
  {
    title: "French Language - Beginner to Intermediate",
    category: "Foreign Languages",
    subcategory: "French",
    description: "Comprehensive French language course for beginners covering speaking, reading, writing and listening skills.",
    price: 2999,
    duration: "16 weeks",
    courseLevel: "Beginner",
    prerequisites: "No prior knowledge required",
    whatYouWillLearn: [
      "Basic French grammar and vocabulary",
      "French pronunciation and phonetics",
      "Everyday conversation skills",
      "Reading and comprehension",
      "Writing simple sentences and paragraphs",
      "French culture and customs",
      "DELF A1 level preparation",
    ],
    curriculum: [
      { module: "Grammar Foundation", topics: ["Nouns & Articles", "Verbs & Tenses", "Adjectives", "Pronouns"] },
      { module: "Speaking Skills", topics: ["Pronunciation", "Basic Dialogues", "Everyday Conversations"] },
      { module: "Reading & Writing", topics: ["Simple Texts", "Letter Writing", "Comprehension"] },
      { module: "Cultural Aspects", topics: ["French Culture", "Social Etiquette", "Travel French"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  {
    title: "German Language - Beginner Course",
    category: "Foreign Languages",
    subcategory: "German",
    description: "Complete German language course for beginners with focus on grammar, vocabulary and conversation.",
    price: 2999,
    duration: "16 weeks",
    courseLevel: "Beginner",
    prerequisites: "No prior knowledge required",
    whatYouWillLearn: [
      "German alphabet and pronunciation",
      "Basic grammar structures",
      "Essential vocabulary for daily use",
      "Simple conversation skills",
      "Reading basic German texts",
      "Writing skills development",
      "Introduction to German culture",
    ],
    curriculum: [
      { module: "Grammar Basics", topics: ["Articles", "Cases", "Verbs", "Sentence Structure"] },
      { module: "Vocabulary Building", topics: ["Greetings", "Numbers", "Family", "Food", "Travel"] },
      { module: "Communication Skills", topics: ["Introductions", "Asking Questions", "Daily Routines"] },
      { module: "Cultural Learning", topics: ["German Customs", "Traditions", "Social Norms"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  {
    title: "Spanish Language - Beginner Course",
    category: "Foreign Languages",
    subcategory: "Spanish",
    description: "Spanish language course for beginners covering all essential language skills.",
    price: 2999,
    duration: "16 weeks",
    courseLevel: "Beginner",
    prerequisites: "No prior knowledge required",
    whatYouWillLearn: [
      "Spanish alphabet and pronunciation",
      "Basic grammar rules",
      "Essential Spanish vocabulary",
      "Conversation skills for daily use",
      "Reading comprehension",
      "Writing practice",
      "Hispanic culture introduction",
    ],
    curriculum: [
      { module: "Grammar Foundation", topics: ["Nouns & Gender", "Verbs", "Tenses", "Adjectives"] },
      { module: "Speaking Practice", topics: ["Pronunciation", "Common Phrases", "Dialogues"] },
      { module: "Reading & Writing", topics: ["Simple Texts", "Email Writing", "Composition"] },
      { module: "Cultural Context", topics: ["Spanish Culture", "Latin American Culture", "Festivals"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  {
    title: "Russian Language - Beginner Course",
    category: "Foreign Languages",
    subcategory: "Russian",
    description: "Russian language course for beginners with focus on Cyrillic alphabet and basic communication.",
    price: 3499,
    duration: "18 weeks",
    courseLevel: "Beginner",
    prerequisites: "No prior knowledge required",
    whatYouWillLearn: [
      "Cyrillic alphabet reading and writing",
      "Basic Russian grammar",
      "Essential vocabulary",
      "Simple conversation skills",
      "Russian pronunciation",
      "Reading practice",
      "Introduction to Russian culture",
    ],
    curriculum: [
      { module: "Alphabet & Pronunciation", topics: ["Cyrillic Script", "Sounds", "Reading Practice"] },
      { module: "Grammar Basics", topics: ["Cases System", "Verbs", "Sentence Structure"] },
      { module: "Vocabulary", topics: ["Greetings", "Numbers", "Family", "Food", "Travel"] },
      { module: "Cultural Aspects", topics: ["Russian Traditions", "Etiquette", "History"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },

  {
    title: "Japanese Language - Beginner Course",
    category: "Foreign Languages",
    subcategory: "Japanese",
    description: "Japanese language course for beginners covering Hiragana, Katakana and basic Kanji.",
    price: 3499,
    duration: "18 weeks",
    courseLevel: "Beginner",
    prerequisites: "No prior knowledge required",
    whatYouWillLearn: [
      "Hiragana and Katakana writing",
      "Basic Kanji characters",
      "Japanese grammar structures",
      "Essential vocabulary",
      "Conversation skills",
      "Reading simple texts",
      "Japanese culture and etiquette",
    ],
    curriculum: [
      { module: "Writing Systems", topics: ["Hiragana", "Katakana", "Basic Kanji"] },
      { module: "Grammar Foundation", topics: ["Particles", "Verbs", "Sentence Patterns"] },
      { module: "Speaking Skills", topics: ["Pronunciation", "Basic Dialogues", "Polite Language"] },
      { module: "Cultural Learning", topics: ["Japanese Customs", "Business Etiquette", "Traditional Arts"] },
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true,
    },
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/edutech")
    console.log("MongoDB connected for seeding")

    // Clear existing data
    await User.deleteMany({})
    await Course.deleteMany({})
    console.log("Existing data cleared")

    // Create expert faculty with enhanced qualifications
    const expertFaculty = new User({
      name: "Dr. Abhishek Jha",
      email: "abhishekjha2707@gmail.com",
      password: "faculty123",
      role: "faculty",
      phone: "9876543211",
      qualifications: [
        "Ph.D in Chemistry",
        "NET & GATE Qualified",
        "Ex Lecturer Government College",
        "15+ Years Teaching Experience",
        "IIT Delhi Alumni",
      ],
      experience: "15+ years of teaching experience in Chemistry and competitive exam preparation",
      specialization: ["Chemistry", "JEE", "NEET", "NET", "GATE"],
      achievements: [
        "Mentored 5000+ successful students",
        "100+ IIT selections",
        "50+ AIIMS selections",
        "Expert in competitive exam patterns",
      ],
    })

    const student = new User({
      name: "Ajay Jha",
      email: "ajha97575@gmail.com",
      password: "password123",
      role: "student",
      phone: "9876543210",
    })

    const admin = new User({
      name: "Abhishek",
      email: "abhishek.flyanytrip@gmail.com",
      password: "admin123",
      role: "admin",
      phone: "9876543212",
    })

    await expertFaculty.save()
    console.log("Expert faculty created with enhanced qualifications")

    await student.save()
    console.log("Student user created with hashed password")

    await admin.save()
    console.log("Admin user created with hashed password")

    const coursesToCreate = courseData.map((course) => ({
      ...course,
      faculty: expertFaculty._id,
      assignedTo: expertFaculty.email,
      totalEnrolled: Math.floor(Math.random() * 100) + 20, // Increased enrollment numbers
      instructorQualification: "Ph.D, NET & GATE Qualified, 15+ Years Experience",
    }))

    await Course.insertMany(coursesToCreate)
    console.log(`Courses created and assigned to expert faculty (${coursesToCreate.length} courses)`)

    console.log("✓ Seeding completed successfully!")
    console.log("✓ All data saved to MongoDB")
    process.exit(0)
  } catch (error) {
    console.error("✗ Seeding failed:", error.message)
    process.exit(1)
  }
}

seed()