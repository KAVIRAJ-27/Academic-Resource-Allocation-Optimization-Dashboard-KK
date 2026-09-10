package com.ahrao.entity.academic;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "faculty_workloads")
public class FacultyWorkload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(name = "total_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal totalHours = BigDecimal.ZERO;

    @Column(name = "teaching_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal teachingHours = BigDecimal.ZERO;

    @Column(name = "lab_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal labHours = BigDecimal.ZERO;

    @Column(name = "other_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal otherHours = BigDecimal.ZERO;

    @Column(name = "workload_status", nullable = false, length = 30)
    private String workloadStatus = "BALANCED";

    @Column(name = "calculated_at", nullable = false)
    private Instant calculatedAt = Instant.now();

    public FacultyWorkload() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Faculty getFaculty() {
        return faculty;
    }

    public void setFaculty(Faculty faculty) {
        this.faculty = faculty;
    }

    public AcademicYear getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(AcademicYear academicYear) {
        this.academicYear = academicYear;
    }

    public Semester getSemester() {
        return semester;
    }

    public void setSemester(Semester semester) {
        this.semester = semester;
    }

    public BigDecimal getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(BigDecimal totalHours) {
        this.totalHours = totalHours;
    }

    public BigDecimal getTeachingHours() {
        return teachingHours;
    }

    public void setTeachingHours(BigDecimal teachingHours) {
        this.teachingHours = teachingHours;
    }

    public BigDecimal getLabHours() {
        return labHours;
    }

    public void setLabHours(BigDecimal labHours) {
        this.labHours = labHours;
    }

    public BigDecimal getOtherHours() {
        return otherHours;
    }

    public void setOtherHours(BigDecimal otherHours) {
        this.otherHours = otherHours;
    }

    public String getWorkloadStatus() {
        return workloadStatus;
    }

    public void setWorkloadStatus(String workloadStatus) {
        this.workloadStatus = workloadStatus;
    }

    public Instant getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(Instant calculatedAt) {
        this.calculatedAt = calculatedAt;
    }
}
