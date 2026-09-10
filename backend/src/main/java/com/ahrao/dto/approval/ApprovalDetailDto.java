package com.ahrao.dto.approval;

import com.ahrao.dto.conflict.ConflictResultDto;

import java.util.ArrayList;
import java.util.List;

public class ApprovalDetailDto extends ApprovalSummaryDto {

    private String description;
    private String priority;

    // Academic specific details
    private String startTime;
    private String endTime;
    private Integer quantity;
    private String facultyName;
    private String sectionName;
    private String subjectName;
    private String semesterName;
    private String academicYearName;

    // Hostel specific details
    private String studentName;
    private String studentRollNumber;
    private String studentGender;
    private String blockName;
    private String floorNumber;
    private String bedNumber;
    private String startDate;
    private String endDate;

    // Recommended candidate details (from Phase 31 or request selection)
    private Long candidateId;
    private String candidateName;
    private String candidateCode;
    private String candidateType;
    private Integer candidateCapacity;
    private String candidateLocation;
    private Double recommendationScore;

    // Real-time live Phase 30 Conflict check
    private ConflictResultDto liveConflictCheck;

    // Boolean flag indicating if current user has permission to approve
    private boolean canApprove;
    private String cannotApproveReason;

    // Lifecycle timeline milestones
    private List<AllocationTimelineItemDto> timeline = new ArrayList<>();

    public ApprovalDetailDto() {
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSemesterName() {
        return semesterName;
    }

    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }

    public String getAcademicYearName() {
        return academicYearName;
    }

    public void setAcademicYearName(String academicYearName) {
        this.academicYearName = academicYearName;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentRollNumber() {
        return studentRollNumber;
    }

    public void setStudentRollNumber(String studentRollNumber) {
        this.studentRollNumber = studentRollNumber;
    }

    public String getStudentGender() {
        return studentGender;
    }

    public void setStudentGender(String studentGender) {
        this.studentGender = studentGender;
    }

    public String getBlockName() {
        return blockName;
    }

    public void setBlockName(String blockName) {
        this.blockName = blockName;
    }

    public String getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(String floorNumber) {
        this.floorNumber = floorNumber;
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

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCandidateCode() {
        return candidateCode;
    }

    public void setCandidateCode(String candidateCode) {
        this.candidateCode = candidateCode;
    }

    public String getCandidateType() {
        return candidateType;
    }

    public void setCandidateType(String candidateType) {
        this.candidateType = candidateType;
    }

    public Integer getCandidateCapacity() {
        return candidateCapacity;
    }

    public void setCandidateCapacity(Integer candidateCapacity) {
        this.candidateCapacity = candidateCapacity;
    }

    public String getCandidateLocation() {
        return candidateLocation;
    }

    public void setCandidateLocation(String candidateLocation) {
        this.candidateLocation = candidateLocation;
    }

    public Double getRecommendationScore() {
        return recommendationScore;
    }

    public void setRecommendationScore(Double recommendationScore) {
        this.recommendationScore = recommendationScore;
    }

    public ConflictResultDto getLiveConflictCheck() {
        return liveConflictCheck;
    }

    public void setLiveConflictCheck(ConflictResultDto liveConflictCheck) {
        this.liveConflictCheck = liveConflictCheck;
    }

    public boolean isCanApprove() {
        return canApprove;
    }

    public void setCanApprove(boolean canApprove) {
        this.canApprove = canApprove;
    }

    public String getCannotApproveReason() {
        return cannotApproveReason;
    }

    public void setCannotApproveReason(String cannotApproveReason) {
        this.cannotApproveReason = cannotApproveReason;
    }

    public List<AllocationTimelineItemDto> getTimeline() {
        return timeline;
    }

    public void setTimeline(List<AllocationTimelineItemDto> timeline) {
        this.timeline = timeline;
    }
}
