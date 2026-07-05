package com.example.student_management.bootstrap;

import com.example.student_management.entity.Student;
import com.example.student_management.entity.Result;
import com.example.student_management.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final StudentRepository studentRepository;

    @Autowired
    public DataSeeder(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (studentRepository.count() > 0) {
            System.out.println("Database already populated. Skipping seeding.");
            return;
        }

        System.out.println("Seeding database with mock student records...");

        String[] batches = {
            "2017-2021", "2018-2022", "2019-2023", "2020-2024",
            "2021-2025", "2022-2026", "2023-2027"
        };

        String[] branches = {
            "CSE", "CSEBCT", "IT", "AIDS", "AIML", "ECE", "CIVIL", "MECHANICAL", "ELECTRICAL"
        };

        String[] firstNames = {
            "Amit", "Neha", "Rahul", "Sneha", "Aarav", "Priya", "Vikram", "Arjun", "Ananya", "Rohan",
            "Vijay", "Kavya", "Ishaan", "Siddharth", "Riya", "Aditya", "Kabir", "Divya", "Suresh", "Meera",
            "Rajesh", "Pooja", "Anil", "Sunita", "Deepak", "Kiran", "Sanjay", "Jyoti", "Alok", "Ritu"
        };

        String[] lastNames = {
            "Sharma", "Verma", "Gupta", "Patel", "Singh", "Nair", "Reddy", "Sen", "Joshi", "Das",
            "Mishra", "Kumar", "Prasad", "Rao", "Jha", "Bose", "Mehta", "Bahl", "Malhotra", "Bhat",
            "Pillai", "Shetty", "Gowda", "Naidu", "Roy", "Banerjee", "Chatterjee", "Saxena", "Kapoor", "Choudhury"
        };

        List<Student> mockStudents = new ArrayList<>();

        for (String batch : batches) {
            String startYear = batch.substring(0, 4);
            for (String branch : branches) {
                String branchCode = getBranchCode(branch);
                
                for (int roll = 1; roll <= 10; roll++) {
                    String id = startYear + branchCode + (100 + roll);
                    
                    // Generate pseudo-random distinct name combinations based on batch, branch and roll hashes
                    int baseHash = Math.abs((batch + branch).hashCode() + roll);
                    String firstName = firstNames[baseHash % firstNames.length];
                    String lastName = lastNames[(baseHash + roll) % lastNames.length];
                    
                    String email = firstName.toLowerCase() + "." + lastName.toLowerCase() + startYear.substring(2) + (100 + roll) + "@university.edu";
                    String phone = generatePhoneNumber(startYear, branchCode, roll);
                    
                    Student student = new Student(id, firstName, lastName, email, phone, branch, batch);
                    
                    // Set GPA and Attendance
                    double gpaVal = Math.round((7.0 + (baseHash % 29) * 0.1) * 100.0) / 100.0;
                    double attendanceVal = 80.0 + (baseHash % 19);
                    student.setGpa(gpaVal);
                    student.setAttendance(attendanceVal);
                    
                    // Generate Results
                    student.setResults(generateResultsForStudent(student));
                    
                    mockStudents.add(student);
                }
            }
        }

        studentRepository.saveAll(mockStudents);
        System.out.println("Successfully seeded " + mockStudents.size() + " student records with results!");
    }

    private String getBranchCode(String branch) {
        switch (branch) {
            case "CSE": return "CS";
            case "CSEBCT": return "CB";
            case "IT": return "IT";
            case "AIDS": return "AD";
            case "AIML": return "AL";
            case "ECE": return "EC";
            case "CIVIL": return "CE";
            case "MECHANICAL": return "ME";
            case "ELECTRICAL": return "EE";
            default: return branch;
        }
    }

    private String generatePhoneNumber(String year, String code, int index) {
        long seed = (long) (year + code + index).hashCode();
        java.util.Random rand = new java.util.Random(seed);
        long num = 7000000000L + rand.nextInt(290000000); // Standard Indian 10-digit mobile number
        return String.valueOf(num);
    }

    private List<Result> generateResultsForStudent(Student student) {
        List<Result> results = new ArrayList<>();
        String branch = student.getBranch();
        int seed = Math.abs(student.getRegistrationId().hashCode());
        
        String[][] courses;
        if ("CSE".equals(branch) || "CSEBCT".equals(branch)) {
            courses = new String[][] {
                {"Data Structures & Algorithms", "CS201", "4"},
                {"Database Management Systems", "CS202", "4"},
                {"Discrete Mathematics", "CS203", "3"},
                {"Object Oriented Programming", "CS204", "3"},
                {"Digital Electronics Lab", "CS205L", "1"}
            };
        } else if ("IT".equals(branch)) {
            courses = new String[][] {
                {"Software Engineering", "IT201", "4"},
                {"Web Application Development", "IT202", "4"},
                {"Operating Systems Principles", "IT203", "3"},
                {"Computer Communication Networks", "IT204", "3"},
                {"Linux Operations Lab", "IT205L", "1"}
            };
        } else if ("AIDS".equals(branch) || "AIML".equals(branch)) {
            courses = new String[][] {
                {"Machine Learning Foundation", "AI201", "4"},
                {"Data Visualization Techniques", "AI202", "3"},
                {"Linear Algebra & Optimization", "AI203", "4"},
                {"Python for AI Lab", "AI204L", "2"},
                {"Ethics in AI Practices", "AI205", "1"}
            };
        } else if ("ECE".equals(branch)) {
            courses = new String[][] {
                {"Microprocessors & Controllers", "EC201", "4"},
                {"Analog Electronic Circuits", "EC202", "4"},
                {"Signals & Systems Analysis", "EC203", "3"},
                {"Electromagnetic Field Theory", "EC204", "3"},
                {"Digital System Design Lab", "EC205L", "1"}
            };
        } else if ("CIVIL".equals(branch)) {
            courses = new String[][] {
                {"Structural Analysis I", "CE201", "4"},
                {"Geotechnical Engineering", "CE202", "4"},
                {"Fluid Mechanics & Hydraulics", "CE203", "3"},
                {"Building Materials & Layout", "CE204", "3"},
                {"Surveying Field Practice Lab", "CE205L", "1"}
            };
        } else if ("MECHANICAL".equals(branch)) {
            courses = new String[][] {
                {"Thermodynamics Foundation", "ME201", "4"},
                {"Strength of Materials", "ME202", "4"},
                {"Fluid Mechanics & Machinery", "ME203", "3"},
                {"Kinematics of Machinery", "ME204", "3"},
                {"CAD Modeling Laboratory", "ME205L", "1"}
            };
        } else if ("ELECTRICAL".equals(branch)) {
            courses = new String[][] {
                {"Electrical Machines I", "EE201", "4"},
                {"Network Analysis & Synthesis", "EE202", "4"},
                {"Control Systems Engineering", "EE203", "3"},
                {"Power Systems Generation", "EE204", "3"},
                {"Electrical Engineering Lab", "EE205L", "1"}
            };
        } else {
            courses = new String[][] {
                {"Core Mathematics II", "MA102", "4"},
                {"Advanced Physics", "PH101", "3"},
                {"Environmental Sciences", "EV100", "2"}
            };
        }

        for (int i = 0; i < courses.length; i++) {
            String[] c = courses[i];
            String grade = getGradeForScore(80 + ((seed + i) % 19));
            results.add(new Result(student, c[0], c[1], Integer.parseInt(c[2]), grade));
        }
        return results;
    }

    private String getGradeForScore(int score) {
        if (score >= 95) return "O";
        if (score >= 90) return "A+";
        if (score >= 85) return "A";
        if (score >= 80) return "B+";
        if (score >= 75) return "B";
        return "C";
    }
}
