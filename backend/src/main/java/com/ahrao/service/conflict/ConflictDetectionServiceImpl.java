package com.ahrao.service.conflict;

import com.ahrao.dto.conflict.ConflictCheckRequestDto;
import com.ahrao.dto.conflict.ConflictResultDto;
import com.ahrao.entity.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ConflictDetectionServiceImpl implements ConflictDetectionService {

    private static final Logger log = LoggerFactory.getLogger(ConflictDetectionServiceImpl.class);

    private final AcademicConflictValidator academicConflictValidator;
    private final HostelConflictValidator hostelConflictValidator;

    public ConflictDetectionServiceImpl(
            AcademicConflictValidator academicConflictValidator,
            HostelConflictValidator hostelConflictValidator) {
        this.academicConflictValidator = academicConflictValidator;
        this.hostelConflictValidator = hostelConflictValidator;
    }

    @Override
    public ConflictResultDto detectAcademicConflicts(ConflictCheckRequestDto request, User actor) {
        log.debug("Evaluating academic resource allocation constraints for request: resourceId={}, requestId={}, actor={}",
                request != null ? request.getResourceId() : null,
                request != null ? request.getRequestId() : null,
                actor != null ? actor.getEmail() : "anonymous");

        ConflictResultDto result = academicConflictValidator.validate(request, actor);

        if (result.isHasConflict()) {
            log.info("Academic allocation conflicts detected: count={}, severity={}",
                    result.getTotalConflicts(), result.getSeverity());
        }

        return result;
    }

    @Override
    public ConflictResultDto detectHostelConflicts(ConflictCheckRequestDto request, User actor) {
        log.debug("Evaluating hostel allocation constraints for request: studentId={}, bedId={}, hostelId={}, actor={}",
                request != null ? request.getStudentId() : null,
                request != null ? request.getBedId() : null,
                request != null ? request.getHostelId() : null,
                actor != null ? actor.getEmail() : "anonymous");

        ConflictResultDto result = hostelConflictValidator.validate(request, actor);

        if (result.isHasConflict()) {
            log.info("Hostel allocation conflicts detected: count={}, severity={}",
                    result.getTotalConflicts(), result.getSeverity());
        }

        return result;
    }
}
