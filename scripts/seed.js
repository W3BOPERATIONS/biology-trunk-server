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
  // Class 9
  {
    title: "Class 9 - Mathematics",
    category: "Class 9",
    subcategory: "Mathematics",
    description: "Complete mathematics course for Class 9 including Algebra, Geometry, and Trigonometry",
    price: 1999,
  },
  {
    title: "Class 9 - Science",
    category: "Class 9",
    subcategory: "Science",
    description: "Comprehensive science course covering Physics, Chemistry, and Biology",
    price: 1999,
  },
  {
    title: "Class 9 - English",
    category: "Class 9",
    subcategory: "English",
    description: "English language and literature course for Class 9",
    price: 999,
  },
  {
    title: "Class 9 - Hindi",
    category: "Class 9",
    subcategory: "Hindi",
    description: "Hindi language and literature course for Class 9",
    price: 999,
  },

  // Class 10
  {
    title: "Class 10 - Mathematics",
    category: "Class 10",
    subcategory: "Mathematics",
    description: "Complete mathematics course for Class 10 board exams",
    price: 2499,
  },
  {
    title: "Class 10 - Science",
    category: "Class 10",
    subcategory: "Science",
    description: "Science course for Class 10 board exams",
    price: 2499,
  },
  {
    title: "Class 10 - Social Studies",
    category: "Class 10",
    subcategory: "Social Studies",
    description: "Social Studies course for Class 10",
    price: 1499,
  },
  {
    title: "Class 10 - English",
    category: "Class 10",
    subcategory: "English",
    description: "English course for Class 10 board exams",
    price: 1499,
  },

  // Class 11
  {
    title: "Class 11 - Physics",
    category: "Class 11",
    subcategory: "Physics",
    description: "Advanced physics course for Class 11",
    price: 2999,
  },
  {
    title: "Class 11 - Chemistry",
    category: "Class 11",
    subcategory: "Chemistry",
    description: "Advanced chemistry course for Class 11",
    price: 2999,
  },
  {
    title: "Class 11 - Mathematics",
    category: "Class 11",
    subcategory: "Mathematics",
    description: "Advanced mathematics course for Class 11",
    price: 2999,
  },
  {
    title: "Class 11 - Biology",
    category: "Class 11",
    subcategory: "Biology",
    description: "Advanced biology course for Class 11",
    price: 2999,
  },

  // Class 12
  {
    title: "Class 12 - Physics",
    category: "Class 12",
    subcategory: "Physics",
    description: "Advanced physics course for Class 12 board exams",
    price: 3499,
  },
  {
    title: "Class 12 - Chemistry",
    category: "Class 12",
    subcategory: "Chemistry",
    description: "Advanced chemistry course for Class 12 board exams",
    price: 3499,
  },
  {
    title: "Class 12 - Mathematics",
    category: "Class 12",
    subcategory: "Mathematics",
    description: "Advanced mathematics course for Class 12 board exams",
    price: 3499,
  },
  {
    title: "Class 12 - Biology",
    category: "Class 12",
    subcategory: "Biology",
    description: "Advanced biology course for Class 12 board exams",
    price: 3499,
  },

  // JEE
  {
    title: "JEE Main - Physics",
    category: "JEE",
    subcategory: "Physics",
    description: "Comprehensive JEE Main physics course with all topics and mock tests",
    price: 4999,
  },
  {
    title: "JEE Main - Chemistry",
    category: "JEE",
    subcategory: "Chemistry",
    description: "Comprehensive JEE Main chemistry course",
    price: 4999,
  },
  {
    title: "JEE Main - Mathematics",
    category: "JEE",
    subcategory: "Mathematics",
    description: "Comprehensive JEE Main mathematics course",
    price: 4999,
  },
  {
    title: "JEE Advanced - Physics",
    category: "JEE",
    subcategory: "Physics",
    description: "Advanced physics course for JEE Advanced",
    price: 5999,
  },
  {
    title: "JEE Advanced - Chemistry",
    category: "JEE",
    subcategory: "Chemistry",
    description: "Advanced chemistry course for JEE Advanced",
    price: 5999,
  },
  {
    title: "JEE Advanced - Mathematics",
    category: "JEE",
    subcategory: "Mathematics",
    description: "Advanced mathematics course for JEE Advanced",
    price: 5999,
  },

  // NEET
  {
    title: "NEET - Physics",
    category: "NEET",
    subcategory: "Physics",
    description: "Comprehensive physics course for NEET exam preparation",
    price: 4999,
  },
  {
    title: "NEET - Chemistry",
    category: "NEET",
    subcategory: "Chemistry",
    description: "Comprehensive chemistry course for NEET exam",
    price: 4999,
  },
  {
    title: "NEET - Biology",
    category: "NEET",
    subcategory: "Biology",
    description: "Comprehensive biology course for NEET exam",
    price: 4999,
  },

  // AIIMS Paramedical
  {
    title: "AIIMS Paramedical - Physics",
    category: "AIIMS Paramedical",
    subcategory: "Physics",
    description: "Complete physics course for AIIMS Paramedical entrance exams",
    price: 3999,
  },
  {
    title: "AIIMS Paramedical - Chemistry",
    category: "AIIMS Paramedical",
    subcategory: "Chemistry",
    description: "Complete chemistry course for AIIMS Paramedical entrance exams",
    price: 3999,
  },
  {
    title: "AIIMS Paramedical - Biology",
    category: "AIIMS Paramedical",
    subcategory: "Biology",
    description: "Complete biology course for AIIMS Paramedical entrance exams",
    price: 3999,
  },

  // Nursing Entrance
  {
    title: "Nursing Entrance - Physics",
    category: "Nursing Entrance",
    subcategory: "Physics",
    description: "Physics course for Nursing entrance exams",
    price: 2999,
  },
  {
    title: "Nursing Entrance - Chemistry",
    category: "Nursing Entrance",
    subcategory: "Chemistry",
    description: "Chemistry course for Nursing entrance exams",
    price: 2999,
  },
  {
    title: "Nursing Entrance - Biology",
    category: "Nursing Entrance",
    subcategory: "Biology",
    description: "Biology course for Nursing entrance exams",
    price: 2999,
  },

  // CUET (UG)
  {
    title: "CUET (UG) - Mathematics",
    category: "CUET (UG)",
    subcategory: "Mathematics",
    description: "Mathematics course for CUET Undergraduate entrance exam",
    price: 3499,
  },
  {
    title: "CUET (UG) - Physics",
    category: "CUET (UG)",
    subcategory: "Physics",
    description: "Physics course for CUET Undergraduate entrance exam",
    price: 3499,
  },
  {
    title: "CUET (UG) - Chemistry",
    category: "CUET (UG)",
    subcategory: "Chemistry",
    description: "Chemistry course for CUET Undergraduate entrance exam",
    price: 3499,
  },
  {
    title: "CUET (UG) - Biology",
    category: "CUET (UG)",
    subcategory: "Biology",
    description: "Biology course for CUET Undergraduate entrance exam",
    price: 3499,
  },

  // TGT/PGT Preparation
  {
    title: "TGT Preparation - Science",
    category: "TGT/PGT",
    subcategory: "Science",
    description: "Complete TGT (Trained Graduate Teacher) preparation course",
    price: 4499,
  },
  {
    title: "PGT Preparation - Physics",
    category: "TGT/PGT",
    subcategory: "Physics",
    description: "PGT (Post Graduate Teacher) Physics preparation course",
    price: 4999,
  },
  {
    title: "PGT Preparation - Chemistry",
    category: "TGT/PGT",
    subcategory: "Chemistry",
    description: "PGT (Post Graduate Teacher) Chemistry preparation course",
    price: 4999,
  },
  {
    title: "PGT Preparation - Mathematics",
    category: "TGT/PGT",
    subcategory: "Mathematics",
    description: "PGT (Post Graduate Teacher) Mathematics preparation course",
    price: 4999,
  },

  // KVS/NVS Preparation
  {
    title: "KVS/NVS - Teaching Methodology",
    category: "KVS/NVS",
    subcategory: "Teaching",
    description: "Teaching methodology and pedagogy for KVS/NVS exams",
    price: 3999,
  },
  {
    title: "KVS/NVS - Subject Specialization",
    category: "KVS/NVS",
    subcategory: "Subject",
    description: "Subject specialization course for KVS/NVS teaching exams",
    price: 3999,
  },

  // NET & GATE
  {
    title: "NET - Chemical Sciences",
    category: "NET & GATE",
    subcategory: "Chemical Sciences",
    description: "NET (National Eligibility Test) preparation for Chemical Sciences",
    price: 5999,
  },
  {
    title: "GATE - Life Sciences",
    category: "NET & GATE",
    subcategory: "Life Sciences",
    description: "GATE (Graduate Aptitude Test) preparation for Life Sciences",
    price: 5999,
  },

  // KYPS Olympiad
  {
    title: "KYPS Olympiad - Science",
    category: "KYPS Olympiad",
    subcategory: "Science",
    description: "KYPS (Kishore Vaigyanik Protsahan Yojana) Olympiad preparation",
    price: 2999,
  },
  {
    title: "KYPS Olympiad - Mathematics",
    category: "KYPS Olympiad",
    subcategory: "Mathematics",
    description: "KYPS Mathematics Olympiad preparation course",
    price: 2999,
  },

  // Foreign Language Courses
  {
    title: "German Language - Beginner",
    category: "Foreign Languages",
    subcategory: "German",
    description: "German language course for beginners",
    price: 1999,
  },
  {
    title: "French Language - Beginner",
    category: "Foreign Languages",
    subcategory: "French",
    description: "French language course for beginners",
    price: 1999,
  },
  {
    title: "Japanese Language - Beginner",
    category: "Foreign Languages",
    subcategory: "Japanese",
    description: "Japanese language course for beginners",
    price: 1999,
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
        "IIT Delhi Alumni"
      ],
      experience: "15+ years of teaching experience in Chemistry and competitive exam preparation",
      specialization: ["Chemistry", "JEE", "NEET", "NET", "GATE"],
      achievements: [
        "Mentored 5000+ successful students",
        "100+ IIT selections",
        "50+ AIIMS selections",
        "Expert in competitive exam patterns"
      ]
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