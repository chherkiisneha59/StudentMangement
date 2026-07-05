package com.example.student_management.repository;

import com.example.student_management.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {

    Optional<Student> findByRegistrationId(String registrationId);

    boolean existsByRegistrationId(String registrationId);

    Optional<Student> findByEmail(String email);

    Optional<Student> findByPhone(String phone);

    List<Student> findByBranch(String branch);

    List<Student> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}

