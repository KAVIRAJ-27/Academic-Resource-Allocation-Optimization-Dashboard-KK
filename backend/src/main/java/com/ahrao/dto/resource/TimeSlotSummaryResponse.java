package com.ahrao.dto.resource;

import java.time.LocalTime;

public class TimeSlotSummaryResponse {
    private Long id;
    private String name;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;

    public TimeSlotSummaryResponse() {
    }

    public TimeSlotSummaryResponse(Long id, String name, String dayOfWeek, LocalTime startTime, LocalTime endTime, String status) {
        this.id = id;
        this.name = name;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
