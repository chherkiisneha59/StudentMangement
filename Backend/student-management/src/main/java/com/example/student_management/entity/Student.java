package com.example.student_management.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "student_info")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "s_id")
    @JsonProperty("sId")
    private Integer sId;

    @Column(name = "registration_id", nullable = false, unique = true, length = 30)
    @JsonProperty("registrationId")
    private String registrationId;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 20)
    private String lastName;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "branch", length = 20)
    private String branch;

    @Column(name = "batch", length = 20)
    private String batch;

    @Column(name = "gpa")
    private Double gpa;

    @Column(name = "attendance")
    private Double attendance;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Result> results = new ArrayList<>();

    // Constructors
    public Student() {
    }

    public Student(String registrationId, String firstName, String lastName, String email, String phone, String branch, String batch) {
        this.registrationId = registrationId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.branch = branch;
        this.batch = batch;
    }

    // Getters and Setters
    @JsonProperty("sId")
    public Integer getSId() {
        return sId;
    }

    @JsonProperty("sId")
    public void setSId(Integer sId) {
        this.sId = sId;
    }

    @JsonProperty("registrationId")
    public String getRegistrationId() {
        return registrationId;
    }

    @JsonProperty("registrationId")
    public void setRegistrationId(String registrationId) {
        this.registrationId = registrationId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public Double getGpa() {
        return gpa;
    }

    public void setGpa(Double gpa) {
        this.gpa = gpa;
    }

    public Double getAttendance() {
        return attendance;
    }

    public void setAttendance(Double attendance) {
        this.attendance = attendance;
    }

    public List<Result> getResults() {
        return results;
    }

    public void setResults(List<Result> results) {
        this.results = results;
    }
}
