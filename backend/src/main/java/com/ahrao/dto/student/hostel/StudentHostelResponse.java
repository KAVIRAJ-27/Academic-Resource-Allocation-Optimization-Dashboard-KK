package com.ahrao.dto.student.hostel;

import java.util.ArrayList;
import java.util.List;

public class StudentHostelResponse {
    private boolean allocated;
    private StudentHostelAllocationDto currentAllocation;
    private StudentHostelDetailsDto hostel;
    private StudentHostelBlockDto block;
    private StudentHostelFloorDto floor;
    private StudentHostelRoomDto room;
    private StudentHostelBedDto bed;
    private List<StudentHostelFacilityDto> facilities = new ArrayList<>();
    private List<StudentHostelWardenDto> wardens = new ArrayList<>();
    private List<StudentHostelAllocationHistoryDto> history = new ArrayList<>();

    public StudentHostelResponse() {
    }

    public boolean isAllocated() {
        return allocated;
    }

    public void setAllocated(boolean allocated) {
        this.allocated = allocated;
    }

    public StudentHostelAllocationDto getCurrentAllocation() {
        return currentAllocation;
    }

    public void setCurrentAllocation(StudentHostelAllocationDto currentAllocation) {
        this.currentAllocation = currentAllocation;
    }

    public StudentHostelDetailsDto getHostel() {
        return hostel;
    }

    public void setHostel(StudentHostelDetailsDto hostel) {
        this.hostel = hostel;
    }

    public StudentHostelBlockDto getBlock() {
        return block;
    }

    public void setBlock(StudentHostelBlockDto block) {
        this.block = block;
    }

    public StudentHostelFloorDto getFloor() {
        return floor;
    }

    public void setFloor(StudentHostelFloorDto floor) {
        this.floor = floor;
    }

    public StudentHostelRoomDto getRoom() {
        return room;
    }

    public void setRoom(StudentHostelRoomDto room) {
        this.room = room;
    }

    public StudentHostelBedDto getBed() {
        return bed;
    }

    public void setBed(StudentHostelBedDto bed) {
        this.bed = bed;
    }

    public List<StudentHostelFacilityDto> getFacilities() {
        return facilities;
    }

    public void setFacilities(List<StudentHostelFacilityDto> facilities) {
        this.facilities = facilities;
    }

    public List<StudentHostelWardenDto> getWardens() {
        return wardens;
    }

    public void setWardens(List<StudentHostelWardenDto> wardens) {
        this.wardens = wardens;
    }

    public List<StudentHostelAllocationHistoryDto> getHistory() {
        return history;
    }

    public void setHistory(List<StudentHostelAllocationHistoryDto> history) {
        this.history = history;
    }
}
