package com.ahrao.dto.principal.dashboard;

import java.util.ArrayList;
import java.util.List;

public class PrincipalStudentOverviewDto {
    private long totalStudents;
    private long activeStudents;
    private long inactiveStudents;
    private List<DepartmentStudentCountDto> byDepartment = new ArrayList<>();
    private List<ProgramStudentCountDto> byProgram = new ArrayList<>();

    public PrincipalStudentOverviewDto() {
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getActiveStudents() {
        return activeStudents;
    }

    public void setActiveStudents(long activeStudents) {
        this.activeStudents = activeStudents;
    }

    public long getInactiveStudents() {
        return inactiveStudents;
    }

    public void setInactiveStudents(long inactiveStudents) {
        this.inactiveStudents = inactiveStudents;
    }

    public List<DepartmentStudentCountDto> getByDepartment() {
        return byDepartment;
    }

    public void setByDepartment(List<DepartmentStudentCountDto> byDepartment) {
        this.byDepartment = byDepartment;
    }

    public List<ProgramStudentCountDto> getByProgram() {
        return byProgram;
    }

    public void setByProgram(List<ProgramStudentCountDto> byProgram) {
        this.byProgram = byProgram;
    }

    public static class DepartmentStudentCountDto {
        private Long departmentId;
        private String departmentName;
        private String departmentCode;
        private long studentCount;

        public DepartmentStudentCountDto() {
        }

        public DepartmentStudentCountDto(Long departmentId, String departmentName, String departmentCode, long studentCount) {
            this.departmentId = departmentId;
            this.departmentName = departmentName;
            this.departmentCode = departmentCode;
            this.studentCount = studentCount;
        }

        public Long getDepartmentId() {
            return departmentId;
        }

        public void setDepartmentId(Long departmentId) {
            this.departmentId = departmentId;
        }

        public String getDepartmentName() {
            return departmentName;
        }

        public void setDepartmentName(String departmentName) {
            this.departmentName = departmentName;
        }

        public String getDepartmentCode() {
            return departmentCode;
        }

        public void setDepartmentCode(String departmentCode) {
            this.departmentCode = departmentCode;
        }

        public long getStudentCount() {
            return studentCount;
        }

        public void setStudentCount(long studentCount) {
            this.studentCount = studentCount;
        }
    }

    public static class ProgramStudentCountDto {
        private Long programId;
        private String programName;
        private String programCode;
        private long studentCount;

        public ProgramStudentCountDto() {
        }

        public ProgramStudentCountDto(Long programId, String programName, String programCode, long studentCount) {
            this.programId = programId;
            this.programName = programName;
            this.programCode = programCode;
            this.studentCount = studentCount;
        }

        public Long getProgramId() {
            return programId;
        }

        public void setProgramId(Long programId) {
            this.programId = programId;
        }

        public String getProgramName() {
            return programName;
        }

        public void setProgramName(String programName) {
            this.programName = programName;
        }

        public String getProgramCode() {
            return programCode;
        }

        public void setProgramCode(String programCode) {
            this.programCode = programCode;
        }

        public long getStudentCount() {
            return studentCount;
        }

        public void setStudentCount(long studentCount) {
            this.studentCount = studentCount;
        }
    }
}
