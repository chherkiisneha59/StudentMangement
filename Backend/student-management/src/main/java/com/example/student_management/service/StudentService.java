package com.example.student_management.service;

import com.example.student_management.entity.Student;
import com.example.student_management.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(int id) {
        return studentRepository.findById(id);
    }

    public Optional<Student> getStudentByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    public List<Student> getStudentsByBranch(String branch) {
        return studentRepository.findByBranch(branch);
    }

    public List<Student> searchStudents(String keyword) {
        return studentRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(keyword, keyword);
    }

    public Student createStudent(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new RuntimeException("Email already exists: " + student.getEmail());
        }
        if (student.getPhone() != null && studentRepository.existsByPhone(student.getPhone())) {
            throw new RuntimeException("Phone number already exists: " + student.getPhone());
        }
        return studentRepository.save(student);
    }

    public Student updateStudent(int id, Student updatedStudent) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        // Check email uniqueness if email is being updated
        if (!existingStudent.getEmail().equalsIgnoreCase(updatedStudent.getEmail()) 
                && studentRepository.existsByEmail(updatedStudent.getEmail())) {
            throw new RuntimeException("Email already exists: " + updatedStudent.getEmail());
        }

        // Check phone uniqueness if phone is being updated
        if (updatedStudent.getPhone() != null 
                && !updatedStudent.getPhone().equals(existingStudent.getPhone())
                && studentRepository.existsByPhone(updatedStudent.getPhone())) {
            throw new RuntimeException("Phone number already exists: " + updatedStudent.getPhone());
        }

        existingStudent.setFirstName(updatedStudent.getFirstName());
        existingStudent.setLastName(updatedStudent.getLastName());
        existingStudent.setEmail(updatedStudent.getEmail());
        existingStudent.setPhone(updatedStudent.getPhone());
        existingStudent.setBranch(updatedStudent.getBranch());

        return studentRepository.save(existingStudent);
    }

    public void deleteStudent(int id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }
}
