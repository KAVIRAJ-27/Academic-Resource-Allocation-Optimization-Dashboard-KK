package com.ahrao.dto.warden;

import com.ahrao.entity.enums.HostelBedStatus;

public class WardenBedSummaryDto {
    private Long id;
    private String bedNumber;
    private HostelBedStatus status;
    private Long roomId;
    private String roomNumber;
    private Integer floorNumber;
    private String floorName;
    private Long blockId;
    private String blockName;
    private String blockCode;
    private Long hostelId;
    private String hostelName;
    private CurrentStudentAllocationDto currentStudent;

    public WardenBedSummaryDto() {
    }

    public static class CurrentStudentAllocationDto {
        private Long allocationId;
        private Long studentId;
        private String studentName;
        private String registerNumber;
        private String rollNumber;
        private String departmentName;
        private String programName;
        private String allocationStatus;
        private String startDate;
        private String endDate;

        public CurrentStudentAllocationDto() {
        }

        public Long getAllocationId() {
            return allocationId;
        }

        public void setAllocationId(Long allocationId) {
            this.allocationId = allocationId;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
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

        public String getDepartmentName() {
            return departmentName;
        }

        public void setDepartmentName(String departmentName) {
            this.departmentName = departmentName;
        }

        public String getProgramName() {
            return programName;
        }

        public void setProgramName(String programName) {
            this.programName = programName;
        }

        public String getAllocationStatus() {
            return allocationStatus;
        }

        public void setAllocationStatus(String allocationStatus) {
            this.allocationStatus = allocationStatus;
        }

        public String getStartDate() {
            return startDate;
        }

        public void setStartDate(String startDate) {
            this.startDate = startDate;
        }

        public String getEndDate() {
            return endDate;
        }

        public void setEndDate(String endDate) {
            this.endDate = endDate;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public HostelBedStatus getStatus() {
        return status;
    }

    public void setStatus(HostelBedStatus status) {
        this.status = status;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }

    public String getFloorName() {
        return floorName;
    }

    public void setFloorName(String floorName) {
        this.floorName = floorName;
    }

    public Long getBlockId() {
        return blockId;
    }

    public void setBlockId(Long blockId) {
        this.blockId = blockId;
    }

    public String getBlockName() {
        return blockName;
    }

    public void setBlockName(String blockName) {
        this.blockName = blockName;
    }

    public String getBlockCode() {
        return blockCode;
    }

    public void setBlockCode(String blockCode) {
        this.blockCode = blockCode;
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

    public CurrentStudentAllocationDto getCurrentStudent() {
        return currentStudent;
    }

    public void setCurrentStudent(CurrentStudentAllocationDto currentStudent) {
        this.currentStudent = currentStudent;
    }
}
