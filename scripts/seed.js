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

  // GUJCET
  {
    title: "GUJCET - Physics",
    category: "GUJCET",
    subcategory: "Physics",
    description: "Complete physics course for Gujarat Common Entrance Test",
    price: 3999,
  },
  {
    title: "GUJCET - Chemistry",
    category: "GUJCET",
    subcategory: "Chemistry",
    description: "Complete chemistry course for GUJCET",
    price: 3999,
  },
  {
    title: "GUJCET - Mathematics",
    category: "GUJCET",
    subcategory: "Mathematics",
    description: "Complete mathematics course for GUJCET",
    price: 3999,
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
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/edutech")
    console.log("MongoDB connected for seeding")

    // Clear existing data
    await User.deleteMany({})
    await Course.deleteMany({})
    console.log("Existing data cleared")

    const student = new User({
      name: "Ajay Jha",
      email: "ajha97575@gmail.com",
      password: "password123",
      role: "student",
      phone: "9876543210",
    })

    const faculty = new User({
      name: "Abhishek Jha",
      email: "abhishekjha2707@gmail.com",
      password: "faculty123",
      role: "faculty",
      phone: "9876543211",
    })

    const admin = new User({
      name: "Abhishek",
      email: "abhishek.flyanytrip@gmail.com",
      password: "admin123",
      role: "admin",
      phone: "9876543212",
    })

    await student.save()
    console.log("Student user created with hashed password")

    await faculty.save()
    console.log("Faculty user created with hashed password")

    await admin.save()
    console.log("Admin user created with hashed password")

    const coursesToCreate = courseData.map((course) => ({
      ...course,
      faculty: faculty._id,
      assignedTo: faculty.email,
      totalEnrolled: Math.floor(Math.random() * 50) + 5, // Add sample enrollment data
    }))

    await Course.insertMany(coursesToCreate)
    console.log(`Courses created and assigned to faculty (${coursesToCreate.length} courses)`)

    console.log("✓ Seeding completed successfully!")
    console.log("✓ All data saved to MongoDB")
    process.exit(0)
  } catch (error) {
    console.error("✗ Seeding failed:", error.message)
    process.exit(1)
  }
}

seed()
