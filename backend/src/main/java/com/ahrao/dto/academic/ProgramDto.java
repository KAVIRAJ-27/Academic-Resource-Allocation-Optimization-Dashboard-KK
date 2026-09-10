package com.ahrao.dto.academic;

import com.ahrao.entity.enums.DegreeType;

public class ProgramDto {
    private Long id;
    private Long departmentId;
    private String name;
    private String code;
    private DegreeType degreeType;
    private Integer durationYears;
    private String status;

    public ProgramDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public DegreeType getDegreeType() { return degreeType; }
    public void setDegreeType(DegreeType degreeType) { this.degreeType = degreeType; }

    public Integer getDurationYears() { return durationYears; }
    public void setDurationYears(Integer durationYears) { this.durationYears = durationYears; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
