package com.ahrao.dto.warden;

public class WardenStudentSearchDto {
    private Long id;
    private String registerNumber;
    private String rollNumber;
    private String name;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long programId;
    private String programName;
    private String programCode;
    private String sectionName;
    private Integer admissionYear;
    private Integer currentSemester;
    private String studentStatus;
    private boolean hasActiveAllocation;
    private ActiveAllocationInfoDto activeAllocation;

    public WardenStudentSearchDto() {
    }

    public static class ActiveAllocationInfoDto {
        private Long allocationId;
        private Long hostelId;
        private String hostelName;
        private String blockName;
        private String roomNumber;
        private String bedNumber;
        private String startDate;
        private String status;

        public ActiveAllocationInfoDto() {
        }

        public Long getAllocationId() {
            return allocationId;
        }

        public void setAllocationId(Long allocationId) {
            this.allocationId = allocationId;
        }

        public Long getHostelId() {
            return hostelId;
        }

        public void setHostelId(Long hostelId) {
            this.hostelId = hostelId;
        }

        public String getHostelName() {
            return hostelName;
        }

        public void setHostelName(String hostelName) {
            this.hostelName = hostelName;
        }

        public String getBlockName() {
            return blockName;
        }

        public void setBlockName(String blockName) {
            this.blockName = blockName;
        }

        public String getRoomNumber() {
            return roomNumber;
        }

        public void setRoomNumber(String roomNumber) {
            this.roomNumber = roomNumber;
        }

        public String getBedNumber() {
            return bedNumber;
        }

        public void setBedNumber(String bedNumber) {
            this.bedNumber = bedNumber;
        }

        public String getStartDate() {
            return startDate;
        }

        public void setStartDate(String startDate) {
            this.startDate = startDate;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public Integer getAdmissionYear() {
        return admissionYear;
    }

    public void setAdmissionYear(Integer admissionYear) {
        this.admissionYear = admissionYear;
    }

    public Integer getCurrentSemester() {
        return currentSemester;
    }

    public void setCurrentSemester(Integer currentSemester) {
        this.currentSemester = currentSemester;
    }

    public String getStudentStatus() {
        return studentStatus;
    }

    public void setStudentStatus(String studentStatus) {
        this.studentStatus = studentStatus;
    }

    public boolean isHasActiveAllocation() {
        return hasActiveAllocation;
    }

    public void setHasActiveAllocation(boolean hasActiveAllocation) {
        this.hasActiveAllocation = hasActiveAllocation;
    }

    public ActiveAllocationInfoDto getActiveAllocation() {
        return activeAllocation;
    }

    public void setActiveAllocation(ActiveAllocationInfoDto activeAllocation) {
        this.activeAllocation = activeAllocation;
    }
}
