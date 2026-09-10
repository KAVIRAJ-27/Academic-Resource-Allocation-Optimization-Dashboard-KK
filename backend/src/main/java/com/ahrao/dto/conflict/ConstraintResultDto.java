package com.ahrao.dto.conflict;

import com.ahrao.entity.enums.ConflictSeverity;

public class ConstraintResultDto {
    private String constraint;
    private boolean passed;
    private ConflictSeverity severity;
    private String message;

    public ConstraintResultDto() {
    }

    public ConstraintResultDto(String constraint, boolean passed, ConflictSeverity severity, String message) {
        this.constraint = constraint;
        this.passed = passed;
        this.severity = severity;
        this.message = message;
    }

    public static ConstraintResultDto pass(String constraint, String message) {
        return new ConstraintResultDto(constraint, true, ConflictSeverity.INFO, message);
    }

    public static ConstraintResultDto fail(String constraint, ConflictSeverity severity, String message) {
        return new ConstraintResultDto(constraint, false, severity, message);
    }

    public String getConstraint() {
        return constraint;
    }

    public void setConstraint(String constraint) {
        this.constraint = constraint;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public ConflictSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(ConflictSeverity severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
