package com.example.student_management.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_info")
public class Student {

    @Id
    @Column(name = "s_id")
    private int sId;

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

    // Constructors
    public Student() {
    }

    public Student(int sId, String firstName, String lastName, String email, String phone, String branch) {
        this.sId = sId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.branch = branch;
    }

    // Getters and Setters
    public int getsId() {
        return sId;
    }

    public void setsId(int sId) {
        this.sId = sId;
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
}
