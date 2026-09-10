package com.ahrao.exception;

import com.ahrao.dto.conflict.ConflictItemDto;
import com.ahrao.dto.conflict.ConflictResultDto;

import java.util.ArrayList;
import java.util.List;

public class ConflictException extends RuntimeException {

    private final List<ConflictItemDto> conflicts;

    public ConflictException(String message) {
        super(message);
        this.conflicts = new ArrayList<>();
    }

    public ConflictException(String message, List<ConflictItemDto> conflicts) {
        super(message);
        this.conflicts = conflicts != null ? conflicts : new ArrayList<>();
    }

    public ConflictException(String message, ConflictResultDto conflictResult) {
        super(message);
        this.conflicts = (conflictResult != null && conflictResult.getConflicts() != null)
                ? conflictResult.getConflicts()
                : new ArrayList<>();
    }

    public List<ConflictItemDto> getConflicts() {
        return conflicts;
    }
}

