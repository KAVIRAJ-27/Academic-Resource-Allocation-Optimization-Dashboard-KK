package com.ahrao.entity.academic;

import com.ahrao.entity.BaseAuditableEntity;
import com.ahrao.entity.enums.DegreeType;
import jakarta.persistence.*;

@Entity
@Table(
    name = "programs",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_programs_dept_code", columnNames = {"department_id", "code"})
    }
)
public class Program extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "degree_type", nullable = false, length = 30)
    private DegreeType degreeType = DegreeType.B_TECH;

    @Column(name = "duration_years", nullable = false)
    private Integer durationYears = 4;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    public Program() {
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public DegreeType getDegreeType() {
        return degreeType;
    }

    public void setDegreeType(DegreeType degreeType) {
        this.degreeType = degreeType;
    }

    public Integer getDurationYears() {
        return durationYears;
    }

    public void setDurationYears(Integer durationYears) {
        this.durationYears = durationYears;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
