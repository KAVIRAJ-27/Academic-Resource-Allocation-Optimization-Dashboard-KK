package com.ahrao.service.optimization;

import com.ahrao.dto.optimization.AcademicOptimizationRequestDto;
import com.ahrao.dto.optimization.OptimizationResultDto;
import com.ahrao.entity.user.User;

public interface AcademicAllocationOptimizer {
    OptimizationResultDto optimizeAcademicAllocation(AcademicOptimizationRequestDto request, User actor);
}
