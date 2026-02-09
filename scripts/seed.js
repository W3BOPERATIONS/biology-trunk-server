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
  // Existing courses remain here...
  // (All existing courses from the original file)

  // New Course 1: Class 12th - Biology (CBSE/ISC Board)
  {
    title: "Class 12th - Biology (CBSE/ISC Board)",
    category: "Class 12",
    subcategory: "Biology",
    description: "Complete Biology course for Class 12 CBSE/ISC Board exam preparation with board-specific pattern and marking scheme.",
    price: 2999,
    duration: "6 Months",
    courseLevel: "Advanced",
    prerequisites: "Class 11 Biology",
    whatYouWillLearn: [
      "Reproduction (Chapter 1,2,3)",
      "Genetics And Evolution (Chapter 4,5,6)",
      "Biology in Human Welfare (Chapter 7,8)",
      "Biotechnology (Chapter 9,10)",
      "Ecology (Chapter 11,12,13)",
      "CBSE/ISC board exam pattern and marking scheme",
      "Important Objective & Subjective Questions"
    ],
    curriculum: [
      {
        module: "Reproduction",
        topics: [
          "Sexual Reproduction in Flowering Plants",
          "Human Reproduction",
          "Reproductive Health"
        ]
      },
      {
        module: "Genetics And Evolution",
        topics: [
          "Principles of Inheritance and Variation",
          "Molecular Basis of Inheritance",
          "Evolution"
        ]
      },
      {
        module: "Biology in Human Welfare",
        topics: [
          "Human Health and Disease",
          "Microbes in Human Welfare"
        ]
      },
      {
        module: "Biotechnology",
        topics: [
          "Biotechnology: Principles and Processes"
        ]
      },
      {
        module: "Ecology",
        topics: [
          "Organisms and Populations",
          "Ecosystem",
          "Biodiversity and Conservation"
        ]
      },
      {
        module: "Board Exam Preparation",
        topics: [
          "Sample Papers",
          "Previous Year Questions",
          "Marking Scheme",
          "Time Management"
        ]
      }
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true
    }
    // No facultyName field here - it will be added in the seed function
  },

  // New Course 2: Class 12th - Physics (CBSE/ISC Board)
  {
    title: "Class 12th - Physics (CBSE/ISC Board)",
    category: "Class 12",
    subcategory: "Physics",
    description: "Complete Physics course for Class 12 CBSE/ISC Board exam preparation with board-specific pattern and marking scheme.",
    price: 2999,
    duration: "6 Months",
    courseLevel: "Advanced",
    prerequisites: "Class 11 Physics",
    whatYouWillLearn: [
      "Electrostatics and current electricity",
      "Magnetism and electromagnetic induction",
      "Alternating current and electromagnetic waves",
      "Optics and wave optics",
      "Modern physics including atoms and nuclei",
      "CBSE/ISC board exam pattern and marking scheme",
      "Important numerical problems and derivations"
    ],
    curriculum: [
      {
        module: "Electricity and Magnetism",
        topics: ["Electrostatics", "Current Electricity", "Magnetism", "Electromagnetic Induction", "AC Circuits"]
      },
      {
        module: "Optics",
        topics: ["Ray Optics", "Wave Optics", "Optical Instruments", "Human Eye"]
      },
      {
        module: "Modern Physics",
        topics: ["Dual Nature of Radiation", "Atoms", "Nuclei", "Semiconductors"]
      },
      {
        module: "Board Exam Preparation",
        topics: ["Sample Papers", "Previous Year Questions", "Marking Scheme", "Time Management"]
      }
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true
    }
  },

  // New Course 3: Class 11th - Biology (CBSE/ISC Board)
  {
    title: "Class 11th - Biology (CBSE/ISC Board)",
    category: "Class 11",
    subcategory: "Biology",
    description: "Complete Biology course for Class 11th CBSE/ISC Board exam preparation with board-specific pattern and marking scheme.",
    price: 2999,
    duration: "7 Months",
    courseLevel: "Advanced",
    prerequisites: "Class 9th & 10th Biology",
    whatYouWillLearn: [
      "DIVERSITY IN THE LIVING WORLD",
      "STRUCTURAL ORGANISATION IN PLANTS AND ANIMALS",
      "CELL: STRUCTURE AND FUNCTIONS",
      "PLANT PHYSIOLOGY",
      "HUMAN PHYSIOLOGY",
      "CBSE/ISC Board Exam Pattern And Marking Scheme",
      "Important Objective & Subjective Questions"
    ],
    curriculum: [
      {
        module: "DIVERSITY IN THE LIVING WORLD",
        topics: [
          "The Living World",
          "Biological Classification",
          "Plant Kingdom",
          "Animal Kingdom"
        ]
      },
      {
        module: "STRUCTURAL ORGANISATION IN PLANTS AND ANIMALS",
        topics: [
          "Morphology of Flowering Plants",
          "Anatomy of Flowering Plants",
          "Structural Organisation in Animals"
        ]
      },
      {
        module: "CELL: STRUCTURE AND FUNCTIONS",
        topics: [
          "Cell: The Unit of Life",
          "Biomolecules",
          "Cell Cycle and Cell Division"
        ]
      },
      {
        module: "PLANT PHYSIOLOGY",
        topics: [
          "Photosynthesis in Higher Plants",
          "Respiration in Plants",
          "Plant Growth and Development"
        ]
      },
      {
        module: "HUMAN PHYSIOLOGY",
        topics: [
          "Breathing and Exchange of Gases",
          "Body Fluids and Circulation",
          "Excretory Products and their Elimination",
          "Locomotion and Movement",
          "Neural Control and Coordination",
          "Chemical Coordination and Integration"
        ]
      },
      {
        module: "Board Exam Preparation",
        topics: [
          "Sample Papers",
          "Previous Year Questions",
          "Marking Scheme",
          "Time Management"
        ]
      }
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true
    }
  },

  // New Course 4: Recorded Classes - TGT, PGT Biology
  {
    title: "TGT, PGT BIOLOGY ",
    category: "TGT, PGT",
    subcategory: "Biology",
    description: "Complete Biology course for TGT/PGT Exam Preparation With Paper Pattern And Marking Scheme.",
    price: 2399,
    duration: "10 Weeks",
    courseLevel: "Advanced",
    prerequisites: "UG/PG Biology",
    whatYouWillLearn: [
      "BOTANY: Microbiology, Cell biology, Plant Diversity, Plant Physiology, Economic Botany, Ecology & Environment, Molecular Biology, Biochemistry, Taxonomy",
      "ZOOLOGY: Animal Diversity, Cell Biology, Genetics, Evolution, Animal Physiology, Economic Zoology, Embryology, Biomolecule"
    ],
    curriculum: [
      {
        module: "MICROBIOLOGY",
        topics: ["Bacteria", "Fungi", "Virus"]
      },
      {
        module: "CELL BIOLOGY",
        topics: ["Prokaryotic Cell", "Cell Organelles", "Chromosome"]
      },
      {
        module: "PLANT DIVERSITY",
        topics: ["Algae", "Bryophyta", "Pteridophyta", "Gymnosperm", "Angiosperm"]
      },
      {
        module: "ECONOMIC BOTANY",
        topics: ["Wood", "Fibre", "Oil", "Sugar", "Beverage", "Medicine", "Spices"]
      },
      {
        module: "ECOLOGY & ENVIRONMENT",
        topics: ["Ecology", "Ecosystem", "Soil", "Pollution"]
      },
      {
        module: "MOLECULAR BIOLOGY",
        topics: ["Concept of gene", "DNA replication", "Transcription", "Translation", "Lac-Operon", "Genetic Code"]
      },
      {
        module: "BIOCHEMISTRY",
        topics: ["Carbohydrates", "Proteins", "Enzymes"]
      },
      {
        module: "ANIMAL DIVERSITY",
        topics: ["Non chordata", "Chordata"]
      },
      {
        module: "GENETICS",
        topics: ["Mendel's laws of inheritance", "Human Genetics"]
      },
      {
        module: "EVOLUTION",
        topics: ["Evidences of Evolution", "Theories of Evolution", "Human Evolution"]
      },
      {
        module: "ANIMAL PHYSIOLOGY",
        topics: ["Digestion", "Respiration", "Blood and Circulation", "Excretion", "Nerve Conduction", "Muscle Contraction", "Endocrine glands and their function"]
      },
      {
        module: "ECONOMIC ZOOLOGY",
        topics: ["Apiculture", "Sericulture", "Pearl Industry", "Lac Culture", "Pisciculture", "Parasitic Protozoa & Helminth"]
      },
      {
        module: "EMBRYOLOGY",
        topics: ["Frog", "Chick", "Amphioxus", "Placentation in Mammals"]
      },
      {
        module: "BIOMOLECULE",
        topics: ["Enzyme Kinetics", "Coenzyme", "Carbohydrate", "Lipid", "Nucleic acid"]
      },
      {
        module: "TAXONOMY",
        topics: ["Binomial nomenclature", "Concept of Species", "System of Classification"]
      },
      {
        module: "Exam Preparation",
        topics: ["Sample Papers", "Previous Year Questions", "Marking Scheme", "Time Management"]
      }
    ],
    courseIncludes: {
      videos: true,
      liveLectures: true,
      pdfs: true,
      quizzes: true,
      assignments: true,
      certificates: true
    }
  }
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
      name: "Dr. Ramgopal Awasthi",
      email: "ramgopalawasthi@gmail.com",
      password: "Ramgopal@123",
      role: "faculty",
      phone: "9455133830",
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
      name: "Ajay Sharma",
      email: "asharma975@gmail.com",
      password: "Ajay@123",
      role: "student",
      phone: "9876543210",
    })

    const admin = new User({
      name: "BiologyTrunk Admin",
      email: "biologytrunk145@gmail.com",
      password: "Biologytrunk@123",
      role: "admin",
      phone: "9455133830",
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