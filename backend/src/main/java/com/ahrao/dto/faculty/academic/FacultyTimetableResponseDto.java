package com.ahrao.dto.faculty.academic;

import java.util.ArrayList;
import java.util.List;

public class FacultyTimetableResponseDto {

    private int totalEntriesCount;
    private int todayEntriesCount;
    private String todayDayOfWeek;
    private String todayDate;

    private List<FacultyTimetableEntryDto> todayEntries = new ArrayList<>();
    private List<FacultyTimetableEntryDto> entries = new ArrayList<>();

    public FacultyTimetableResponseDto() {
    }

    public int getTotalEntriesCount() {
        return totalEntriesCount;
    }

    public void setTotalEntriesCount(int totalEntriesCount) {
        this.totalEntriesCount = totalEntriesCount;
    }

    public int getTodayEntriesCount() {
        return todayEntriesCount;
    }

    public void setTodayEntriesCount(int todayEntriesCount) {
        this.todayEntriesCount = todayEntriesCount;
    }

    public String getTodayDayOfWeek() {
        return todayDayOfWeek;
    }

    public void setTodayDayOfWeek(String todayDayOfWeek) {
        this.todayDayOfWeek = todayDayOfWeek;
    }

    public String getTodayDate() {
        return todayDate;
    }

    public void setTodayDate(String todayDate) {
        this.todayDate = todayDate;
    }

    public List<FacultyTimetableEntryDto> getTodayEntries() {
        return todayEntries;
    }

    public void setTodayEntries(List<FacultyTimetableEntryDto> todayEntries) {
        this.todayEntries = todayEntries != null ? todayEntries : new ArrayList<>();
    }

    public List<FacultyTimetableEntryDto> getEntries() {
        return entries;
    }

    public void setEntries(List<FacultyTimetableEntryDto> entries) {
        this.entries = entries != null ? entries : new ArrayList<>();
    }
}
