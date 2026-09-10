package com.ahrao.dto.conflict;

import com.ahrao.entity.enums.ConflictSeverity;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class ConflictResultDto {
    private boolean hasConflict;
    private ConflictSeverity severity;
    private boolean canAllocate;
    private int totalConflicts;
    private List<ConflictItemDto> conflicts;
    private List<ConstraintResultDto> constraints;

    public ConflictResultDto() {
        this.hasConflict = false;
        this.canAllocate = true;
        this.totalConflicts = 0;
        this.conflicts = new ArrayList<>();
        this.constraints = new ArrayList<>();
    }

    public static ConflictResultDto valid() {
        ConflictResultDto result = new ConflictResultDto();
        result.setHasConflict(false);
        result.setCanAllocate(true);
        result.setSeverity(ConflictSeverity.INFO);
        result.setTotalConflicts(0);
        return result;
    }

    public static ConflictResultDto noConflict(List<ConstraintResultDto> constraints) {
        ConflictResultDto result = new ConflictResultDto();
        result.setHasConflict(false);
        result.setCanAllocate(true);
        result.setSeverity(ConflictSeverity.INFO);
        result.setConstraints(constraints != null ? constraints : new ArrayList<>());
        result.setTotalConflicts(0);
        return result;
    }

    public void addConflict(ConflictItemDto item) {
        if (this.conflicts == null) {
            this.conflicts = new ArrayList<>();
        }
        this.conflicts.add(item);
        this.hasConflict = true;
        this.totalConflicts = this.conflicts.size();

        // Update overall severity and canAllocate
        if (item.getSeverity() == ConflictSeverity.ERROR) {
            this.severity = ConflictSeverity.ERROR;
            this.canAllocate = false;
        } else if (item.getSeverity() == ConflictSeverity.WARNING && this.severity != ConflictSeverity.ERROR) {
            this.severity = ConflictSeverity.WARNING;
        } else if (this.severity == null) {
            this.severity = item.getSeverity();
        }
    }

    public void addConstraint(ConstraintResultDto constraint) {
        if (this.constraints == null) {
            this.constraints = new ArrayList<>();
        }
        this.constraints.add(constraint);
    }

    @JsonProperty("valid")
    public boolean isValid() {
        if (!canAllocate) {
            return false;
        }
        if (conflicts != null && !conflicts.isEmpty()) {
            return conflicts.stream().noneMatch(c -> c.getSeverity() == ConflictSeverity.ERROR);
        }
        return true;
    }

    public boolean isHasConflict() {
        return hasConflict;
    }

    public void setHasConflict(boolean hasConflict) {
        this.hasConflict = hasConflict;
    }

    public ConflictSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(ConflictSeverity severity) {
        this.severity = severity;
    }

    public boolean isCanAllocate() {
        return canAllocate;
    }

    public void setCanAllocate(boolean canAllocate) {
        this.canAllocate = canAllocate;
    }

    public int getTotalConflicts() {
        return totalConflicts;
    }

    public void setTotalConflicts(int totalConflicts) {
        this.totalConflicts = totalConflicts;
    }

    public List<ConflictItemDto> getConflicts() {
        return conflicts;
    }

    public void setConflicts(List<ConflictItemDto> conflicts) {
        this.conflicts = conflicts;
    }

    public List<ConstraintResultDto> getConstraints() {
        return constraints;
    }

    public void setConstraints(List<ConstraintResultDto> constraints) {
        this.constraints = constraints;
    }
}

